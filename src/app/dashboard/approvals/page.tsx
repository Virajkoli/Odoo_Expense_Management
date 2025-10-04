'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Clock, FileText, DollarSign, Calendar, User, MessageSquare } from 'lucide-react'

interface ApprovalRequest {
  id: string
  expenseId: string
  approverId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  sequence: number
  comments: string | null
  createdAt: string
  updatedAt: string
  expense: {
    id: string
    amount: number
    originalCurrency: string
    convertedAmount: number
    category: string
    description: string | null
    expenseDate: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    receiptUrl: string | null
    user: {
      id: string
      name: string
      email: string
    }
    approvalRequests: {
      id: string
      sequence: number
      status: string
      approver: {
        name: string
        email: string
      }
    }[]
  }
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [selectedExpense, setSelectedExpense] = useState<ApprovalRequest | null>(null)
  const [comments, setComments] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('pending')

  // Fetch approval requests for current user
  const { data: approvalRequests, isLoading } = useQuery({
    queryKey: ['approval-requests', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/approval-requests')
      if (!response.ok) throw new Error('Failed to fetch approval requests')
      return response.json() as Promise<ApprovalRequest[]>
    },
    enabled: !!session?.user,
  })

  // Approve/Reject mutation
  const approveMutation = useMutation({
    mutationFn: async ({ expenseId, status, comments }: { expenseId: string; status: 'APPROVED' | 'REJECTED'; comments?: string }) => {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process approval')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setSelectedExpense(null)
      setComments('')
    },
  })

  const handleApprove = (expenseId: string, status: 'APPROVED' | 'REJECTED') => {
    approveMutation.mutate({ expenseId, status, comments: comments || undefined })
  }

  // Admin Override mutation
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
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setSelectedExpense(null)
      setComments('')
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

  // Filter approval requests
  const filteredRequests = approvalRequests?.filter(request => {
    if (filter === 'pending') return request.status === 'PENDING'
    if (filter === 'processed') return request.status !== 'PENDING'
    return true
  })

  // Group by status
  const pendingCount = approvalRequests?.filter(r => r.status === 'PENDING').length || 0
  const processedCount = approvalRequests?.filter(r => r.status !== 'PENDING').length || 0

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
          <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
          <p className="text-gray-600 mt-1">Review and approve expense claims</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-yellow-100 rounded-lg">
            <div className="text-sm text-yellow-800 font-medium">
              {pendingCount} Pending
            </div>
          </div>
          <div className="px-4 py-2 bg-green-100 rounded-lg">
            <div className="text-sm text-green-800 font-medium">
              {processedCount} Processed
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('processed')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'processed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Processed ({processedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({approvalRequests?.length || 0})
        </button>
      </div>

      {/* Approval Requests List */}
      {filteredRequests && filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No approval requests</h3>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? "You don't have any pending approvals at the moment."
              : filter === 'processed'
              ? "You haven't processed any approvals yet."
              : "No approval requests found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests?.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                selectedExpense?.id === request.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setSelectedExpense(selectedExpense?.id === request.id ? null : request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sequence {request.sequence}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Employee Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {request.expense.user.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({request.expense.user.email})
                      </span>
                    </div>

                    {/* Expense Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Amount</div>
                          <div className="font-semibold text-gray-900">
                            {request.expense.convertedAmount?.toFixed(2)} {session?.user?.companyCurrency}
                          </div>
                          {request.expense.originalCurrency !== session?.user?.companyCurrency && (
                            <div className="text-xs text-gray-500">
                              ({request.expense.amount} {request.expense.originalCurrency})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Category</div>
                          <div className="font-medium text-gray-900">
                            {request.expense.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Date</div>
                          <div className="font-medium text-gray-900">
                            {new Date(request.expense.expenseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <div className={`font-medium ${
                            request.expense.status === 'PENDING'
                              ? 'text-yellow-600'
                              : request.expense.status === 'APPROVED'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {request.expense.status}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {request.expense.description && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Description</div>
                        <div className="text-gray-900">{request.expense.description}</div>
                      </div>
                    )}
                  </div>

                  {/* Receipt Preview */}
                  {request.expense.receiptUrl && (
                    <div className="ml-4">
                      <img
                        src={request.expense.receiptUrl}
                        alt="Receipt"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <a
                        href={request.expense.receiptUrl}
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

                {/* Approval Chain */}
                {selectedExpense?.id === request.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Approval Chain</h4>
                      
                      {/* Admin Override Buttons */}
                      {session?.user?.role === 'ADMIN' && request.expense.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOverride(request.expenseId, 'APPROVE')
                            }}
                            disabled={overrideExpenseMutation.isPending}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Override Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOverride(request.expenseId, 'REJECT')
                            }}
                            disabled={overrideExpenseMutation.isPending}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Override Reject
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {request.expense.approvalRequests
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((ar, index) => (
                          <div
                            key={ar.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              ar.status === 'APPROVED'
                                ? 'bg-green-50'
                                : ar.status === 'REJECTED'
                                ? 'bg-red-50'
                                : ar.sequence === request.sequence
                                ? 'bg-blue-50'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
                              {ar.status === 'APPROVED' ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : ar.status === 'REJECTED' ? (
                                <X className="h-5 w-5 text-red-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  Sequence {ar.sequence}
                                </span>
                                <span className="text-gray-600">-</span>
                                <span className="text-gray-700">{ar.approver.name}</span>
                                {ar.sequence === request.sequence && ar.status === 'PENDING' && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Your Turn
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{ar.approver.email}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ar.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : ar.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {ar.status}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Action Section */}
                    {request.status === 'PENDING' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments (Optional)
                        </label>
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-5 w-5 text-gray-400 mt-2" />
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add your comments here..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(request.expenseId, 'APPROVED')
                            }}
                            disabled={approveMutation.isPending}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="h-5 w-5" />
                            {approveMutation.isPending ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(request.expenseId, 'REJECTED')
                            }}
                            disabled={approveMutation.isPending}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="h-5 w-5" />
                            {approveMutation.isPending ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Already Processed */}
                    {request.status !== 'PENDING' && request.comments && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-1">Your Comments</div>
                          <div className="text-gray-900">{request.comments}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
