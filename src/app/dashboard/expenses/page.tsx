'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock, Upload, Eye, Trash2, Filter } from 'lucide-react'

interface Expense {
  id: string
  amount: number
  originalCurrency: string
  convertedAmount: number | null
  category: string
  description: string | null
  expenseDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  receiptUrl: string | null
  receiptPublicId: string | null
  rejectionReason: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  approvalRequests: {
    id: string
    sequence: number
    status: string
    comments: string | null
    approver: {
      name: string
      email: string
    }
  }[]
}

const categories = [
  'Travel',
  'Meals',
  'Accommodation',
  'Transportation',
  'Office Supplies',
  'Equipment',
  'Software',
  'Training',
  'Entertainment',
  'Other'
]

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY']

export default function ExpensesPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  // State
  const [showForm, setShowForm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    originalCurrency: session?.user?.companyCurrency || 'USD',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    receiptPublicId: '',
    receiptFileType: '', // Track the file type (e.g., 'application/pdf', 'image/jpeg')
  })
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await fetch('/api/expenses')
      if (!response.ok) throw new Error('Failed to fetch expenses')
      return response.json() as Promise<Expense[]>
    },
  })

  // Upload receipt mutation
  const uploadReceipt = async (file: File) => {
    setUploadingReceipt(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      // Enable OCR by default
      formData.append('extractOcr', 'true')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      
      // Update form with receipt URL, public ID, and file type
      setFormData(prev => ({
        ...prev,
        receiptUrl: data.url,
        receiptPublicId: data.publicId,
        receiptFileType: data.fileType || file.type, // Use returned fileType or fallback to file.type
      }))

      // Auto-fill form fields if OCR data is available
      if (data.parsedData) {
        console.log('Auto-filling expense form with OCR data:', data.parsedData)
        
        setFormData(prev => ({
          ...prev,
          receiptUrl: data.url,
          receiptPublicId: data.publicId,
          receiptFileType: data.fileType || file.type,
          // Auto-fill amount if detected
          amount: data.parsedData.amount ? data.parsedData.amount.toString() : prev.amount,
          // Auto-fill currency if detected
          originalCurrency: data.parsedData.currency || prev.originalCurrency,
          // Auto-fill category if detected
          category: data.parsedData.category || prev.category,
          // Auto-fill description (merchant name)
          description: data.parsedData.description || data.parsedData.merchantName || prev.description,
          // Auto-fill date if detected
          expenseDate: data.parsedData.date || prev.expenseDate,
        }))

        // Show success message to user
        const fieldsDetected = []
        if (data.parsedData.amount) fieldsDetected.push('amount')
        if (data.parsedData.currency) fieldsDetected.push('currency')
        if (data.parsedData.category) fieldsDetected.push('category')
        if (data.parsedData.merchantName || data.parsedData.description) fieldsDetected.push('description')
        if (data.parsedData.date) fieldsDetected.push('date')

        if (fieldsDetected.length > 0) {
          alert(`✨ Receipt scanned successfully!\n\nAuto-detected: ${fieldsDetected.join(', ')}\n\nPlease review and update any fields as needed.`)
        } else if (data.ocrAvailable) {
          alert('Receipt uploaded successfully. OCR processing complete but no expense data was detected. Please fill in the details manually.')
        } else {
          alert('Receipt uploaded successfully. Note: OCR feature requires Google Cloud Vision add-on to be enabled in Cloudinary.')
        }
      } else if (data.error && data.error.includes('OCR')) {
        // OCR add-on not enabled
        alert(`⚠️ Receipt uploaded successfully, but OCR auto-fill is not available.\n\n` +
              `Reason: ${data.error}\n\n` +
              `To enable auto-fill from receipts:\n` +
              `1. Go to https://cloudinary.com/console/addons\n` +
              `2. Install "Google Cloud Vision" add-on (FREE)\n` +
              `3. Restart the app\n\n` +
              `For now, please fill in the expense details manually.`)
      } else {
        alert('Receipt uploaded successfully. Please fill in the expense details.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload receipt. Please try again.')
    } finally {
      setUploadingReceipt(false)
    }
  }

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          originalCurrency: data.originalCurrency,
          category: data.category,
          description: data.description || undefined,
          expenseDate: new Date(data.expenseDate).toISOString(),
          receiptUrl: data.receiptUrl || undefined,
          receiptPublicId: data.receiptPublicId || undefined,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create expense')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowForm(false)
      resetForm()
      alert('Expense submitted successfully!')
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      amount: '',
      originalCurrency: session?.user?.companyCurrency || 'USD',
      category: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      receiptPublicId: '',
      receiptFileType: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category) {
      alert('Please fill in all required fields')
      return
    }
    
    createExpenseMutation.mutate(formData)
  }

  // Override expense mutation (admin only)
  const overrideExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, action, reason }: { expenseId: string; action: 'APPROVE' | 'REJECT'; reason: string }) => {
      const response = await fetch(`/api/expenses/${expenseId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to override expense')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      alert('Expense override successful!')
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  const handleOverride = (expenseId: string, action: 'APPROVE' | 'REJECT') => {
    const reason = prompt(
      `Please provide a reason for ${action === 'APPROVE' ? 'approving' : 'rejecting'} this expense via admin override:`
    )
    
    if (!reason || reason.trim() === '') {
      alert('Reason is required for admin override')
      return
    }
    
    if (confirm(`Are you sure you want to ${action.toLowerCase()} this expense via admin override? This will bypass all pending approvals.`)) {
      overrideExpenseMutation.mutate({ expenseId, action, reason })
    }
  }

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete expense')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowDeleteModal(false)
      setExpenseToDelete(null)
      alert('Expense deleted successfully!')
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  const handleDeleteExpense = (expenseId: string) => {
    setExpenseToDelete(expenseId)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete)
    }
  }

  // Filter expenses
  const filteredExpenses = expenses?.filter(expense => {
    if (filterStatus === 'all') return true
    return expense.status === filterStatus
  })

  // Statistics
  const stats = {
    total: expenses?.length || 0,
    pending: expenses?.filter(e => e.status === 'PENDING').length || 0,
    approved: expenses?.filter(e => e.status === 'APPROVED').length || 0,
    rejected: expenses?.filter(e => e.status === 'REJECTED').length || 0,
    totalAmount: expenses?.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0) || 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600 mt-1">Submit and track your expense claims</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          New Expense
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <div className="text-sm text-yellow-700 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
        </div>
        <div className="p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <div className="text-sm text-green-700 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
        </div>
        <div className="p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <div className="text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
        </div>
        <div className="p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-700 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.totalAmount.toFixed(2)}
          </div>
          <div className="text-xs text-blue-600">{session?.user?.companyCurrency}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'PENDING'
              ? 'text-yellow-600 border-b-2 border-yellow-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'APPROVED'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'REJECTED'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Expenses List */}
      {filteredExpenses && filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus === 'all'
              ? "You haven't submitted any expenses yet."
              : `You don't have any ${filterStatus.toLowerCase()} expenses.`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Submit Your First Expense
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExpenses?.map((expense) => (
            <div
              key={expense.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                selectedExpense?.id === expense.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedExpense(selectedExpense?.id === expense.id ? null : expense)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          expense.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : expense.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status === 'PENDING' && <Clock className="inline h-4 w-4 mr-1" />}
                          {expense.status === 'APPROVED' && <CheckCircle className="inline h-4 w-4 mr-1" />}
                          {expense.status === 'REJECTED' && <XCircle className="inline h-4 w-4 mr-1" />}
                          {expense.status}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Delete Button - Only show for user's own expenses and pending status */}
                      {expense.user?.id === session?.user?.id && expense.status === 'PENDING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteExpense(expense.id)
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Expense Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Amount</div>
                          <div className="font-semibold text-gray-900">
                            {expense.amount} {expense.originalCurrency}
                          </div>
                          {expense.originalCurrency !== session?.user?.companyCurrency && expense.convertedAmount && (
                            <div className="text-xs text-gray-500">
                              ≈ {expense.convertedAmount.toFixed(2)} {session?.user?.companyCurrency}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Category</div>
                          <div className="font-medium text-gray-900">
                            {expense.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Date</div>
                          <div className="font-medium text-gray-900">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Approvals</div>
                          <div className="font-medium text-gray-900">
                            {expense.approvalRequests.filter(ar => ar.status === 'APPROVED').length} / {expense.approvalRequests.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {expense.description && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Description</div>
                        <div className="text-gray-900">{expense.description}</div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {expense.status === 'REJECTED' && expense.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">Rejection Reason</div>
                        <div className="text-red-900">{expense.rejectionReason}</div>
                      </div>
                    )}
                  </div>

                  {/* Receipt Preview */}
                  {expense.receiptUrl && (
                    <div className="ml-4">
                      {expense.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                        // PDF Preview
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                          <div className="text-center">
                            <FileText className="h-10 w-10 text-red-600 mx-auto mb-1" />
                            <span className="text-xs text-gray-600">PDF</span>
                          </div>
                        </div>
                      ) : (
                        // Image Preview
                        <img
                          src={expense.receiptUrl}
                          alt="Receipt"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1 block text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Full
                      </a>
                    </div>
                  )}
                </div>

                {/* Approval Status - Expanded */}
                {selectedExpense?.id === expense.id && expense.approvalRequests.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Approval Status</h4>
                      
                      {/* Admin Override Buttons */}
                      {session?.user?.role === 'ADMIN' && expense.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOverride(expense.id, 'APPROVE')
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Override Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOverride(expense.id, 'REJECT')
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            Override Reject
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {expense.approvalRequests
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((ar, index) => (
                          <div
                            key={ar.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              ar.status === 'APPROVED'
                                ? 'bg-green-50'
                                : ar.status === 'REJECTED'
                                ? 'bg-red-50'
                                : ar.status === 'CANCELLED'
                                ? 'bg-gray-50'
                                : 'bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
                              {ar.status === 'APPROVED' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : ar.status === 'REJECTED' ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : ar.status === 'CANCELLED' ? (
                                <XCircle className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {ar.sequence === 999 ? 'Admin Override' : `Step ${ar.sequence}`}
                                </span>
                                <span className="text-gray-600">-</span>
                                <span className="text-gray-700">{ar.approver.name}</span>
                              </div>
                              <div className="text-sm text-gray-600">{ar.approver.email}</div>
                              {ar.comments && (
                                <div className="mt-2 text-sm text-gray-700 italic">
                                  "{ar.comments}"
                                </div>
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ar.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : ar.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : ar.status === 'CANCELLED'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ar.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Expense</h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium placeholder:text-gray-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.originalCurrency}
                      onChange={(e) => setFormData({ ...formData, originalCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                      required
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium placeholder:text-gray-500"
                    rows={3}
                    placeholder="Add details about this expense..."
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt {' '}
                    <span className="text-xs font-normal text-blue-600">
                      (OCR auto-fill enabled ✨)
                    </span>
                  </label>
                  {formData.receiptUrl ? (
                    <div className="flex items-center gap-4">
                      {formData.receiptFileType === 'application/pdf' ? (
                        // PDF Preview
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-red-600 mx-auto mb-1" />
                            <span className="text-xs text-gray-600">PDF</span>
                          </div>
                        </div>
                      ) : (
                        // Image Preview
                        <img
                          src={formData.receiptUrl}
                          alt="Receipt"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-green-600 mb-2">✓ Receipt uploaded</p>
                        <a
                          href={formData.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 mr-4"
                        >
                          View Full
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, receiptUrl: '', receiptPublicId: '', receiptFileType: '' })}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          {uploadingReceipt ? 'Scanning receipt...' : 'Click to upload receipt'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) uploadReceipt(file)
                          }}
                          disabled={uploadingReceipt}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                      <p className="text-xs text-blue-600 mt-2">
                        📸 Smart scan: Automatically extracts amount, date, merchant & category
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createExpenseMutation.isPending || uploadingReceipt}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {createExpenseMutation.isPending ? 'Submitting...' : 'Submit Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Delete Expense</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setExpenseToDelete(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Are you sure?</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  This will permanently delete your expense submission. All associated data including receipts and approval requests will be removed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setExpenseToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteExpenseMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
