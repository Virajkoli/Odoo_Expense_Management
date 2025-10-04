'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'

export default function ApprovalRulesPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)

  const { data: rules, isLoading } = useQuery({
    queryKey: ['approval-rules'],
    queryFn: async () => {
      const { data } = await axios.get('/api/approval-rules')
      return data
    },
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users')
      return data
    },
  })

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await axios.patch('/api/approval-rules', { id, isActive })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
      toast.success('Rule updated successfully')
    },
    onError: () => {
      toast.error('Failed to update rule')
    },
  })

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/approval-rules?id=${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
      toast.success('Rule deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete rule')
    },
  })

  const handleDeleteRule = (rule: any) => {
    if (rule.isActive) {
      toast.error('Cannot delete an active rule. Please deactivate it first.')
      return
    }

    if (confirm(`Are you sure you want to delete the rule "${rule.name}"? This action cannot be undone.`)) {
      deleteRuleMutation.mutate(rule.id)
    }
  }

  const managers = users?.filter((u: any) => u.role === 'MANAGER' || u.role === 'ADMIN') || []

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">Only administrators can manage approval rules.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure expense approval workflows for your organization
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedRule(null)
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Approval Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : rules?.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No approval rules configured yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first approval rule
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rules?.map((rule: any) => (
              <li key={rule.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rule.ruleType.replace('_', ' ')}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {rule.percentage && (
                        <span>Required Approval: {rule.percentage}%</span>
                      )}
                      <span>Approvers: {rule.approvers.length}</span>
                      <span>Sequence: {rule.sequence}</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Approval Sequence:</p>
                      <div className="mt-2 space-y-1">
                        {rule.approvers
                          .sort((a: any, b: any) => a.sequence - b.sequence)
                          .map((approver: any, index: number) => (
                            <div
                              key={approver.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                {approver.sequence}
                              </span>
                              <span className={`text-sm ${
                                approver.isSpecialApprover
                                  ? 'font-semibold text-purple-700'
                                  : 'text-gray-700'
                              }`}>
                                {approver.user.name}
                              </span>
                              <span className="text-xs text-gray-500">({approver.user.role})</span>
                              {approver.isSpecialApprover && (
                                <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  ⭐ Special
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        toggleRuleMutation.mutate({
                          id: rule.id,
                          isActive: !rule.isActive,
                        })
                      }
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule)}
                      disabled={deleteRuleMutation.isPending}
                      className={`p-2 hover:text-red-600 transition-colors ${
                        rule.isActive 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400'
                      }`}
                      title={rule.isActive ? 'Deactivate rule before deleting' : 'Delete rule'}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <ApprovalRuleModal
          rule={selectedRule}
          managers={managers}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            queryClient.invalidateQueries({ queryKey: ['approval-rules'] })
          }}
        />
      )}
    </div>
  )
}

function ApprovalRuleModal({
  rule,
  managers,
  onClose,
  onSuccess,
}: {
  rule: any
  managers: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    ruleType: rule?.ruleType || 'PERCENTAGE',
    percentage: rule?.percentage || 60,
    sequence: rule?.sequence || 1,
    approvers: rule?.approvers || [],
  })

  // Store approvers with their sequences in order
  const [approversList, setApproversList] = useState<Array<{
    userId: string
    userName: string
    userRole: string
    isSpecialApprover: boolean
    sequence: number
  }>>(
    rule?.approvers
      ?.sort((a: any, b: any) => a.sequence - b.sequence)
      .map((a: any, index: number) => ({
        userId: a.userId,
        userName: a.user.name,
        userRole: a.user.role,
        isSpecialApprover: a.isSpecialApprover,
        sequence: index + 1,
      })) || []
  )

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/approval-rules', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Approval rule created successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create approval rule')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Use the approversList with their assigned sequences
    const approversData = approversList.map((approver) => ({
      userId: approver.userId,
      isSpecialApprover: approver.isSpecialApprover,
      sequence: approver.sequence,
    }))

    createMutation.mutate({
      ...formData,
      approvers: approversData,
    })
  }

  const addApprover = (userId: string) => {
    const manager = managers.find((m: any) => m.id === userId)
    if (!manager) return

    const newSequence = approversList.length + 1
    setApproversList([
      ...approversList,
      {
        userId: manager.id,
        userName: manager.name,
        userRole: manager.role,
        isSpecialApprover: false,
        sequence: newSequence,
      },
    ])
  }

  const removeApprover = (userId: string) => {
    const filteredList = approversList
      .filter((a) => a.userId !== userId)
      .map((a, index) => ({ ...a, sequence: index + 1 })) // Re-sequence
    setApproversList(filteredList)
  }

  const moveApproverUp = (index: number) => {
    if (index === 0) return
    const newList = [...approversList]
    ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
    // Re-assign sequences
    const updatedList = newList.map((a, i) => ({ ...a, sequence: i + 1 }))
    setApproversList(updatedList)
  }

  const moveApproverDown = (index: number) => {
    if (index === approversList.length - 1) return
    const newList = [...approversList]
    ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
    // Re-assign sequences
    const updatedList = newList.map((a, i) => ({ ...a, sequence: i + 1 }))
    setApproversList(updatedList)
  }

  const toggleSpecialApprover = (userId: string) => {
    setApproversList(
      approversList.map((a) =>
        a.userId === userId ? { ...a, isSpecialApprover: !a.isSpecialApprover } : a
      )
    )
  }

  // Get available managers (not yet added)
  const availableManagers = managers.filter(
    (m: any) => !approversList.some((a) => a.userId === m.id)
  )

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {rule ? 'Edit' : 'Create'} Approval Rule
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white text-gray-900 font-medium placeholder:text-gray-500"
              placeholder="e.g., Standard Expense Approval"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white text-gray-900 font-medium placeholder:text-gray-500"
              placeholder="Describe when this rule applies..."
            />
          </div>

          {/* Rule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rule Type</label>
            <select
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white text-gray-900 font-medium"
            >
              <option value="PERCENTAGE">Percentage - Requires % of approvers</option>
              <option value="SPECIFIC_APPROVER">Specific Approver - Requires special approver</option>
              <option value="HYBRID">Hybrid - Percentage OR special approver</option>
            </select>
          </div>

          {/* Percentage */}
          {(formData.ruleType === 'PERCENTAGE' || formData.ruleType === 'HYBRID') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Approval Percentage
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: parseInt(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white text-gray-900 font-medium"
              />
              <p className="mt-1 text-xs text-gray-500">
                Expense will be approved if {formData.percentage}% of selected approvers approve
              </p>
            </div>
          )}

          {/* Sequence */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sequence</label>
            <input
              type="number"
              min="1"
              required
              value={formData.sequence}
              onChange={(e) =>
                setFormData({ ...formData, sequence: parseInt(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border bg-white text-gray-900 font-medium"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers are processed first in multi-rule workflows
            </p>
          </div>

          {/* Approvers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Sequence
            </label>
            
            {/* Selected Approvers List */}
            {approversList.length > 0 && (
              <div className="mb-4 border border-gray-300 rounded-md p-3 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  Selected Approvers (in sequence order):
                </p>
                <div className="space-y-2">
                  {approversList.map((approver, index) => (
                    <div
                      key={approver.userId}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      {/* Sequence Number */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                        {approver.sequence}
                      </div>
                      
                      {/* Approver Info */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{approver.userName}</div>
                        <div className="text-xs text-gray-500">{approver.userRole}</div>
                      </div>
                      
                      {/* Special Approver Toggle */}
                      {(formData.ruleType === 'SPECIFIC_APPROVER' || formData.ruleType === 'HYBRID') && (
                        <button
                          type="button"
                          onClick={() => toggleSpecialApprover(approver.userId)}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            approver.isSpecialApprover
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}
                        >
                          {approver.isSpecialApprover ? '⭐ Special' : 'Regular'}
                        </button>
                      )}
                      
                      {/* Move Up/Down Buttons */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveApproverUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveApproverDown(index)}
                          disabled={index === approversList.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeApprover(approver.userId)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Approver Dropdown */}
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addApprover(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">
                  {availableManagers.length === 0
                    ? 'No more approvers available'
                    : 'Select an approver to add...'}
                </option>
                {availableManagers.map((manager: any) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              💡 Use the arrow buttons to reorder approvers. Lower sequence numbers will be processed first.
            </p>
            {formData.ruleType === 'SPECIFIC_APPROVER' && (
              <p className="mt-1 text-xs text-purple-600">
                ⭐ Mark approvers as "Special" to allow them to auto-approve regardless of other approvals
              </p>
            )}
            {formData.ruleType === 'HYBRID' && (
              <p className="mt-1 text-xs text-purple-600">
                ⭐ Expense is approved if a special approver approves OR the percentage threshold is met
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || approversList.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
