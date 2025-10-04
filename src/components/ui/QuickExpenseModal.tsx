'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { X, Upload, Calendar, DollarSign } from 'lucide-react'
import { useGSAPAnimation } from '@/hooks/useGSAP'

interface QuickExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const QuickExpenseModal = React.memo(({ isOpen, onClose, onSubmit }: QuickExpenseModalProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  })

  const modalRef = useGSAPAnimation()

  // Memoize categories to prevent re-renders
  const categories = useMemo(() => [
    'Travel', 'Meals', 'Office Supplies', 'Software', 'Hardware', 
    'Training', 'Marketing', 'Utilities', 'Other'
  ], [])

  // Memoized form handlers
  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0]
    })
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    resetForm()
    onClose()
  }, [formData, onSubmit, resetForm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef.elementRef}
        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Quick Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.expenseDate}
              onChange={(e) => handleChange('expenseDate', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 font-medium transition-all transform hover:scale-105"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

QuickExpenseModal.displayName = 'QuickExpenseModal'

export default QuickExpenseModal