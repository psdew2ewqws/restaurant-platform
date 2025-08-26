import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid
} from '@heroicons/react/24/solid'
import { useLanguage } from '../contexts/LanguageContext'

// Enhanced order data structure
const mockOrdersData = [
  {
    id: 1001,
    orderNumber: 'ORD-1001',
    customer: { 
      name: 'Ahmed Al-Mansouri', 
      phone: '+971501234567',
      address: 'Dubai Marina, Tower A, Apt 501'
    },
    branch: 'Downtown',
    items: [
      { name: 'Chicken Shawarma Combo', quantity: 2, price: 65.00 },
      { name: 'Falafel Plate', quantity: 1, price: 35.50 },
      { name: 'Fresh Orange Juice', quantity: 2, price: 24.00 }
    ],
    subtotal: 124.50,
    tax: 6.23,
    deliveryFee: 15.00,
    total: 145.73,
    status: 'preparing',
    priority: 'high',
    orderTime: new Date(Date.now() - 8 * 60 * 1000),
    estimatedDelivery: new Date(Date.now() + 22 * 60 * 1000),
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    deliveryType: 'delivery',
    specialInstructions: 'No onions, extra sauce on the side',
    assignedStaff: 'Mohammed Ali'
  },
  {
    id: 1002,
    orderNumber: 'ORD-1002',
    customer: { 
      name: 'Sarah Johnson', 
      phone: '+971509876543',
      address: 'Business Bay, Executive Tower, Office 1205'
    },
    branch: 'Mall Branch',
    items: [
      { name: 'Mixed Grill Platter', quantity: 1, price: 78.00 },
      { name: 'Arabic Bread', quantity: 3, price: 18.00 },
      { name: 'Tabbouleh Salad', quantity: 1, price: 28.00 }
    ],
    subtotal: 124.00,
    tax: 6.20,
    deliveryFee: 0,
    total: 130.20,
    status: 'ready',
    priority: 'normal',
    orderTime: new Date(Date.now() - 18 * 60 * 1000),
    estimatedDelivery: null,
    paymentMethod: 'Cash',
    paymentStatus: 'pending',
    deliveryType: 'pickup',
    specialInstructions: 'Call when ready',
    assignedStaff: 'Fatima Hassan'
  },
  {
    id: 1003,
    orderNumber: 'ORD-1003',
    customer: { 
      name: 'Omar Al-Zahra', 
      phone: '+971502345678',
      address: 'Jumeirah Beach Residence, Building 3, Apt 2011'
    },
    branch: 'Airport',
    items: [
      { name: 'Lamb Biryani', quantity: 1, price: 85.00 },
      { name: 'Baklava', quantity: 2, price: 36.00 },
      { name: 'Turkish Coffee', quantity: 1, price: 18.00 }
    ],
    subtotal: 139.00,
    tax: 6.95,
    deliveryFee: 18.00,
    total: 163.95,
    status: 'confirmed',
    priority: 'normal',
    orderTime: new Date(Date.now() - 3 * 60 * 1000),
    estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000),
    paymentMethod: 'Online',
    paymentStatus: 'paid',
    deliveryType: 'delivery',
    specialInstructions: 'Ring bell twice, apartment entrance',
    assignedStaff: 'Khalid Ahmed'
  },
  {
    id: 1004,
    orderNumber: 'ORD-1004',
    customer: { 
      name: 'Mariam Al-Rashid', 
      phone: '+971507654321',
      address: 'Sheikh Zayed Road, Emirates Tower, Floor 45'
    },
    branch: 'City Center',
    items: [
      { name: 'Vegetarian Combo', quantity: 2, price: 96.00 },
      { name: 'Hummus with Bread', quantity: 1, price: 25.00 },
      { name: 'Mint Lemonade', quantity: 3, price: 36.00 }
    ],
    subtotal: 157.00,
    tax: 7.85,
    deliveryFee: 12.00,
    total: 176.85,
    status: 'delivered',
    priority: 'normal',
    orderTime: new Date(Date.now() - 45 * 60 * 1000),
    estimatedDelivery: new Date(Date.now() - 15 * 60 * 1000),
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    deliveryType: 'delivery',
    specialInstructions: 'Leave at reception desk',
    assignedStaff: 'Ahmed Nasser'
  }
]

