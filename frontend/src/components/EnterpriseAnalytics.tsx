import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PremiumButton, ButtonGroup } from './PremiumButton'

interface AnalyticsData {
  period: string
  revenue: number
  orders: number
  customers: number
  avgOrderValue: number
  growth: number
}

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  subtitle?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, subtitle }) => {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-4 h-4" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface EnterpriseAnalyticsProps {
  timeRange?: '24h' | '7d' | '30d' | '90d'
  branchId?: string
}

export const EnterpriseAnalytics: React.FC<EnterpriseAnalyticsProps> = ({
  timeRange = '7d',
  branchId
}) => {
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'performance'>('revenue')
  
  // Mock data - in real app, fetch from API based on timeRange and branchId
  const analyticsData: AnalyticsData[] = useMemo(() => [
    { period: '2024-08-19', revenue: 12500, orders: 89, customers: 67, avgOrderValue: 140.45, growth: 12.5 },
    { period: '2024-08-20', revenue: 14200, orders: 95, customers: 78, avgOrderValue: 149.47, growth: 13.6 },
    { period: '2024-08-21', revenue: 13800, orders: 88, customers: 71, avgOrderValue: 156.82, growth: 10.4 },
    { period: '2024-08-22', revenue: 15600, orders: 102, customers: 86, avgOrderValue: 152.94, growth: 15.2 },
    { period: '2024-08-23', revenue: 16800, orders: 118, customers: 94, avgOrderValue: 142.37, growth: 18.7 },
    { period: '2024-08-24', revenue: 18200, orders: 127, customers: 103, avgOrderValue: 143.31, growth: 22.3 },
    { period: '2024-08-25', revenue: 17500, orders: 115, customers: 89, avgOrderValue: 152.17, growth: 19.8 }
  ], [])

  const categoryData = useMemo(() => [
    { name: 'Main Dishes', value: 45, revenue: 8100, color: '#3B82F6' },
    { name: 'Appetizers', value: 25, revenue: 4500, color: '#8B5CF6' },
    { name: 'Beverages', value: 20, revenue: 3600, color: '#10B981' },
    { name: 'Desserts', value: 10, revenue: 1800, color: '#F59E0B' }
  ], [])

  const currentMetrics = useMemo(() => {
    const latest = analyticsData[analyticsData.length - 1]
    const previous = analyticsData[analyticsData.length - 2]
    
    return {
      revenue: {
        value: `$${latest.revenue.toLocaleString()}`,
        change: ((latest.revenue - previous.revenue) / previous.revenue) * 100
      },
      orders: {
        value: latest.orders.toString(),
        change: ((latest.orders - previous.orders) / previous.orders) * 100
      },
      customers: {
        value: latest.customers.toString(),
        change: ((latest.customers - previous.customers) / previous.customers) * 100
      },
      avgOrderValue: {
        value: `$${latest.avgOrderValue.toFixed(2)}`,
        change: ((latest.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100
      }
    }
  }, [analyticsData])

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'revenue':
        return [`$${value.toLocaleString()}`, 'Revenue']
      case 'orders':
        return [`${value}`, 'Orders']
      case 'avgOrderValue':
        return [`$${value.toFixed(2)}`, 'Avg Order Value']
      default:
        return [value, name]
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatTooltipValue(entry.value, entry.dataKey)[1]}: {formatTooltipValue(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={currentMetrics.revenue.value}
          change={currentMetrics.revenue.change}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          subtitle="Last 24 hours"
        />
        <MetricCard
          title="Orders"
          value={currentMetrics.orders.value}
          change={currentMetrics.orders.change}
          icon={<ShoppingBagIcon className="w-5 h-5" />}
          subtitle="Total orders today"
        />
        <MetricCard
          title="Customers"
          value={currentMetrics.customers.value}
          change={currentMetrics.customers.change}
          icon={<UsersIcon className="w-5 h-5" />}
          subtitle="Unique customers"
        />
        <MetricCard
          title="Avg Order Value"
          value={currentMetrics.avgOrderValue.value}
          change={currentMetrics.avgOrderValue.change}
          icon={<ClockIcon className="w-5 h-5" />}
          subtitle="Per order average"
        />
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            <p className="text-sm text-gray-600">Detailed insights into business performance</p>
          </div>
          <ButtonGroup align="right" spacing="tight">
            <PremiumButton
              variant={activeChart === 'revenue' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('revenue')}
            >
              Revenue
            </PremiumButton>
            <PremiumButton
              variant={activeChart === 'orders' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('orders')}
            >
              Orders
            </PremiumButton>
            <PremiumButton
              variant={activeChart === 'performance' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('performance')}
            >
              Performance
            </PremiumButton>
          </ButtonGroup>
        </div>

        {/* Main Charts */}
        <div className="h-80">
          {activeChart === 'revenue' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="period" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'orders' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'performance' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgOrderValue"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="customers"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Performance & Growth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% ($${props.payload.revenue.toLocaleString()})`,
                    props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm text-gray-600">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="period"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <ReferenceLine y={15} stroke="#EF4444" strokeDasharray="5 5" />
                <Area
                  type="monotone"
                  dataKey="growth"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Average Growth</span>
            <span className="font-semibold text-emerald-600">+15.7%</span>
          </div>
        </div>
      </div>
    </div>
  )
}