'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Settings, 
  CheckSquare,
  LogOut,
  Menu,
  X,
  Search,
  User
} from 'lucide-react'
import NotificationPanel from '@/components/ui/NotificationPanelDemo'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare, roles: ['MANAGER', 'ADMIN'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Approval Rules', href: '/dashboard/approval-rules', icon: Settings, roles: ['ADMIN'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(session?.user?.role || '')
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fadeIn">
              💰 Expense Manager
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-slate-200/50 animate-slideIn">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {session?.user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mt-1">
                  {session?.user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] animate-slideIn
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}
                    `}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="border-t border-slate-200/50 p-3">
            <button
              onClick={() => signOut({ 
                callbackUrl: '/auth/signin',
                redirect: true 
              })}
              className="group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header for mobile */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-white/20 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-x-4">
            <NotificationPanel />
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex sticky top-0 z-30 h-16 items-center gap-x-4 border-b border-white/20 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 font-medium placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
            <NotificationPanel />
          </div>
        </div>

        <main className="py-6 animate-fadeIn">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
