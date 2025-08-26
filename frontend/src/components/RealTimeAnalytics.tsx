import React, { useState, useEffect, useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts'
import {
  FireIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  StarIcon,
  WifiIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'
import { PremiumButton, ButtonGroup } from './PremiumButton'

interface RealTimeData {
  timestamp: string
  activeOrders: number
  completedOrders: number
  revenue: number
  customerSatisfaction: number
  avgPrepTime: number
  peakLoad: number
}

interface BranchPerformance {
  branchId: string
  name: string
  location: string
  efficiency: number
  satisfaction: number
  orders: number
  revenue: number
  waitTime: number
}

interface AlertData {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: string
  branchId?: string
}

export const RealTimeAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '12h' | '24h'>('4h')
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isLive, setIsLive] = useState(true)

  // Real-time data simulation
  const realTimeData: RealTimeData[] = useMemo(() => {
    const now = new Date()
    const data = []
    const hours = timeRange === '1h' ? 1 : timeRange === '4h' ? 4 : timeRange === '12h' ? 12 : 24
    const intervals = timeRange === '1h' ? 12 : timeRange === '4h' ? 24 : timeRange === '12h' ? 48 : 96

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(now.getTime() - (intervals - i - 1) * (hours * 60 / intervals) * 60000)
      data.push({
        timestamp: timestamp.toISOString(),
        activeOrders: Math.floor(Math.random() * 30) + 10,
        completedOrders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.random() * 2000 + 1000,
        customerSatisfaction: Math.random() * 1.5 + 3.5,
        avgPrepTime: Math.random() * 10 + 8,
        peakLoad: Math.random() * 100
      })
    }
    return data
  }, [timeRange])

  const branchPerformance: BranchPerformance[] = useMemo(() => [
    { branchId: 'b1', name: 'Downtown', location: 'Main St', efficiency: 92, satisfaction: 4.8, orders: 156, revenue: 23400, waitTime: 8.5 },
    { branchId: 'b2', name: 'Mall', location: 'Shopping Center', efficiency: 87, satisfaction: 4.6, orders: 134, revenue: 19800, waitTime: 12.2 },
    { branchId: 'b3', name: 'Airport', location: 'Terminal A', efficiency: 94, satisfaction: 4.9, orders: 189, revenue: 28900, waitTime: 6.8 },
    { branchId: 'b4', name: 'University', location: 'Campus Ave', efficiency: 89, satisfaction: 4.7, orders: 167, revenue: 21300, waitTime: 9.4 }
  ], [])

  // Performance radar data
  const radarData = useMemo(() => [
    { metric: 'Speed', value: 85, fullMark: 100 },
    { metric: 'Quality', value: 92, fullMark: 100 },
    { metric: 'Service', value: 88, fullMark: 100 },
    { metric: 'Efficiency', value: 90, fullMark: 100 },
    { metric: 'Satisfaction', value: 94, fullMark: 100 },
    { metric: 'Innovation', value: 78, fullMark: 100 }
  ], [])

  // Heat map data for order patterns
  const heatMapData = useMemo(() => {
    const data = []
    const branches = ['Downtown', 'Mall', 'Airport', 'University']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    branches.forEach(branch => {
      hours.forEach(hour => {
        data.push({
          branch,
          hour,
          orders: Math.floor(Math.random() * 50) + 5,
          color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
        })
      })
    })
    return data
  }, [])

  // Custom components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const time = new Date(label).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const LiveIndicator = () => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
      <span className="text-sm font-medium text-gray-700">
        {isLive ? 'Live' : 'Paused'}
      </span>
    </div>
  )

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string
    value: number | string
    unit?: string
    change?: number
    icon: React.ComponentType<any>
    color?: 'blue' | 'emerald' | 'amber' | 'red'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-600'
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
              <p className="text-lg font-bold text-gray-900">
                {value}{unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
              </p>
            </div>
          </div>
          {change !== undefined && (
            <div className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Live business intelligence dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <LiveIndicator />
          <ButtonGroup align="right" spacing="tight">
            {(['1h', '4h', '12h', '24h'] as const).map((range) => (
              <PremiumButton
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </PremiumButton>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Orders"
          value={realTimeData[realTimeData.length - 1]?.activeOrders || 0}
          icon={FireIcon}
          color="red"
          change={5.2}
        />
        <MetricCard
          title="Completed Today"
          value={realTimeData.reduce((sum, d) => sum + d.completedOrders, 0)}
          icon={TrendingUpIcon}
          color="emerald"
          change={12.8}
        />
        <MetricCard
          title="Avg Prep Time"
          value={(realTimeData[realTimeData.length - 1]?.avgPrepTime || 0).toFixed(1)}
          unit="min"
          icon={ClockIcon}
          color="amber"
          change={-2.1}
        />
        <MetricCard
          title="Satisfaction"
          value={(realTimeData[realTimeData.length - 1]?.customerSatisfaction || 0).toFixed(1)}
          unit="/5.0"
          icon={StarIcon}
          color="blue"
          change={1.5}
        />
      </div>

      {/* Main analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  stroke="#6B7280"
                  fontSize={11}
                />
                <YAxis yAxisId="left" stroke="#6B7280" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  stroke="#3B82F6"
                  name="Revenue"
                />
                <Bar yAxisId="right" dataKey="activeOrders" fill="#10B981" name="Active Orders" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completedOrders"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  name="Completed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance radar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch performance comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Branch Performance Matrix</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis 
                dataKey="efficiency" 
                domain={[80, 100]}
                name="Efficiency (%)"
                stroke="#6B7280"
                fontSize={11}
              />
              <YAxis 
                dataKey="satisfaction" 
                domain={[4.0, 5.0]}
                name="Satisfaction"
                stroke="#6B7280"
                fontSize={11}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${props.payload.name}: ${value}`,
                  name
                ]}
              />
              <Scatter dataKey="revenue" fill="#3B82F6">
                {branchPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 20}, 70%, 50%)`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {branchPerformance.map((branch, index) => (
            <div key={branch.branchId} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: `hsl(${200 + index * 20}, 70%, 50%)` }}
              />
              <p className="text-sm font-medium text-gray-900">{branch.name}</p>
              <p className="text-xs text-gray-600">{branch.orders} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* System alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
          <BellAlertIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">High Load Warning</p>
              <p className="text-sm text-amber-600">Mall branch experiencing 85% capacity - consider staff reallocation</p>
              <p className="text-xs text-amber-500 mt-1">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">Performance Milestone</p>
              <p className="text-sm text-emerald-600">Downtown branch achieved 95% efficiency rating</p>
              <p className="text-xs text-emerald-500 mt-1">5 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">System Update</p>
              <p className="text-sm text-blue-600">Real-time analytics engine optimized - 15% faster processing</p>
              <p className="text-xs text-blue-500 mt-1">12 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}