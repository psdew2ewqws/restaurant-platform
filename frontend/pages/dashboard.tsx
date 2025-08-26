import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useLanguage } from '../src/contexts/LanguageContext'
import { 
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  BuildingOfficeIcon,
  CakeIcon,
  TagIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  SpeakerWaveIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  UsersIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  PresentationChartLineIcon,
  ListBulletIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid'

// Import advanced components
import { EnterpriseAnalytics } from '../src/components/EnterpriseAnalytics'
import { RealTimeAnalytics } from '../src/components/RealTimeAnalytics'
import { CacheManager } from '../src/components/CacheManager'
import { OrderManagement } from '../src/components/OrderManagement'
import { NotificationCenter } from '../src/components/NotificationCenter'
import { EnterpriseDataExport } from '../src/components/EnterpriseDataExport'
import { PerformanceMonitor } from '../src/components/PerformanceMonitor'
import { OptimizedDataTable } from '../src/components/OptimizedDataTable'
import { PremiumButton, ButtonGroup, ProfessionalCard } from '../src/components/PremiumButton'

// Enhanced business intelligence data
const mockRealtimeMetrics = {
  revenue: {
    today: 24567.89,
    yesterday: 22134.56,
    trend: '+11.0%'
  },
  orders: {
    total: 147,
    pending: 23,
    processing: 8,
    completed: 116,
    cancelled: 0
  },
  performance: {
    avgOrderValue: 167.12,
    avgPrepTime: '12.3 min',
    customerSatisfaction: 4.8,
    systemUptime: '99.9%'
  },
  branches: [
    { id: 1, name: 'Downtown', status: 'active', orders: 45, revenue: 7234.56, staff: 12 },
    { id: 2, name: 'Mall Branch', status: 'active', orders: 38, revenue: 6189.23, staff: 9 },
    { id: 3, name: 'Airport', status: 'active', orders: 42, revenue: 6834.12, staff: 11 },
    { id: 4, name: 'City Center', status: 'active', orders: 22, revenue: 4309.98, staff: 7 }
  ]
}

const mockLiveOrders = [
  { 
    id: 1001, 
    orderNumber: 'ORD-1001', 
    customer: { name: 'Ahmed Ali', phone: '+971501234567' },
    branch: 'Downtown', 
    items: ['2x Shawarma Combo', '1x Falafel Plate', '2x Fresh Juice'],
    total: 145.50, 
    status: 'preparing',
    priority: 'high',
    orderTime: new Date(Date.now() - 8 * 60 * 1000),
    estimatedReady: new Date(Date.now() + 7 * 60 * 1000),
    paymentMethod: 'Card'
  },
  { 
    id: 1002, 
    orderNumber: 'ORD-1002', 
    customer: { name: 'Sarah Mohammed', phone: '+971509876543' },
    branch: 'Mall Branch', 
    items: ['1x Mixed Grill', '3x Arabic Bread', '1x Tabbouleh'],
    total: 89.75, 
    status: 'ready',
    priority: 'normal',
    orderTime: new Date(Date.now() - 18 * 60 * 1000),
    estimatedReady: new Date(Date.now() - 2 * 60 * 1000),
    paymentMethod: 'Cash'
  },
  { 
    id: 1003, 
    orderNumber: 'ORD-1003', 
    customer: { name: 'Omar Hassan', phone: '+971502345678' },
    branch: 'Airport', 
    items: ['1x Chicken Biryani', '2x Baklava', '1x Turkish Coffee'],
    total: 67.25, 
    status: 'confirmed',
    priority: 'normal',
    orderTime: new Date(Date.now() - 3 * 60 * 1000),
    estimatedReady: new Date(Date.now() + 15 * 60 * 1000),
    paymentMethod: 'Online'
  }
]

const systemHealth = [
  { component: 'Database', status: 'healthy', uptime: '99.9%', latency: '12ms' },
  { component: 'POS Integration', status: 'healthy', uptime: '99.8%', latency: '45ms' },
  { component: 'Payment Gateway', status: 'warning', uptime: '98.2%', latency: '230ms' },
  { component: 'Phone System', status: 'maintenance', uptime: '95.1%', latency: 'N/A' }
]

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const { language, setLanguage, t, isRTL } = useLanguage()

  const dashboardTabs = [
    { id: 'overview', name: t('overview'), icon: ChartBarIcon },
    { id: 'analytics', name: t('analytics'), icon: PresentationChartLineIcon },
    { id: 'orders', name: t('orders'), icon: ListBulletIcon },
    { id: 'operations', name: t('operations'), icon: BuildingOfficeIcon },
    { id: 'settings', name: t('settings'), icon: Cog6ToothIcon }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

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
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      preparing: { color: 'bg-amber-100 text-amber-800', icon: ClockIconSolid },
      ready: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircleIconSolid },
      delivered: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIconSolid }
    }
    return configs[status] || configs.confirmed
  }

  const getSystemStatusConfig = (status: string) => {
    const configs = {
      healthy: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircleIconSolid },
      warning: { color: 'text-amber-600', bg: 'bg-amber-50', icon: ExclamationCircleIconSolid },
      maintenance: { color: 'text-red-600', bg: 'bg-red-50', icon: ExclamationCircleIconSolid }
    }
    return configs[status] || configs.healthy
  }

  const businessModules = [
    {
      id: 'analytics',
      title: t('analytics_operations'),
      icon: ChartBarIcon,
      items: [
        { name: t('charts_reports'), href: '/analytics/reports', icon: ChartBarIcon },
        { name: t('live_orders'), href: '/operations/live-orders', icon: ClockIcon },
        { name: t('order_history'), href: '/operations/history', icon: DocumentTextIcon }
      ]
    },
    {
      id: 'branches',
      title: t('branches'),
      icon: BuildingOfficeIcon,
      items: [
        { name: t('manage_branches'), href: '/branches', icon: BuildingOfficeIcon }
      ]
    },
    {
      id: 'menu',
      title: t('menu_management'),
      icon: CakeIcon,
      items: [
        { name: t('products_menus'), href: '/menu/products', icon: CakeIcon },
        { name: t('availability'), href: '/menu/availability', icon: ClockIcon },
        { name: t('discounts_promocodes'), href: '/menu/promotions', icon: TagIcon }
      ]
    },
    {
      id: 'customers',
      title: t('customer_management'),
      icon: UserGroupIcon,
      items: [
        { name: t('customer_info'), href: '/customers', icon: UserGroupIcon },
        { name: t('complaints'), href: '/customers/complaints', icon: ExclamationTriangleIcon },
        { name: t('blacklist'), href: '/customers/blacklist', icon: XMarkIcon }
      ]
    },
    {
      id: 'settings',
      title: t('settings'),
      icon: UsersIcon,
      items: [
        { name: t('sounds'), href: '/settings/sounds', icon: SpeakerWaveIcon },
        { name: t('printing'), href: '/settings/printing', icon: PrinterIcon },
        { name: t('chatbot'), href: '/settings/chatbot', icon: ChatBubbleLeftRightIcon },
        { name: t('delivery'), href: '/settings/delivery', icon: TruckIcon },
        { name: t('users'), href: '/settings/users', icon: UsersIcon },
        { name: t('phone_ordering'), href: '/settings/phone', icon: PhoneIcon }
      ]
    }
  ]

  return (
    <>
      <Head>
        <title>Restaurant Management Dashboard | Enterprise</title>
        <meta name="description" content="Professional restaurant management system for business operations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Professional Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Title */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">RM</span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {t('restaurant_management')}
                  </h1>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center space-x-4">
                {/* Enterprise Data Export */}
                <EnterpriseDataExport />

                {/* System Status */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-700 text-sm font-medium">
                    {t('system_online')}
                  </span>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`lang-switcher ${language === 'en' ? 'active' : 'inactive'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`lang-switcher ${language === 'ar' ? 'active' : 'inactive'}`}
                  >
                    AR
                  </button>
                </div>

                {/* Notifications */}
                <NotificationCenter />

                {/* Current Time */}
                <div className="text-sm text-gray-600 font-mono">
                  {formatTime(currentTime)}
                </div>

                {/* User Menu */}
                <button className="btn-secondary">
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {dashboardTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Key Performance Indicators */}
              <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue KPI */}
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{t('todays_sales')}</h3>
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 ltr-numbers">
                    {formatCurrency(mockRealtimeMetrics.revenue.today)}
                  </span>
                  <span className="text-sm font-medium text-emerald-600 flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                    {mockRealtimeMetrics.revenue.trend}
                  </span>
                </div>
              </div>

              {/* Orders KPI */}
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{t('orders_today')}</h3>
                  <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 ltr-numbers">
                    {mockRealtimeMetrics.orders.total}
                  </span>
                  <span className="text-sm text-gray-600">
                    {mockRealtimeMetrics.orders.pending} pending
                  </span>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{t('avg_order_value')}</h3>
                  <BanknotesIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 ltr-numbers">
                    {formatCurrency(mockRealtimeMetrics.performance.avgOrderValue)}
                  </span>
                </div>
              </div>

              {/* Active Branches */}
              <div className="stats-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{t('active_branches')}</h3>
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 ltr-numbers">
                    {mockRealtimeMetrics.branches.length}
                  </span>
                  <span className="text-sm text-gray-600">all active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Management Modules */}
            <div className="lg:col-span-2 space-y-4">
              <ProfessionalCard
                title={t('management_sections')}
                description="Access all business operations and management tools"
                actions={null}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessModules.map((module) => (
                    <div key={module.id} className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <module.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">{module.title}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {module.items.map((item) => (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-all duration-150 group/item"
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="w-3 h-3 text-gray-500 group-hover/item:text-blue-600 transition-colors" />
                              <span className="text-xs text-gray-700 group-hover/item:text-gray-900 font-medium">
                                {item.name}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ProfessionalCard>

              {/* Branch Performance */}
              <ProfessionalCard
                title="Branch Performance Analytics"
                description="Real-time performance metrics across all locations"
                actions={
                  <ButtonGroup align="right">
                    <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </select>
                    <PremiumButton 
                      variant="outline" 
                      size="sm"
                      icon={<DocumentArrowDownIcon className="w-4 h-4" />}
                    >
                      Export
                    </PremiumButton>
                  </ButtonGroup>
                }
              >
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Branch Location
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Orders Today
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Revenue (AED)
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Staff Count
                        </th>
                        <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Operational Status
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mockRealtimeMetrics.branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{branch.name}</div>
                                <div className="text-xs text-gray-500">ID: BR-{String(branch.id).padStart(3, '0')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="text-sm font-bold text-gray-900 ltr-numbers">{branch.orders}</div>
                            <div className="text-xs text-emerald-600 font-medium">+12% vs yesterday</div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="text-sm font-bold text-gray-900 ltr-numbers">
                              {formatCurrency(branch.revenue)}
                            </div>
                            <div className="text-xs text-emerald-600 font-medium">+8.5% growth</div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="text-sm font-medium text-gray-900 ltr-numbers">{branch.staff}</div>
                            <div className="text-xs text-gray-500">on shift</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                              Operational
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <PremiumButton 
                              variant="primary" 
                              size="xs"
                              icon={<Cog6ToothIcon className="w-3 h-3" />}
                            >
                              {t('manage')}
                            </PremiumButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Performance Summary Footer */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 ltr-numbers">
                        {mockRealtimeMetrics.branches.reduce((sum, b) => sum + b.orders, 0)}
                      </div>
                      <div className="text-xs font-medium text-blue-700">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 ltr-numbers">
                        {formatCurrency(mockRealtimeMetrics.branches.reduce((sum, b) => sum + b.revenue, 0))}
                      </div>
                      <div className="text-xs font-medium text-blue-700">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 ltr-numbers">
                        {mockRealtimeMetrics.branches.reduce((sum, b) => sum + b.staff, 0)}
                      </div>
                      <div className="text-xs font-medium text-blue-700">Staff Members</div>
                    </div>
                  </div>
                </div>
              </ProfessionalCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Live Orders */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('live_orders')}</h2>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {t('real_time')}
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {mockLiveOrders.map((order) => {
                    const statusConfig = getOrderStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <div key={order.id} className="live-order-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.branch}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 ltr-numbers">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getTimeElapsed(order.orderTime)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <p key={idx}>{item}</p>
                          ))}
                          {order.items.length > 2 && (
                            <p>+{order.items.length - 2} more items</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href="/operations/live-orders" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('view_all_live_orders')}
                  </Link>
                </div>
              </div>

              {/* System Health */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('system_health')}</h2>
                
                <div className="space-y-3">
                  {systemHealth.map((system) => {
                    const statusConfig = getSystemStatusConfig(system.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <div key={system.component} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{system.component}</p>
                            <p className="text-xs text-gray-500">
                              Uptime: <span className="ltr-numbers">{system.uptime}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 ltr-numbers">{system.latency}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <EnterpriseAnalytics />
              <RealTimeAnalytics />
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && <OrderManagement />}

          {/* Operations Tab */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              {/* Performance Monitoring */}
              <PerformanceMonitor />
              
              {/* Cache Management */}
              <CacheManager />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branch Operations */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Operations</h2>
                  <div className="space-y-4">
                    {mockRealtimeMetrics.branches.map((branch) => (
                      <div key={branch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{branch.name}</h3>
                            <p className="text-sm text-gray-600">{branch.staff} staff members</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 ltr-numbers">
                            {branch.orders} orders
                          </p>
                          <p className="text-sm text-gray-600 ltr-numbers">
                            {formatCurrency(branch.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Alerts */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations Alerts</h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">High Wait Time Alert</p>
                        <p className="text-sm text-amber-600">Downtown branch experiencing 15+ min wait times</p>
                        <p className="text-xs text-amber-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircleIconSolid className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Staff Check-in</p>
                        <p className="text-sm text-blue-600">3 new staff members checked in at Mall Branch</p>
                        <p className="text-xs text-blue-500 mt-1">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircleIconSolid className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">System Performance</p>
                        <p className="text-sm text-emerald-600">All systems running optimally across all branches</p>
                        <p className="text-xs text-emerald-500 mt-1">8 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Performance Dashboard */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Staff Member</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Branch</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Orders Handled</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Avg Processing Time</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Mohammed Ali', branch: 'Downtown', orders: 23, avgTime: '8.2 min', status: 'active' },
                        { name: 'Fatima Hassan', branch: 'Mall Branch', orders: 19, avgTime: '9.1 min', status: 'active' },
                        { name: 'Khalid Ahmed', branch: 'Airport', orders: 21, avgTime: '7.8 min', status: 'break' },
                        { name: 'Ahmed Nasser', branch: 'City Center', orders: 17, avgTime: '10.2 min', status: 'active' }
                      ].map((staff, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">{staff.name}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{staff.branch}</td>
                          <td className="py-3 px-2 text-right text-sm text-gray-900 ltr-numbers">{staff.orders}</td>
                          <td className="py-3 px-2 text-right text-sm text-gray-600 ltr-numbers">{staff.avgTime}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              staff.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {staff.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" defaultValue="Your Restaurant Chain" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                          <option value="AED">AED - UAE Dirham</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                          <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* System Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Sound Notifications</h4>
                          <p className="text-sm text-gray-600">Play sound for new orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto Print Receipts</h4>
                          <p className="text-sm text-gray-600">Automatically print order receipts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Real-time Sync</h4>
                          <p className="text-sm text-gray-600">Sync data across all devices</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Language Settings</h4>
                      <p className="text-sm text-gray-600">Choose your preferred language and layout</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <PremiumButton
                        variant={language === 'en' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setLanguage('en')}
                      >
                        English
                      </PremiumButton>
                      <PremiumButton
                        variant={language === 'ar' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setLanguage('ar')}
                      >
                        العربية
                      </PremiumButton>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <PremiumButton variant="outline" size="md">
                      Reset to Defaults
                    </PremiumButton>
                    <PremiumButton variant="primary" size="md">
                      Save Settings
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}