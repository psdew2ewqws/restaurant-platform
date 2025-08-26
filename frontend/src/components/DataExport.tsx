import { useState } from 'react'
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'custom'
  customStartDate?: string
  customEndDate?: string
  branches: string[]
  dataTypes: string[]
  includeGraphics: boolean
}

const exportFormats = [
  { id: 'csv', name: 'CSV', description: 'Comma-separated values for Excel/Sheets', icon: '📊' },
  { id: 'excel', name: 'Excel', description: 'Microsoft Excel workbook (.xlsx)', icon: '📈' },
  { id: 'pdf', name: 'PDF', description: 'Professional PDF report', icon: '📄' },
  { id: 'json', name: 'JSON', description: 'Raw data for developers', icon: '💻' }
]

const dataTypes = [
  { id: 'orders', name: 'Orders', description: 'Order details, status, and history' },
  { id: 'revenue', name: 'Revenue', description: 'Sales data and financial metrics' },
  { id: 'customers', name: 'Customers', description: 'Customer information and behavior' },
  { id: 'products', name: 'Products', description: 'Menu items and performance' },
  { id: 'staff', name: 'Staff', description: 'Employee performance and schedules' },
  { id: 'inventory', name: 'Inventory', description: 'Stock levels and usage' },
  { id: 'analytics', name: 'Analytics', description: 'KPIs and business intelligence' }
]

const branches = ['Downtown', 'Mall Branch', 'Airport', 'City Center']

export function DataExport() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dateRange: 'month',
    branches: [],
    dataTypes: ['orders', 'revenue'],
    includeGraphics: true
  })
  const [isExporting, setIsExporting] = useState(false)
  const { t } = useLanguage()

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real application, this would trigger the actual export
    const filename = `restaurant-report-${config.dateRange}-${Date.now()}.${config.format}`
    console.log('Exporting:', { ...config, filename })
    
    // Simulate file download
    alert(`Report exported successfully: ${filename}`)
    
    setIsExporting(false)
    setIsOpen(false)
  }

  const getEstimatedFileSize = () => {
    const baseSize = config.dataTypes.length * 0.5 // MB per data type
    const multiplier = config.branches.length || 1
    const formatMultiplier = { csv: 0.3, excel: 0.8, pdf: 1.5, json: 0.4 }[config.format]
    
    return Math.round(baseSize * multiplier * formatMultiplier * 10) / 10
  }

  const getEstimatedRows = () => {
    const baseRows = { 
      today: 50, 
      week: 350, 
      month: 1500, 
      quarter: 4500,
      custom: 1000 
    }[config.dateRange]
    
    return (baseRows * (config.branches.length || 1)).toLocaleString()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        <span>Export Data</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Export Business Data</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Generate comprehensive reports for analysis and compliance
              </p>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {exportFormats.map(format => (
                    <div
                      key={format.id}
                      onClick={() => setConfig(prev => ({ ...prev, format: format.id as any }))}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        config.format === format.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{format.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{format.name}</p>
                          <p className="text-xs text-gray-600">{format.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date Range
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { id: 'today', name: 'Today', icon: '📅' },
                    { id: 'week', name: 'This Week', icon: '📊' },
                    { id: 'month', name: 'This Month', icon: '📈' },
                    { id: 'quarter', name: 'Quarter', icon: '📋' }
                  ].map(range => (
                    <button
                      key={range.id}
                      onClick={() => setConfig(prev => ({ ...prev, dateRange: range.id as any }))}
                      className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                        config.dateRange === range.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{range.icon}</div>
                        <div className="font-medium">{range.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Branches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Branches (leave empty for all)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {branches.map(branch => (
                    <label key={branch} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.branches.includes(branch)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ ...prev, branches: [...prev.branches, branch] }))
                          } else {
                            setConfig(prev => ({ 
                              ...prev, 
                              branches: prev.branches.filter(b => b !== branch) 
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Data to Include
                </label>
                <div className="space-y-2">
                  {dataTypes.map(type => (
                    <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.dataTypes.includes(type.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ ...prev, dataTypes: [...prev.dataTypes, type.id] }))
                          } else {
                            setConfig(prev => ({ 
                              ...prev, 
                              dataTypes: prev.dataTypes.filter(d => d !== type.id) 
                            }))
                          }
                        }}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{type.name}</p>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeGraphics}
                      onChange={(e) => setConfig(prev => ({ ...prev, includeGraphics: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include charts and graphics (PDF only)</span>
                  </label>
                </div>
              </div>

              {/* Export Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <span className="ml-2 font-medium">{config.format.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Range:</span>
                    <span className="ml-2 font-medium capitalize">{config.dateRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Types:</span>
                    <span className="ml-2 font-medium">{config.dataTypes.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Branches:</span>
                    <span className="ml-2 font-medium">
                      {config.branches.length || 'All'} 
                      {config.branches.length > 0 ? ` (${config.branches.length})` : ' (4)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Size:</span>
                    <span className="ml-2 font-medium ltr-numbers">{getEstimatedFileSize()} MB</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Rows:</span>
                    <span className="ml-2 font-medium ltr-numbers">{getEstimatedRows()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-lg">
              <div className="text-sm text-gray-600">
                Export will be processed on server
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || config.dataTypes.length === 0}
                  className={`btn-primary flex items-center space-x-2 ${
                    isExporting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Generate Export</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}