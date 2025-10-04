'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import moment from 'moment'

interface MiniCalendarProps {
  expenses: any[]
  currency: string
  onDateSelect?: (date: Date) => void
}

const MiniCalendar = React.memo(({ expenses, currency, onDateSelect }: MiniCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Memoize calendar days calculation
  const days = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf('month')
    const endOfMonth = moment(currentDate).endOf('month')
    const startOfCalendar = moment(startOfMonth).startOf('week')
    const endOfCalendar = moment(endOfMonth).endOf('week')

    const calendarDays = []
    let day = moment(startOfCalendar)

    while (day.isSameOrBefore(endOfCalendar)) {
      calendarDays.push(day.clone())
      day.add(1, 'day')
    }

    return calendarDays
  }, [currentDate])

  // Memoize expense lookups
  const { getExpenseForDate, getTotalForDate, getStatusDot } = useMemo(() => {
    const expenseMap = new Map()
    
    expenses.forEach(expense => {
      const dateKey = moment(expense.expenseDate).format('YYYY-MM-DD')
      if (!expenseMap.has(dateKey)) {
        expenseMap.set(dateKey, [])
      }
      expenseMap.get(dateKey).push(expense)
    })

    return {
      getExpenseForDate: (date: moment.Moment) => {
        return expenseMap.get(date.format('YYYY-MM-DD')) || []
      },
      getTotalForDate: (date: moment.Moment) => {
        const dayExpenses = expenseMap.get(date.format('YYYY-MM-DD')) || []
        return dayExpenses.reduce((sum: number, expense: any) => sum + (expense.convertedAmount || 0), 0)
      },
      getStatusDot: (date: moment.Moment) => {
        const dayExpenses = expenseMap.get(date.format('YYYY-MM-DD')) || []
        if (dayExpenses.length === 0) return null

        const hasApproved = dayExpenses.some((e: any) => e.status === 'APPROVED')
        const hasPending = dayExpenses.some((e: any) => e.status === 'PENDING')
        const hasRejected = dayExpenses.some((e: any) => e.status === 'REJECTED')

        if (hasRejected) return 'bg-red-500'
        if (hasPending) return 'bg-yellow-500'
        if (hasApproved) return 'bg-green-500'
        return 'bg-blue-500'
      }
    }
  }, [expenses])

  // Memoize month statistics
  const monthStats = useMemo(() => {
    const monthExpenses = expenses.filter(expense => 
      moment(expense.expenseDate).isSame(currentDate, 'month')
    )
    
    const totalAmount = monthExpenses.reduce((sum, expense) => sum + (expense.convertedAmount || 0), 0)
    
    return {
      count: monthExpenses.length,
      total: totalAmount
    }
  }, [expenses, currentDate])

  // Memoized navigation handlers
  const previousMonth = useCallback(() => {
    setCurrentDate(moment(currentDate).subtract(1, 'month').toDate())
  }, [currentDate])

  const nextMonth = useCallback(() => {
    setCurrentDate(moment(currentDate).add(1, 'month').toDate())
  }, [currentDate])

  const handleDateClick = useCallback((date: moment.Moment) => {
    onDateSelect?.(date.toDate())
  }, [onDateSelect])

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-purple-600" />
          Quick Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {moment(currentDate).format('MMMM YYYY')}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === moment(currentDate).month()
          const isToday = day.isSame(moment(), 'day')
          const dayExpenses = getExpenseForDate(day)
          const total = getTotalForDate(day)
          const statusDot = getStatusDot(day)

          return (
            <div
              key={index}
              onClick={() => onDateSelect?.(day.toDate())}
              className={`
                relative p-2 text-center text-xs cursor-pointer rounded-lg transition-all hover:bg-purple-50 group
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isToday ? 'bg-purple-500 text-white hover:bg-purple-600' : ''}
                ${dayExpenses.length > 0 ? 'font-semibold' : ''}
              `}
            >
              <div className="relative">
                {day.date()}
                {statusDot && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${statusDot}`}></div>
                )}
              </div>
              
              {/* Tooltip */}
              {dayExpenses.length > 0 && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                    {dayExpenses.length} expense{dayExpenses.length > 1 ? 's' : ''}
                    <br />
                    {total.toFixed(2)} {currency}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">This month:</span>
          <span className="font-semibold text-gray-900">
            {monthStats.count} expenses
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Total amount:</span>
          <span className="font-semibold text-green-600">
            {monthStats.total.toFixed(2)} {currency}
          </span>
        </div>
      </div>
    </div>
  )
})

MiniCalendar.displayName = 'MiniCalendar'

export default MiniCalendar