export function OrderManagement() {
  const [orders, setOrders] = useState(mockOrdersData)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const { t } = useLanguage()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getTimeElapsed = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m ago`
  }

  const getOrderStatusConfig = (status: string) => {
    const configs = {
      confirmed: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircleIcon,
        label: 'Confirmed'
      },
      preparing: { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: ClockIconSolid,
        label: 'Preparing'
      },
      ready: { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircleIconSolid,
        label: 'Ready'
      },
      delivered: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: CheckCircleIconSolid,
        label: 'Delivered'
      }
    }
    return configs[status] || configs.confirmed
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: { color: 'bg-red-100 text-red-800', label: 'High Priority' },
      normal: { color: 'bg-gray-100 text-gray-600', label: 'Normal' },
      low: { color: 'bg-green-100 text-green-600', label: 'Low Priority' }
    }
    return configs[priority] || configs.normal
  }

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery)
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesBranch = branchFilter === 'all' || order.branch === branchFilter
      
      return matchesSearch && matchesStatus && matchesBranch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.orderTime.getTime() - a.orderTime.getTime()
        case 'oldest': return a.orderTime.getTime() - b.orderTime.getTime()
        case 'highest': return b.total - a.total
        case 'lowest': return a.total - b.total
        default: return 0
      }
    })

  const branches = Array.from(new Set(orders.map(order => order.branch)))
  const statuses = ['confirmed', 'preparing', 'ready', 'delivered']

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
            <p className="text-sm text-gray-600">
              Manage and track all restaurant orders in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{filteredOrders.length} orders found</span>
          <span>Total Value: {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total, 0))}</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const statusConfig = getOrderStatusConfig(order.status)
          const priorityConfig = getPriorityConfig(order.priority)
          const StatusIcon = statusConfig.icon

          return (
            <div key={order.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.orderNumber}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </span>
                    {order.priority === 'high' && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        {priorityConfig.label}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-gray-600 flex items-center">
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        <span className="ltr-numbers">{order.customer.phone}</span>
                      </p>
                      {order.deliveryType === 'delivery' && (
                        <p className="text-gray-600 flex items-start mt-1">
                          <MapPinIcon className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{order.customer.address}</span>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Branch: <span className="font-medium text-gray-900">{order.branch}</span></p>
                      <p className="text-gray-600">Staff: <span className="font-medium text-gray-900">{order.assignedStaff}</span></p>
                      <p className="text-gray-600">Type: <span className="font-medium text-gray-900 capitalize">{order.deliveryType}</span></p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Ordered: <span className="font-medium text-gray-900 ml-1 ltr-numbers">{getTimeElapsed(order.orderTime)}</span>
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-gray-600 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          ETA: <span className="font-medium text-gray-900 ml-1 ltr-numbers">{formatTime(order.estimatedDelivery)}</span>
                        </p>
                      )}
                      <p className="text-gray-600">Payment: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span></p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 ltr-numbers">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-500 ltr-numbers">
                        {order.items.length} items • {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <button className="btn-secondary p-2">
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            <span className="ltr-numbers">{item.quantity}x</span> {item.name}
                          </span>
                          <span className="font-medium text-gray-900 ltr-numbers">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    {order.specialInstructions && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Special Instructions:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex space-x-2 mt-4">
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && order.deliveryType === 'delivery' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Mark Delivered
                        </button>
                      )}
                      <button className="btn-secondary text-xs px-3 py-1">
                        Call Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredOrders.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  )
}