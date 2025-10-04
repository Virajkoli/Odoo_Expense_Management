'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Plus, Zap, Receipt, Calendar, BarChart3, Settings } from 'lucide-react'
import { gsap } from 'gsap'

interface FloatingActionButtonProps {
  onQuickExpense: () => void
  onViewAnalytics: () => void
  onViewCalendar: () => void
}

const FloatingActionButton = React.memo(({ 
  onQuickExpense, 
  onViewAnalytics, 
  onViewCalendar 
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const fabRef = useRef<HTMLButtonElement>(null)

  // Use direct GSAP animation for type safety
  useEffect(() => {
    if (fabRef.current) {
      gsap.to(fabRef.current, {
        y: -10,
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      })
    }
  }, [])

  // Memoize actions array to prevent re-renders
  const actions = useMemo(() => [
    {
      icon: Receipt,
      label: 'Quick Expense',
      onClick: onQuickExpense,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      onClick: onViewAnalytics,
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Calendar,
      label: 'Calendar',
      onClick: onViewCalendar,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => console.log('Settings'),
      gradient: 'from-gray-500 to-gray-600'
    }
  ], [onQuickExpense, onViewAnalytics, onViewCalendar])

  // Memoized handlers
  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setIsOpen(false), [])

  const handleActionClick = useCallback((action: typeof actions[0]) => {
    action.onClick()
    setIsOpen(false)
  }, [])

  const ActionItem = React.memo(({ action, index, isOpen }: { 
    action: typeof actions[0], 
    index: number, 
    isOpen: boolean 
  }) => (
    <div
      className={`flex items-center space-x-3 transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <span className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-lg border border-white/20">
        {action.label}
      </span>
      <button
        onClick={() => handleActionClick(action)}
        className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transform hover:scale-110 transition-all duration-200`}
      >
        <action.icon className="h-5 w-5" />
      </button>
    </div>
  ))

  ActionItem.displayName = 'ActionItem'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <div className={`mb-4 space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
        {actions.map((action, index) => (
          <ActionItem
            key={action.label}
            action={action}
            index={index}
            isOpen={isOpen}
          />
        ))}
      </div>

      {/* Main FAB */}
      <button
        ref={fabRef}
        onClick={toggleOpen}
        className={`w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transform hover:scale-110 transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? (
          <Plus className="h-6 w-6 transition-transform duration-300" />
        ) : (
          <Zap className="h-6 w-6 transition-transform duration-300" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={closeMenu}
        />
      )}
    </div>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'

export default FloatingActionButton