import { useState, useEffect } from 'react'
import {
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid'
import { useLanguage } from '../contexts/LanguageContext'

interface SystemMetrics {
  cpu: { usage: number, cores: number, temperature: number }
  memory: { used: number, total: number, percentage: number }
  storage: { used: number, total: number, percentage: number }
  network: { incoming: number, outgoing: number, latency: number }
  database: { connections: number, queryTime: number, status: 'healthy' | 'warning' | 'critical' }
  api: { requestsPerMin: number, errorRate: number, avgResponseTime: number }
  uptime: number
  lastUpdated: Date
}

// Mock real-time system metrics
const generateMockMetrics = (): SystemMetrics => ({
  cpu: {
    usage: 25 + Math.random() * 50, // 25-75%
    cores: 8,
    temperature: 45 + Math.random() * 25 // 45-70°C
  },
  memory: {
    used: 6.2 + Math.random() * 2, // 6.2-8.2 GB
    total: 16,
    percentage: 0
  },
  storage: {
    used: 125 + Math.random() * 50, // 125-175 GB
    total: 500,
    percentage: 0
  },
  network: {
    incoming: Math.random() * 100, // 0-100 Mbps
    outgoing: Math.random() * 50,  // 0-50 Mbps
    latency: 10 + Math.random() * 20 // 10-30ms
  },
  database: {
    connections: 15 + Math.floor(Math.random() * 35), // 15-50
    queryTime: 1.5 + Math.random() * 3, // 1.5-4.5ms
    status: Math.random() > 0.8 ? 'warning' : 'healthy'
  },
  api: {
    requestsPerMin: 150 + Math.floor(Math.random() * 300), // 150-450
    errorRate: Math.random() * 2, // 0-2%
    avgResponseTime: 50 + Math.random() * 100 // 50-150ms
  },
  uptime: 99.95 + Math.random() * 0.04, // 99.95-99.99%
  lastUpdated: new Date()
})

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>(generateMockMetrics())
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useLanguage()

  // Calculate derived values
  metrics.memory.percentage = (metrics.memory.used / metrics.memory.total) * 100
  metrics.storage.percentage = (metrics.storage.used / metrics.storage.total) * 100

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMockMetrics())
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = (value: number, thresholds: { warning: number, critical: number }, reverse = false) => {
    const isWarning = reverse ? value < thresholds.warning : value > thresholds.warning
    const isCritical = reverse ? value < thresholds.critical : value > thresholds.critical

    if (isCritical) {
      return { 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        icon: XCircleIconSolid,
        status: 'Critical'
      }
    } else if (isWarning) {
      return { 
        color: 'text-amber-600', 
        bg: 'bg-amber-100', 
        icon: ExclamationTriangleIconSolid,
        status: 'Warning'
      }
    } else {
      return { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100', 
        icon: CheckCircleIconSolid,
        status: 'Healthy'
      }
    }
  }

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 GB'
    const k = 1024
    const sizes = ['GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }

  const formatUptime = (percentage: number) => {
    const days = Math.floor((percentage / 100) * 365.25)
    const hours = Math.floor(((percentage / 100) * 365.25 - days) * 24)
    return `${days}d ${hours}h`
  }

  const cpuStatus = getStatusConfig(metrics.cpu.usage, { warning: 70, critical: 90 })
  const memoryStatus = getStatusConfig(metrics.memory.percentage, { warning: 75, critical: 90 })
  const storageStatus = getStatusConfig(metrics.storage.percentage, { warning: 80, critical: 95 })
  const uptimeStatus = getStatusConfig(metrics.uptime, { warning: 99.9, critical: 99.5 }, true)

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Performance</h2>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Updated: <span className="ltr-numbers">{metrics.lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary text-sm px-3 py-1"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU */}
          <div className={`p-4 rounded-lg border-l-4 ${cpuStatus.bg} border-l-red-400`}>
            <div className="flex items-center justify-between mb-2">
              <CpuChipIcon className="w-5 h-5 text-gray-600" />
              <cpuStatus.icon className={`w-4 h-4 ${cpuStatus.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">CPU Usage</p>
              <p className="text-xl font-bold text-gray-900 ltr-numbers">
                {metrics.cpu.usage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 ltr-numbers">
                {metrics.cpu.cores} cores • {metrics.cpu.temperature.toFixed(1)}°C
              </p>
            </div>
          </div>

          {/* Memory */}
          <div className={`p-4 rounded-lg border-l-4 ${memoryStatus.bg} border-l-amber-400`}>
            <div className="flex items-center justify-between mb-2">
              <CircleStackIcon className="w-5 h-5 text-gray-600" />
              <memoryStatus.icon className={`w-4 h-4 ${memoryStatus.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Memory</p>
              <p className="text-xl font-bold text-gray-900 ltr-numbers">
                {metrics.memory.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 ltr-numbers">
                {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
              </p>
            </div>
          </div>

          {/* Storage */}
          <div className={`p-4 rounded-lg border-l-4 ${storageStatus.bg} border-l-blue-400`}>
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-5 h-5 text-gray-600" />
              <storageStatus.icon className={`w-4 h-4 ${storageStatus.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Storage</p>
              <p className="text-xl font-bold text-gray-900 ltr-numbers">
                {metrics.storage.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 ltr-numbers">
                {formatBytes(metrics.storage.used)} / {formatBytes(metrics.storage.total)}
              </p>
            </div>
          </div>

          {/* Uptime */}
          <div className={`p-4 rounded-lg border-l-4 ${uptimeStatus.bg} border-l-emerald-400`}>
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-5 h-5 text-gray-600" />
              <uptimeStatus.icon className={`w-4 h-4 ${uptimeStatus.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Uptime</p>
              <p className="text-xl font-bold text-gray-900 ltr-numbers">
                {metrics.uptime.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-600 ltr-numbers">
                {formatUptime(metrics.uptime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Metrics (when expanded) */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Performance */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <GlobeAltIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Network</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Incoming</p>
                  <p className="text-lg font-bold text-green-600 ltr-numbers">
                    {metrics.network.incoming.toFixed(1)} Mbps
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Outgoing</p>
                  <p className="text-lg font-bold text-blue-600 ltr-numbers">
                    {metrics.network.outgoing.toFixed(1)} Mbps
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Latency</p>
                  <p className="text-lg font-bold text-gray-900 ltr-numbers">
                    {metrics.network.latency.toFixed(1)} ms
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">Network performance is optimal</p>
              </div>
            </div>
          </div>

          {/* Database & API Performance */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Database & API</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Database</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Connections:</span>
                      <span className="font-medium ltr-numbers">{metrics.database.connections}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Query Time:</span>
                      <span className="font-medium ltr-numbers">{metrics.database.queryTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        metrics.database.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {metrics.database.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">API Performance</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requests/min:</span>
                      <span className="font-medium ltr-numbers">{metrics.api.requestsPerMin}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-medium ltr-numbers">{metrics.api.errorRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Response:</span>
                      <span className="font-medium ltr-numbers">{metrics.api.avgResponseTime.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">
                  All systems operational • Last health check: {metrics.lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}