'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface ExpenseData {
  id: string
  amount: number
  convertedAmount: number
  category: string
  expenseDate: string
  status: string
  originalCurrency: string
}

interface ExpenseChartProps {
  expenses: ExpenseData[]
  type: 'bar' | 'pie' | 'line'
  currency: string
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5a2b', '#6366f1', '#ec4899']

const ExpenseChart = React.memo(({ expenses, type, currency }: ExpenseChartProps) => {
  // Memoize expensive calculations
  const { chartData, lineData } = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { chartData: [], lineData: [] }
    }

    // Process data for charts
    const categoryData = expenses.reduce((acc: any, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 }
      }
      acc[category].amount += expense.convertedAmount || 0
      acc[category].count += 1
      return acc
    }, {})

    const processedChartData = Object.values(categoryData).map((item: any) => ({
      name: item.category,
      amount: item.amount,
      count: item.count
    }))

    // Monthly data for line chart
    const monthlyData = expenses.reduce((acc: any, expense) => {
      const month = new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 }
      }
      acc[month].amount += expense.convertedAmount || 0
      acc[month].count += 1
      return acc
    }, {})

    const processedLineData = Object.values(monthlyData).sort((a: any, b: any) => 
      new Date(a.month + ' 01').getTime() - new Date(b.month + ' 01').getTime()
    )

    return { chartData: processedChartData, lineData: processedLineData }
  }, [expenses])

  const formatCurrency = useMemo(() => (value: number) => {
    return `${value.toFixed(2)} ${currency}`
  }, [currency])

  if (type === 'bar') {
    return (
      <div className="w-full h-80 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              fill="url(#barGradient)" 
              radius={[4, 4, 0, 0]}
              name="Amount"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-80 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              label={(entry: any) => `${entry.name}: ${formatCurrency(entry.amount as number)}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className="w-full h-80 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Expense Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              name="Amount"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
})

ExpenseChart.displayName = 'ExpenseChart'

export default ExpenseChart