'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X, Check, Trash2, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { mockNotificationService, type MockNotification } from '@/lib/mockNotificationService'

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<MockNotification[]>([])
  const [showDemo, setShowDemo] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Initialize notifications and subscribe to changes
  useEffect(() => {
    const initialNotifications = mockNotificationService.getNotifications()
    setNotifications(initialNotifications)

    const unsubscribe = mockNotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
    })

    return unsubscribe
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = (id: string) => {
    mockNotificationService.markAsRead(id)
  }

  const markAllAsRead = () => {
    mockNotificationService.markAllAsRead()
  }

  const deleteNotification = (id: string) => {
    mockNotificationService.deleteNotification(id)
  }

  const addDemoNotification = () => {
    mockNotificationService.simulateNewNotification()
    setShowDemo(true)
    setTimeout(() => setShowDemo(false), 3000)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
      >
        <Bell className={`h-5 w-5 transition-all duration-300 ${unreadCount > 0 ? 'animate-pulse text-blue-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse font-medium transform scale-110">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Demo indicator */}
        {showDemo && (
          <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-green-500 animate-ping"></div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-xl z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Demo button */}
              <button
                onClick={addDemoNotification}
                className="p-1 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                title="Add demo notification"
              >
                <Plus className="h-4 w-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded text-green-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200/50 text-center">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Could navigate to a full notifications page
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  View all notifications
                </button>
                <div className="text-xs text-gray-500">
                  💡 Click + to add demo notification
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel