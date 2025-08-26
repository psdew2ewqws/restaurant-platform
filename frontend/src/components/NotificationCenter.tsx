import { useState, useEffect } from 'react'
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid
} from '@heroicons/react/24/solid'
import { useLanguage } from '../contexts/LanguageContext'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: 'order' | 'system' | 'staff' | 'inventory' | 'payment'
  severity: 'low' | 'medium' | 'high' | 'critical'
  actionRequired?: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High Kitchen Wait Time',
    message: 'Downtown branch kitchen experiencing delays. Current wait time: 18 minutes.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    category: 'order',
    severity: 'high',
    actionRequired: true
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment Processed',
    message: 'Order #ORD-1001 payment of AED 145.50 successfully processed.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    category: 'payment',
    severity: 'low'
  },
  {
    id: '3',
    type: 'error',
    title: 'POS System Connectivity',
    message: 'Mall Branch POS system experiencing intermittent connectivity issues.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: true,
    category: 'system',
    severity: 'critical',
    actionRequired: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Staff Check-in',
    message: '3 new staff members checked in for evening shift at City Center.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: true,
    category: 'staff',
    severity: 'low'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Low Inventory Alert',
    message: 'Chicken shawarma stock running low at Airport branch. 12 portions remaining.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    read: false,
    category: 'inventory',
    severity: 'medium',
    actionRequired: true
  }
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionRequired'>('all')
  const { t } = useLanguage()

  const unreadCount = notifications.filter(n => !n.read).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length

  const getNotificationIcon = (type: string) => {
    const configs = {
      success: { icon: CheckCircleIconSolid, color: 'text-emerald-600' },
      warning: { icon: ExclamationTriangleIconSolid, color: 'text-amber-600' },
      error: { icon: ExclamationTriangleIconSolid, color: 'text-red-600' },
      info: { icon: InformationCircleIconSolid, color: 'text-blue-600' }
    }
    return configs[type] || configs.info
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'border-l-gray-400 bg-gray-50',
      medium: 'border-l-amber-400 bg-amber-50',
      high: 'border-l-orange-400 bg-orange-50',
      critical: 'border-l-red-500 bg-red-50'
    }
    return colors[severity] || colors.low
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      order: '🍽️',
      system: '⚙️',
      staff: '👥',
      inventory: '📦',
      payment: '💳'
    }
    return icons[category] || '📋'
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTimeElapsed = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m ago`
  }

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread': return !n.read
      case 'actionRequired': return n.actionRequired && !n.read
      default: return true
    }
  })

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('actionRequired')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  filter === 'actionRequired' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Action ({actionRequiredCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <BellIcon className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => {
                  const iconConfig = getNotificationIcon(notification.type)
                  const Icon = iconConfig.icon

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getSeverityColor(notification.severity)} ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                            <span className="text-lg">{getCategoryIcon(notification.category)}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                                {notification.actionRequired && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Action Required
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissNotification(notification.id)
                              }}
                              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <ClockIcon className="w-3 h-3" />
                              <span>{getTimeElapsed(notification.timestamp)}</span>
                              <span className="capitalize">• {notification.severity} priority</span>
                            </div>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}