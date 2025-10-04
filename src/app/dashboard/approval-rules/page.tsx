'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

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
                      <p className="text-sm font-medium text-gray-700">Approvers:</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rule.approvers.map((approver: any) => (
                          <span
                            key={approver.id}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              approver.isSpecialApprover
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {approver.user.name}
                            {approver.isSpecialApprover && ' ⭐'}
                          </span>
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

  const [selectedApprovers, setSelectedApprovers] = useState<string[]>(
    rule?.approvers?.map((a: any) => a.userId) || []
  )
  const [specialApprovers, setSpecialApprovers] = useState<string[]>(
    rule?.approvers?.filter((a: any) => a.isSpecialApprover).map((a: any) => a.userId) || []
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

    const approversData = selectedApprovers.map((userId, index) => ({
      userId,
      isSpecialApprover: specialApprovers.includes(userId),
      sequence: index + 1,
    }))

    createMutation.mutate({
      ...formData,
      approvers: approversData,
    })
  }

  const toggleApprover = (userId: string) => {
    setSelectedApprovers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const toggleSpecialApprover = (userId: string) => {
    setSpecialApprovers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

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
              Select Approvers
            </label>
            <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
              {managers.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No managers available. Create manager users first.
                </p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Include
                      </th>
                      {(formData.ruleType === 'SPECIFIC_APPROVER' ||
                        formData.ruleType === 'HYBRID') && (
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Special ⭐
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {managers.map((manager: any) => (
                      <tr key={manager.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{manager.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{manager.role}</td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedApprovers.includes(manager.id)}
                            onChange={() => toggleApprover(manager.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                        {(formData.ruleType === 'SPECIFIC_APPROVER' ||
                          formData.ruleType === 'HYBRID') && (
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              disabled={!selectedApprovers.includes(manager.id)}
                              checked={specialApprovers.includes(manager.id)}
                              onChange={() => toggleSpecialApprover(manager.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {formData.ruleType === 'SPECIFIC_APPROVER' && (
                <>⭐ Special approvers can auto-approve regardless of other approvals</>
              )}
              {formData.ruleType === 'HYBRID' && (
                <>⭐ Expense is approved if special approver approves OR percentage threshold is met</>
              )}
            </p>
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
              disabled={createMutation.isPending || selectedApprovers.length === 0}
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
