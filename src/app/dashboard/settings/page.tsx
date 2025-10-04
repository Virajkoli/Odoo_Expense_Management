'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Building2, 
  Users, 
  Settings as SettingsIcon, 
  Shield, 
  CreditCard,
  Globe,
  Save,
  Info
} from 'lucide-react'

interface Company {
  id: string
  name: string
  currency: string
  country: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('company')

  // Only admins can access settings
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Access Denied</h2>
        <p className="mt-2 text-gray-600">Only administrators can access settings.</p>
      </div>
    )
  }

  const tabs = [
    { id: 'company', name: 'Company Settings', icon: Building2 },
    { id: 'approval', name: 'Approval Rules', icon: Shield },
    { id: 'currency', name: 'Currency Settings', icon: CreditCard },
    { id: 'system', name: 'System Settings', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your company settings and configuration
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'company' && <CompanySettings />}
          {activeTab === 'approval' && <ApprovalRulesSettings />}
          {activeTab === 'currency' && <CurrencySettings />}
          {activeTab === 'system' && <SystemSettings />}
        </div>
      </div>
    </div>
  )
}

function CompanySettings() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
    country: 'United States'
  })

  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const response = await axios.get('/api/company')
      return response.data
    },
  })

  // Update form data when company data is loaded
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        currency: company.currency,
        country: company.country
      })
    }
  }, [company])

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put('/api/company', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Company settings updated successfully')
      queryClient.invalidateQueries({ queryKey: ['company'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update company settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading company settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your company's basic information and regional settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="India">India</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ApprovalRulesSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Approval Rules</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure approval workflows for expense submissions.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Advanced Approval Rules
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Approval rules are managed in the dedicated "Approval Rules" section. 
                <a href="/dashboard/approval-rules" className="font-medium underline hover:text-blue-600">
                  Go to Approval Rules →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Manager Approval</h4>
          <p className="text-sm text-gray-600 mb-3">
            Employees can be set to require manager approval for their expenses.
          </p>
          <p className="text-xs text-gray-500">
            Configure this setting when creating or editing users in the Users section.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Approval Rules</h4>
          <p className="text-sm text-gray-600 mb-3">
            Set up percentage-based, specific approver, or hybrid approval workflows.
          </p>
          <a 
            href="/dashboard/approval-rules"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Manage Approval Rules →
          </a>
        </div>
      </div>
    </div>
  )
}

function CurrencySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Currency Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure currency conversion and exchange rate settings.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Currency Conversion
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Currency conversion is automatically handled using real-time exchange rates.
                The system supports multiple currencies and converts amounts to your company's default currency.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Currencies</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>• USD - US Dollar</div>
            <div>• EUR - Euro</div>
            <div>• GBP - British Pound</div>
            <div>• INR - Indian Rupee</div>
            <div>• CAD - Canadian Dollar</div>
            <div>• AUD - Australian Dollar</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Exchange Rate Provider</h4>
          <p className="text-sm text-gray-600">
            Exchange rates are automatically fetched from reliable financial data providers.
            Rates are updated in real-time to ensure accurate conversions.
          </p>
        </div>
      </div>
    </div>
  )
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          System-wide configuration and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">OCR Settings</h4>
          <p className="text-sm text-gray-600 mb-3">
            Optical Character Recognition (OCR) automatically extracts data from receipt images.
          </p>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableOCR"
              defaultChecked
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="enableOCR" className="ml-2 text-sm text-gray-700">
              Enable automatic receipt data extraction
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Email Notifications</h4>
          <p className="text-sm text-gray-600 mb-3">
            Configure email notifications for expense submissions and approvals.
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailSubmissions"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="emailSubmissions" className="ml-2 text-sm text-gray-700">
                Notify managers when expenses are submitted
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailApprovals"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="emailApprovals" className="ml-2 text-sm text-gray-700">
                Notify employees when expenses are approved/rejected
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Retention</h4>
          <p className="text-sm text-gray-600 mb-3">
            Configure how long system data is retained.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Records
              </label>
              <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border">
                <option>7 years</option>
                <option>5 years</option>
                <option>3 years</option>
                <option>1 year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Logs
              </label>
              <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border">
                <option>2 years</option>
                <option>1 year</option>
                <option>6 months</option>
                <option>3 months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save System Settings
        </button>
      </div>
    </div>
  )
}