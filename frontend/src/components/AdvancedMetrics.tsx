import { useState } from 'react'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

// Advanced business metrics mock data
const advancedMetrics = {
  hourlyPerformance: [
    { hour: '09:00', orders: 12, revenue: 1850.25, avgWaitTime: 8.2 },
    { hour: '10:00', orders: 18, revenue: 2340.50, avgWaitTime: 6.5 },
    { hour: '11:00', orders: 25, revenue: 3120.75, avgWaitTime: 9.1 },
    { hour: '12:00', orders: 42, revenue: 5890.30, avgWaitTime: 12.3 },
    { hour: '13:00', orders: 38, revenue: 5234.80, avgWaitTime: 11.8 },
    { hour: '14:00', orders: 28, revenue: 3890.45, avgWaitTime: 8.9 },
    { hour: '15:00', orders: 15, revenue: 2145.60, avgWaitTime: 6.2 }
  ],
  weeklyTrends: {
    revenue: { current: 164532.89, previous: 152341.22, growth: '+8.0%' },
    orders: { current: 1247, previous: 1189, growth: '+4.9%' },
    avgOrderValue: { current: 131.95, previous: 128.14, growth: '+3.0%' },
    customerSatisfaction: { current: 4.7, previous: 4.6, growth: '+2.2%' }
  },
  topProducts: [
    { name: 'Chicken Shawarma Combo', orders: 89, revenue: 2134.50, margin: '68%' },
    { name: 'Mixed Grill Platter', orders: 67, revenue: 3215.80, margin: '72%' },
    { name: 'Falafel Special', orders: 54, revenue: 1296.00, margin: '75%' },
    { name: 'Lamb Kabsa', orders: 43, revenue: 2021.40, margin: '70%' },
    { name: 'Fresh Juice Combo', orders: 78, revenue: 936.00, margin: '85%' }
  ],
  operationalMetrics: {
    kitchenEfficiency: 87.5,
    staffUtilization: 82.3,
    inventoryTurnover: 12.4,
    customerRetentionRate: 73.2
  }
}

export function AdvancedMetrics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('today')
  const { t } = useLanguage()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getTrendIcon = (trend: string) => {
    return trend.startsWith('+') ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  }

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="input-field text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>

        {/* Key Trends */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Revenue Growth</span>
              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 ltr-numbers">
                {formatCurrency(advancedMetrics.weeklyTrends.revenue.current)}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                {advancedMetrics.weeklyTrends.revenue.growth}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Orders Growth</span>
              <ChartBarIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 ltr-numbers">
                {advancedMetrics.weeklyTrends.orders.current.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                {advancedMetrics.weeklyTrends.orders.growth}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Order Value</span>
              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 ltr-numbers">
                {formatCurrency(advancedMetrics.weeklyTrends.avgOrderValue.current)}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                {advancedMetrics.weeklyTrends.avgOrderValue.growth}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
              <UsersIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 ltr-numbers">
                {advancedMetrics.weeklyTrends.customerSatisfaction.current}/5.0
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">
                {advancedMetrics.weeklyTrends.customerSatisfaction.growth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Time</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Orders</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Revenue</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Avg Wait</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {advancedMetrics.hourlyPerformance.map((hour, index) => (
                <tr key={hour.hour} className="hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm font-medium text-gray-900 ltr-numbers">
                    {hour.hour}
                  </td>
                  <td className="py-3 px-2 text-right text-sm text-gray-900 ltr-numbers">
                    {hour.orders}
                  </td>
                  <td className="py-3 px-2 text-right text-sm font-medium text-gray-900 ltr-numbers">
                    {formatCurrency(hour.revenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-sm text-gray-600 ltr-numbers">
                    {hour.avgWaitTime}m
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="w-16 bg-gray-200 rounded-full h-2 ml-auto">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (hour.orders / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products & Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            {advancedMetrics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-gray-400 w-6">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500 ltr-numbers">
                        {product.orders} orders • {product.margin} margin
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 ltr-numbers">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Excellence</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Kitchen Efficiency</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full" 
                    style={{ width: `${advancedMetrics.operationalMetrics.kitchenEfficiency}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 ltr-numbers">
                  {advancedMetrics.operationalMetrics.kitchenEfficiency}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Staff Utilization</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${advancedMetrics.operationalMetrics.staffUtilization}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 ltr-numbers">
                  {advancedMetrics.operationalMetrics.staffUtilization}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Inventory Turnover</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (advancedMetrics.operationalMetrics.inventoryTurnover / 20) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 ltr-numbers">
                  {advancedMetrics.operationalMetrics.inventoryTurnover}x
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Customer Retention</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${advancedMetrics.operationalMetrics.customerRetentionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 ltr-numbers">
                  {advancedMetrics.operationalMetrics.customerRetentionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}