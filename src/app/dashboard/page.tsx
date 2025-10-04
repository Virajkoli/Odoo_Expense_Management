'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react'
import axios from 'axios'
import { Receipt, Users, CheckSquare, TrendingUp, DollarSign, Calendar, Clock, ArrowUpRight, BarChart3, PieChart, LineChart, Eye, EyeOff } from 'lucide-react'
// Lazy load heavy components
const ExpenseChart = lazy(() => import('@/components/ui/ExpenseChart'))
const ExpenseCalendar = lazy(() => import('@/components/ui/ExpenseCalendar'))
const MiniCalendar = lazy(() => import('@/components/ui/MiniCalendar'))

// Regular imports for lightweight components
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import QuickExpenseModal from '@/components/ui/QuickExpenseModal'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import { useGSAPAnimation, animateElements } from '@/hooks/useGSAP'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'calendar'>('overview')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')
  const [showDetails, setShowDetails] = useState(true)
  const [showQuickExpense, setShowQuickExpense] = useState(false)

  const welcomeRef = useGSAPAnimation()
  const statsRef = useGSAPAnimation()
  const contentRef = useGSAPAnimation()

  // Optimized queries with better caching
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await axios.get('/api/expenses')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: async () => {
      const { data } = await axios.get('/api/approval-requests')
      return data.filter((req: any) => req.status === 'PENDING')
    },
    enabled: session?.user?.role !== 'EMPLOYEE',
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Memoized calculations to prevent unnecessary re-calculations
  const { totalAmount, monthlyExpenses, stats } = useMemo(() => {
    const expensesArray = Array.isArray(expenses) ? expenses : []
    const approvalsArray = Array.isArray(approvals) ? approvals : []
    
    const total = expensesArray.reduce((sum: number, expense: any) => sum + (expense.convertedAmount || 0), 0)
    
    const monthly = expensesArray.filter((expense: any) => {
      const expenseDate = new Date(expense.expenseDate)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    const calculatedStats = [
      {
        name: 'Total Expenses',
        value: expensesArray.length,
        icon: Receipt,
        gradient: 'from-blue-500 to-blue-600',
        change: '+12%',
        changeType: 'increase',
        description: 'All time expenses'
      },
      {
        name: 'Pending Approvals',
        value: approvalsArray.length,
        icon: Clock,
        gradient: 'from-yellow-500 to-orange-500',
        change: '-8%',
        changeType: 'decrease',
        description: 'Awaiting approval'
      },
      {
        name: 'This Month',
        value: monthly.length,
        icon: Calendar,
        gradient: 'from-green-500 to-emerald-600',
        change: '+23%',
        changeType: 'increase',
        description: 'Current month expenses'
      },
      {
        name: 'Total Amount',
        value: `${total.toFixed(2)}`,
        currency: session?.user?.companyCurrency || 'USD',
        icon: DollarSign,
        gradient: 'from-purple-500 to-pink-600',
        change: '+15%',
        changeType: 'increase',
        description: 'Total expense amount'
      },
    ]

    return { totalAmount: total, monthlyExpenses: monthly, stats: calculatedStats }
  }, [expenses, approvals, session?.user?.companyCurrency])

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: 'overview' | 'charts' | 'calendar') => {
    setActiveTab(tab)
  }, [])

  const handleChartTypeChange = useCallback((type: 'bar' | 'pie' | 'line') => {
    setChartType(type)
  }, [])

  const handleQuickExpenseSubmit = useCallback((data: any) => {
    console.log('Quick expense submitted:', data)
    // Here you would typically call your API to create the expense
  }, [])

  const handleShowQuickExpense = useCallback(() => {
    setShowQuickExpense(true)
  }, [])

  const handleCloseQuickExpense = useCallback(() => {
    setShowQuickExpense(false)
  }, [])

  const handleToggleDetails = useCallback(() => {
    setShowDetails(prev => !prev)
  }, [])

  // Optimized GSAP Animations with debouncing
  useEffect(() => {
    if (session && !expensesLoading) {
      const timer = setTimeout(() => {
        welcomeRef.fadeIn(0.1)
        statsRef.staggerChildren(0.2, 0.05)
        contentRef.slideInLeft(0.3)
        
        // Reduced animation delays for faster load
        animateElements('.stat-card', 'scaleIn', 0.1)
        animateElements('.table-row', 'fadeIn', 0.4)
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [session, activeTab, expensesLoading])

  // Memoized status badge function
  const getStatusBadgeStyles = useCallback((status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
      case 'REJECTED':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
      case 'PENDING':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
    }
  }, [])

  // Memoized tab button component
  const TabButton = useCallback(({ tab, label, icon: Icon }: { tab: string, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(tab as any)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  ), [activeTab, handleTabChange])

  // Memoized chart type buttons
  const ChartTypeButton = useCallback(({ type, icon: Icon, label }: { type: 'bar' | 'pie' | 'line', icon: any, label: string }) => (
    <button
      onClick={() => handleChartTypeChange(type)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        chartType === type ? 'bg-purple-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  ), [chartType, handleChartTypeChange])

  return (
    <div className="space-y-8 particle-bg">
      {/* Welcome Header */}
      <div ref={welcomeRef.elementRef} className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Here's an overview of your expense management dashboard
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <Users className="h-4 w-4" />
              <span className="text-sm capitalize">{session?.user?.role}</span>
            </div>
            <button 
              onClick={handleToggleDetails}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white/30 transition-all"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-sm">{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 justify-center">
        <TabButton tab="overview" label="Overview" icon={TrendingUp} />
        <TabButton tab="charts" label="Analytics" icon={BarChart3} />
        <TabButton tab="calendar" label="Calendar" icon={Calendar} />
      </div>

      {/* Stats Grid */}
      {expensesLoading || approvalsLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : (
        <div ref={statsRef.elementRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="stat-card relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] interactive-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <div className="flex items-baseline space-x-2">
                    {stat.currency ? (
                      <AnimatedCounter 
                        value={parseFloat(stat.value.toString())} 
                        duration={1.5}
                        suffix={` ${stat.currency}`}
                      />
                    ) : (
                      <AnimatedCounter 
                        value={parseInt(stat.value.toString())} 
                        duration={1.5}
                      />
                    )}
                  </div>
                  {showDetails && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                      <div className="flex items-center space-x-1">
                        <ArrowUpRight className={`h-3 w-3 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-xs font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">vs last month</span>
                      </div>
                    </>
                  )}
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Content based on active tab */}
      <div ref={contentRef.elementRef}>
        {activeTab === 'overview' && (
          expensesLoading ? (
            <LoadingSkeleton type="table" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Expenses Table */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                        Recent Expenses
                      </h3>
                      <button 
                        onClick={() => setActiveTab('charts')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Analytics
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-200/30">
                        {Array.isArray(expenses) && expenses.slice(0, 8).map((expense: any, index: number) => (
                          <tr 
                            key={expense.id} 
                            className="table-row hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-medium">
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span>{expense.convertedAmount?.toFixed(2)} {session?.user?.companyCurrency}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyles(expense.status)}`}>
                                {expense.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!Array.isArray(expenses) || expenses.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <Receipt className="h-12 w-12 text-gray-300" />
                                <p className="text-gray-500 text-sm">No expenses found</p>
                                <button 
                                  onClick={() => setShowQuickExpense(true)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                >
                                  Add your first expense
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mini Calendar */}
              <div className="lg:col-span-1">
                <Suspense fallback={<LoadingSkeleton type="chart" />}>
                  <MiniCalendar 
                    expenses={Array.isArray(expenses) ? expenses : []} 
                    currency={session?.user?.companyCurrency || 'USD'}
                    onDateSelect={(date) => {
                      handleTabChange('calendar')
                      // You could implement date navigation here
                    }}
                  />
                </Suspense>
              </div>
            </div>
          )
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Chart Type Selector */}
            <div className="flex justify-center space-x-4">
              <ChartTypeButton type="bar" icon={BarChart3} label="Bar Chart" />
              <ChartTypeButton type="pie" icon={PieChart} label="Pie Chart" />
              <ChartTypeButton type="line" icon={LineChart} label="Line Chart" />
            </div>

            {/* Chart Container */}
            <div className="chart-container">
              {expensesLoading ? (
                <LoadingSkeleton type="chart" />
              ) : (
                <Suspense fallback={<LoadingSkeleton type="chart" />}>
                  <ExpenseChart 
                    expenses={Array.isArray(expenses) ? expenses : []} 
                    type={chartType} 
                    currency={session?.user?.companyCurrency || 'USD'} 
                  />
                </Suspense>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="w-full">
            {expensesLoading ? (
              <LoadingSkeleton type="chart" />
            ) : (
              <Suspense fallback={<LoadingSkeleton type="chart" />}>
                <ExpenseCalendar 
                  expenses={Array.isArray(expenses) ? expenses : []} 
                  currency={session?.user?.companyCurrency || 'USD'} 
                />
              </Suspense>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onQuickExpense={handleShowQuickExpense}
        onViewAnalytics={() => handleTabChange('charts')}
        onViewCalendar={() => handleTabChange('calendar')}
      />

      {/* Quick Expense Modal */}
      <QuickExpenseModal 
        isOpen={showQuickExpense}
        onClose={handleCloseQuickExpense}
        onSubmit={handleQuickExpenseSubmit}
      />
    </div>
  )
}
