'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { Calendar as CalendarIcon, Filter, Download, Plus, TrendingUp, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface ExpenseEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    amount: number
    category: string
    status: string
    currency: string
    description?: string
  }
}

interface ExpenseCalendarProps {
  expenses: any[]
  currency: string
}

const ExpenseCalendar = React.memo(({ expenses, currency }: ExpenseCalendarProps) => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<ExpenseEvent | null>(null)

  // Memoize filtered expenses and events
  const { filteredExpenses, events, totalAmount } = useMemo(() => {
    const filtered = expenses.filter(expense => 
      filterStatus === 'all' || expense.status === filterStatus
    )

    const calendarEvents: ExpenseEvent[] = filtered.map((expense) => {
      const date = new Date(expense.expenseDate)
      return {
        id: expense.id,
        title: `${expense.category}`,
        start: date,
        end: date,
        resource: {
          amount: expense.convertedAmount || 0,
          category: expense.category,
          status: expense.status,
          currency,
          description: expense.description
        }
      }
    })

    const total = filtered.reduce((sum, expense) => sum + (expense.convertedAmount || 0), 0)

    return { 
      filteredExpenses: filtered, 
      events: calendarEvents, 
      totalAmount: total 
    }
  }, [expenses, filterStatus, currency])

  // Memoized event style getter
  const eventStyleGetter = useCallback((event: ExpenseEvent) => {
    let backgroundColor = 'rgba(139, 92, 246, 0.8)'
    let borderColor = '#8b5cf6'
    
    switch (event.resource.status) {
      case 'APPROVED':
        backgroundColor = 'rgba(16, 185, 129, 0.8)'
        borderColor = '#10b981'
        break
      case 'REJECTED':
        backgroundColor = 'rgba(239, 68, 68, 0.8)'
        borderColor = '#ef4444'
        break
      case 'PENDING':
        backgroundColor = 'rgba(245, 158, 11, 0.8)'
        borderColor = '#f59e0b'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        padding: '4px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)'
      }
    }
  }, [])

  // Memoized handlers
  const handleFilterChange = useCallback((status: string) => {
    setFilterStatus(status)
  }, [])

  const handleEventSelect = useCallback((event: ExpenseEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const handleViewChange = useCallback((newView: 'month' | 'week' | 'day') => {
    setView(newView)
  }, [])

  // Wrapper for react-big-calendar onView handler that accepts all view types
  const handleCalendarViewChange = useCallback((view: any) => {
    if (view === 'month' || view === 'week' || view === 'day') {
      setView(view)
    }
  }, [])

  const handleNavigate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const CustomEvent = useCallback(({ event }: { event: ExpenseEvent }) => (
    <div className="text-white text-xs font-semibold truncate leading-tight">
      <div className="truncate">{event.resource.category}</div>
      <div className="opacity-90 text-[10px] font-medium">
        {event.resource.amount.toFixed(0)} {event.resource.currency}
      </div>
    </div>
  ), [])

  const CustomToolbar = useCallback(({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200/50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 min-w-[200px] text-center">{label}</h3>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm"
        >
          Today
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        {['month', 'week', 'day'].map((viewType) => (
          <button
            key={viewType}
            onClick={() => {
              handleViewChange(viewType as any)
              onView(viewType)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              view === viewType
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {viewType}
          </button>
        ))}
      </div>
    </div>
  ), [view, handleViewChange])

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Expenses', color: 'bg-gray-500' },
    { value: 'APPROVED', label: 'Approved', color: 'bg-green-500' },
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500' }
  ], [])

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Expense Calendar</h2>
              <p className="text-blue-100 text-sm">Track your expenses across time</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {filteredExpenses.length} expenses
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {totalAmount.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all">
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        <div className="expense-calendar-modern" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleCalendarViewChange}
            date={selectedDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar
            }}
            onSelectEvent={handleEventSelect}
            popup
            popupOffset={{ x: 30, y: 20 }}
            style={{ height: '100%' }}
            formats={{
              dayHeaderFormat: 'dddd, MMMM DD',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('MMMM DD')} - ${moment(end).format('MMMM DD, YYYY')}`,
              monthHeaderFormat: 'MMMM YYYY',
            }}
          />
        </div>
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Expense Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-lg font-semibold text-gray-900">{selectedEvent.resource.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-2xl font-bold text-green-600">
                  {selectedEvent.resource.amount.toFixed(2)} {selectedEvent.resource.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedEvent.resource.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-800'
                    : selectedEvent.resource.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedEvent.resource.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900">{moment(selectedEvent.start).format('MMMM DD, YYYY')}</p>
              </div>
              {selectedEvent.resource.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedEvent.resource.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

ExpenseCalendar.displayName = 'ExpenseCalendar'

export default ExpenseCalendar