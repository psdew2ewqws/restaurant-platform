import React, { useState, useEffect, useCallback } from 'react'
import {
  ServerIcon,
  CloudIcon,
  CircleStackIcon as DatabaseIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PremiumButton, ButtonGroup } from './PremiumButton'

interface CacheMetrics {
  hitRate: number
  missRate: number
  totalRequests: number
  avgResponseTime: number
  cacheSize: number
  memoryUsage: number
}

interface CacheEntry {
  key: string
  size: number
  ttl: number
  hitCount: number
  lastAccessed: string
  type: 'api' | 'static' | 'computed' | 'user'
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: number
}

export const CacheManager: React.FC = () => {
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    cacheSize: 0,
    memoryUsage: 0
  })
  
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0
  })
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCacheType, setSelectedCacheType] = useState<'all' | 'api' | 'static' | 'computed' | 'user'>('all')

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = () => {
      // Mock cache metrics
      setMetrics({
        hitRate: 85.7 + Math.random() * 10,
        missRate: 14.3 + Math.random() * 5,
        totalRequests: 125000 + Math.floor(Math.random() * 10000),
        avgResponseTime: 12.5 + Math.random() * 5,
        cacheSize: 245.8 + Math.random() * 20,
        memoryUsage: 68.3 + Math.random() * 15
      })

      // Mock cache entries
      const mockEntries: CacheEntry[] = [
        { key: 'user:sessions:active', size: 2.3, ttl: 3600, hitCount: 1247, lastAccessed: new Date().toISOString(), type: 'user' },
        { key: 'api:restaurants:list', size: 0.8, ttl: 300, hitCount: 892, lastAccessed: new Date().toISOString(), type: 'api' },
        { key: 'static:assets:images', size: 45.2, ttl: 86400, hitCount: 3421, lastAccessed: new Date().toISOString(), type: 'static' },
        { key: 'computed:analytics:daily', size: 1.7, ttl: 1800, hitCount: 567, lastAccessed: new Date().toISOString(), type: 'computed' },
        { key: 'api:orders:recent', size: 3.1, ttl: 60, hitCount: 2134, lastAccessed: new Date().toISOString(), type: 'api' }
      ]
      setCacheEntries(mockEntries)

      // Mock system health
      setSystemHealth({
        status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.05 ? 'warning' : 'critical',
        cpu: 25 + Math.random() * 40,
        memory: 60 + Math.random() * 25,
        disk: 45 + Math.random() * 30,
        network: 15 + Math.random() * 20,
        uptime: 872345 + Math.floor(Math.random() * 10000)
      })
    }

    generateMockData()
    const interval = setInterval(generateMockData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleCacheRefresh = useCallback(async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }, [])

  const handleCacheClear = useCallback(async (type?: string) => {
    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 500))
    // Update entries
    if (type) {
      setCacheEntries(prev => prev.filter(entry => entry.type !== type))
    } else {
      setCacheEntries([])
    }
  }, [])

  const filteredEntries = cacheEntries.filter(entry => 
    selectedCacheType === 'all' || entry.type === selectedCacheType
  )

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const StatusIndicator = ({ status }: { status: string }) => (
    <div className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(status)}`}>
      {status === 'healthy' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
      {status === 'warning' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
      {status === 'critical' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color = 'blue',
    trend
  }: {
    title: string
    value: number | string
    unit?: string
    icon: React.ComponentType<any>
    color?: 'blue' | 'emerald' | 'amber' | 'red'
    trend?: number
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-600'
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cache Management</h2>
          <p className="text-sm text-gray-600 mt-1">Enterprise-grade caching and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <StatusIndicator status={systemHealth.status} />
          <ButtonGroup align="right" spacing="tight">
            <PremiumButton
              variant="outline"
              size="sm"
              loading={isRefreshing}
              onClick={handleCacheRefresh}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </PremiumButton>
            <PremiumButton
              variant="destructive"
              size="sm"
              onClick={() => handleCacheClear()}
            >
              Clear All
            </PremiumButton>
          </ButtonGroup>
        </div>
      </div>

      {/* Cache metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Cache Hit Rate"
          value={metrics.hitRate}
          unit="%"
          icon={CheckCircleIcon}
          color="emerald"
          trend={2.3}
        />
        <MetricCard
          title="Response Time"
          value={metrics.avgResponseTime}
          unit="ms"
          icon={ClockIcon}
          color="blue"
          trend={-5.7}
        />
        <MetricCard
          title="Cache Size"
          value={metrics.cacheSize}
          unit="MB"
          icon={DatabaseIcon}
          color="amber"
          trend={8.1}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.memoryUsage}
          unit="%"
          icon={CpuChipIcon}
          color="red"
          trend={1.2}
        />
      </div>

      {/* System health monitoring */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="mb-2">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                systemHealth.cpu > 80 ? 'bg-red-100' : systemHealth.cpu > 60 ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <CpuChipIcon className={`w-8 h-8 ${
                  systemHealth.cpu > 80 ? 'text-red-600' : systemHealth.cpu > 60 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">CPU</p>
            <p className="text-lg font-bold text-gray-700">{systemHealth.cpu.toFixed(1)}%</p>
          </div>
          
          <div className="text-center">
            <div className="mb-2">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                systemHealth.memory > 85 ? 'bg-red-100' : systemHealth.memory > 70 ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <ServerIcon className={`w-8 h-8 ${
                  systemHealth.memory > 85 ? 'text-red-600' : systemHealth.memory > 70 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Memory</p>
            <p className="text-lg font-bold text-gray-700">{systemHealth.memory.toFixed(1)}%</p>
          </div>
          
          <div className="text-center">
            <div className="mb-2">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                systemHealth.disk > 90 ? 'bg-red-100' : systemHealth.disk > 75 ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <DatabaseIcon className={`w-8 h-8 ${
                  systemHealth.disk > 90 ? 'text-red-600' : systemHealth.disk > 75 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Disk</p>
            <p className="text-lg font-bold text-gray-700">{systemHealth.disk.toFixed(1)}%</p>
          </div>
          
          <div className="text-center">
            <div className="mb-2">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                systemHealth.network > 80 ? 'bg-red-100' : systemHealth.network > 60 ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <CloudIcon className={`w-8 h-8 ${
                  systemHealth.network > 80 ? 'text-red-600' : systemHealth.network > 60 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Network</p>
            <p className="text-lg font-bold text-gray-700">{systemHealth.network.toFixed(1)}%</p>
          </div>
          
          <div className="text-center">
            <div className="mb-2">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-blue-100">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Uptime</p>
            <p className="text-lg font-bold text-gray-700">{formatUptime(systemHealth.uptime)}</p>
          </div>
        </div>
      </div>

      {/* Cache entries management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Cache Entries</h3>
          <ButtonGroup align="right" spacing="tight">
            {(['all', 'api', 'static', 'computed', 'user'] as const).map((type) => (
              <PremiumButton
                key={type}
                variant={selectedCacheType === type ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCacheType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </PremiumButton>
            ))}
          </ButtonGroup>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Accessed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry, index) => (
                <tr key={entry.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {entry.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      entry.type === 'api' ? 'bg-blue-100 text-blue-800' :
                      entry.type === 'static' ? 'bg-gray-100 text-gray-800' :
                      entry.type === 'computed' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.size.toFixed(1)} MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.ttl}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.hitCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.lastAccessed).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <PremiumButton
                      variant="destructive"
                      size="xs"
                      onClick={() => handleCacheClear(entry.type)}
                    >
                      Clear
                    </PremiumButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}