import { useState, useRef, useEffect } from 'react'
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

interface PreciseDateTimeRange {
  startDateTime: Date
  endDateTime: Date
  timezone: string
}

interface ExportJob {
  id: string
  name: string
  type: 'orders' | 'analytics' | 'inventory' | 'financial'
  format: 'csv' | 'excel' | 'pdf' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
  estimatedSize: number
  rowCount: number
}

interface AdvancedFilters {
  dateRange: PreciseDateTimeRange
  branches: string[]
  dataTypes: string[]
  customFields: string[]
  includeGraphics: boolean
  compression: boolean
  splitFiles: boolean
  maxRowsPerFile: number
}

const exportFormats = [
  { 
    id: 'excel', 
    name: 'Microsoft Excel', 
    extension: '.xlsx',
    description: 'Structured data with multiple sheets',
    icon: '📊',
    features: ['Multi-sheet support', 'Formulas', 'Charts', 'Pivot tables'],
    maxRows: 1000000
  },
  { 
    id: 'csv', 
    name: 'CSV (Comma Separated)', 
    extension: '.csv',
    description: 'Universal format for data analysis',
    icon: '📈',
    features: ['Universal compatibility', 'Lightweight', 'Fast processing'],
    maxRows: 5000000
  },
  { 
    id: 'pdf', 
    name: 'PDF Report', 
    extension: '.pdf',
    description: 'Professional formatted reports',
    icon: '📄',
    features: ['Print-ready', 'Charts & graphs', 'Executive summary'],
    maxRows: 10000
  },
  { 
    id: 'json', 
    name: 'JSON API Format', 
    extension: '.json',
    description: 'Structured data for developers',
    icon: '💻',
    features: ['API compatible', 'Nested data', 'Full schema'],
    maxRows: 2000000
  }
]

const dataCategories = [
  {
    id: 'orders',
    name: 'Order Management',
    fields: ['Order ID', 'Customer', 'Items', 'Payment', 'Status', 'Timestamps'],
    estimatedRows: 1500,
    description: 'Complete order lifecycle data'
  },
  {
    id: 'analytics',
    name: 'Business Analytics',
    fields: ['Revenue metrics', 'Performance KPIs', 'Trend analysis', 'Comparisons'],
    estimatedRows: 500,
    description: 'Aggregated business intelligence'
  },
  {
    id: 'inventory',
    name: 'Inventory & Stock',
    fields: ['Item codes', 'Stock levels', 'Usage patterns', 'Waste tracking'],
    estimatedRows: 800,
    description: 'Complete inventory management data'
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    fields: ['Revenue', 'Costs', 'Taxes', 'Profit margins', 'Payment methods'],
    estimatedRows: 300,
    description: 'Comprehensive financial analysis'
  }
]

const branches = [
  { id: 'downtown', name: 'Downtown Branch', code: 'DT001' },
  { id: 'mall', name: 'Mall Branch', code: 'MB002' },
  { id: 'airport', name: 'Airport Terminal', code: 'AP003' },
  { id: 'city_center', name: 'City Center Plaza', code: 'CC004' }
]

export function EnterpriseDataExport() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [filters, setFilters] = useState<AdvancedFilters>({
    dateRange: {
      startDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDateTime: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    branches: [],
    dataTypes: ['orders'],
    customFields: [],
    includeGraphics: true,
    compression: true,
    splitFiles: false,
    maxRowsPerFile: 100000
  })
  const [jobs, setJobs] = useState<ExportJob[]>([])
  const [selectedFormat, setSelectedFormat] = useState('excel')
  const [isProcessing, setIsProcessing] = useState(false)
  const { t } = useLanguage()

  // Precise datetime formatting
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  // Calculate estimated metrics
  const getEstimatedMetrics = () => {
    const selectedCategories = dataCategories.filter(cat => filters.dataTypes.includes(cat.id))
    const branchMultiplier = filters.branches.length || branches.length
    const baseRows = selectedCategories.reduce((sum, cat) => sum + cat.estimatedRows, 0)
    const totalRows = baseRows * branchMultiplier
    
    const formatMultipliers = { csv: 0.1, excel: 0.3, pdf: 1.2, json: 0.15 }
    const baseSizeKB = totalRows * 0.5 // 0.5KB per row average
    const estimatedSizeMB = (baseSizeKB * formatMultipliers[selectedFormat]) / 1024
    
    return {
      totalRows: totalRows.toLocaleString(),
      estimatedSize: estimatedSizeMB > 1 ? `${estimatedSizeMB.toFixed(1)} MB` : `${(estimatedSizeMB * 1024).toFixed(0)} KB`,
      processingTime: Math.ceil(totalRows / 10000) // Estimated minutes
    }
  }

  const updateDateTime = (field: 'startDateTime' | 'endDateTime', value: string) => {
    const [datePart, timePart] = value.split('T')
    const [day, month, year] = datePart.split('/')
    const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00']
    
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      0
    )
    
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: newDate
      }
    }))
  }

  const initiateExport = async () => {
    setIsProcessing(true)
    
    const metrics = getEstimatedMetrics()
    const newJob: ExportJob = {
      id: `export_${Date.now()}`,
      name: `${filters.dataTypes.join('_')}_export_${formatDateTime(new Date()).replace(/[/:\s]/g, '_')}`,
      type: filters.dataTypes[0] as any,
      format: selectedFormat as any,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      estimatedSize: parseFloat(metrics.estimatedSize),
      rowCount: parseInt(metrics.totalRows.replace(/,/g, ''))
    }
    
    setJobs(prev => [...prev, newJob])
    
    // Simulate processing with realistic progress updates
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5 // 5-20% increments
      
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? {
                ...job,
                status: 'completed',
                progress: 100,
                completedAt: new Date(),
                downloadUrl: `/api/exports/${job.id}/download`
              }
            : job
        ))
        setIsProcessing(false)
      } else {
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'processing', progress: Math.floor(progress) }
            : job
        ))
      }
    }, 500)
    
    setTimeout(() => {
      setIsOpen(false)
      setCurrentStep(1)
    }, 1000)
  }

  const selectedFormatDetails = exportFormats.find(f => f.id === selectedFormat)!
  const metrics = getEstimatedMetrics()

  return (
    <>
      {/* Export Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export Data
        </button>
        
        {/* Job Status Indicator */}
        {jobs.filter(j => j.status !== 'completed').length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Active Jobs Panel */}
      {jobs.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 space-y-2 z-40">
          {jobs.slice(-3).map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DocumentChartBarIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {job.type} Export
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {job.status === 'processing' && (
                    <ArrowPathIcon className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                  {job.status === 'completed' && (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  )}
                  {job.status === 'failed' && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              
              {job.status === 'processing' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Processing...</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {job.status === 'completed' && job.downloadUrl && (
                <a
                  href={job.downloadUrl}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                  Download {job.format.toUpperCase()}
                </a>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                {job.rowCount.toLocaleString()} rows • {job.estimatedSize} MB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Enterprise Data Export</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3].map(step => (
                        <div
                          key={step}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= currentStep
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Step {currentStep} of 3
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex h-[600px]">
              {/* Step Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Precise Date & Time Selection
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Start DateTime */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date & Time
                          </label>
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={filters.dateRange.startDateTime.toISOString().split('T')[0]}
                              onChange={(e) => {
                                const newDate = new Date(filters.dateRange.startDateTime)
                                const [year, month, day] = e.target.value.split('-')
                                newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day))
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, startDateTime: newDate }
                                }))
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <input
                              type="time"
                              step="1"
                              value={`${String(filters.dateRange.startDateTime.getHours()).padStart(2, '0')}:${String(filters.dateRange.startDateTime.getMinutes()).padStart(2, '0')}:${String(filters.dateRange.startDateTime.getSeconds()).padStart(2, '0')}`}
                              onChange={(e) => {
                                const [hours, minutes, seconds] = e.target.value.split(':')
                                const newDate = new Date(filters.dateRange.startDateTime)
                                newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'))
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, startDateTime: newDate }
                                }))
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                              {formatDateTime(filters.dateRange.startDateTime)}
                            </div>
                          </div>
                        </div>

                        {/* End DateTime */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date & Time
                          </label>
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={filters.dateRange.endDateTime.toISOString().split('T')[0]}
                              onChange={(e) => {
                                const newDate = new Date(filters.dateRange.endDateTime)
                                const [year, month, day] = e.target.value.split('-')
                                newDate.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day))
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, endDateTime: newDate }
                                }))
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <input
                              type="time"
                              step="1"
                              value={`${String(filters.dateRange.endDateTime.getHours()).padStart(2, '0')}:${String(filters.dateRange.endDateTime.getMinutes()).padStart(2, '0')}:${String(filters.dateRange.endDateTime.getSeconds()).padStart(2, '0')}`}
                              onChange={(e) => {
                                const [hours, minutes, seconds] = e.target.value.split(':')
                                const newDate = new Date(filters.dateRange.endDateTime)
                                newDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'))
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, endDateTime: newDate }
                                }))
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                              {formatDateTime(filters.dateRange.endDateTime)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Last 24 Hours', hours: 24 },
                            { label: 'Last 7 Days', hours: 7 * 24 },
                            { label: 'Last 30 Days', hours: 30 * 24 },
                            { label: 'This Month', hours: 0, isCurrentMonth: true }
                          ].map(preset => (
                            <button
                              key={preset.label}
                              onClick={() => {
                                const now = new Date()
                                let start: Date
                                
                                if (preset.isCurrentMonth) {
                                  start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
                                } else {
                                  start = new Date(now.getTime() - preset.hours * 60 * 60 * 1000)
                                }
                                
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: {
                                    ...prev.dateRange,
                                    startDateTime: start,
                                    endDateTime: now
                                  }
                                }))
                              }}
                              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Branches Selection */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Branch Selection</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {branches.map(branch => (
                          <label key={branch.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.branches.includes(branch.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    branches: [...prev.branches, branch.id]
                                  }))
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    branches: prev.branches.filter(b => b !== branch.id)
                                  }))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{branch.name}</p>
                              <p className="text-sm text-gray-600">{branch.code}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {filters.branches.length === 0 ? 'All branches selected' : `${filters.branches.length} branch(es) selected`}
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Data Categories & Export Format
                      </h3>
                      
                      {/* Data Categories */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Select Data Categories</h4>
                        <div className="space-y-3">
                          {dataCategories.map(category => (
                            <label key={category.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.dataTypes.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilters(prev => ({
                                      ...prev,
                                      dataTypes: [...prev.dataTypes, category.id]
                                    }))
                                  } else {
                                    setFilters(prev => ({
                                      ...prev,
                                      dataTypes: prev.dataTypes.filter(t => t !== category.id)
                                    }))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{category.name}</p>
                                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {category.fields.map(field => (
                                    <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {field}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  ~{category.estimatedRows.toLocaleString()} rows per branch
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Export Format Selection */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Export Format</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {exportFormats.map(format => (
                            <div
                              key={format.id}
                              onClick={() => setSelectedFormat(format.id)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedFormat === format.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl">{format.icon}</span>
                                <div>
                                  <p className="font-medium text-gray-900">{format.name}</p>
                                  <p className="text-sm text-gray-600">{format.extension}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                              <div className="space-y-1">
                                {format.features.map(feature => (
                                  <div key={feature} className="flex items-center text-xs text-gray-600">
                                    <CheckCircleIcon className="w-3 h-3 text-emerald-600 mr-1" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Max rows: {format.maxRows.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Export Configuration & Review
                      </h3>
                      
                      {/* Advanced Options */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Advanced Options</h4>
                        <div className="space-y-4">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={filters.compression}
                              onChange={(e) => setFilters(prev => ({ ...prev, compression: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">Enable Compression</p>
                              <p className="text-sm text-gray-600">Reduce file size by up to 70%</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={filters.includeGraphics}
                              onChange={(e) => setFilters(prev => ({ ...prev, includeGraphics: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              disabled={selectedFormat !== 'pdf'}
                            />
                            <div>
                              <p className={`font-medium ${selectedFormat !== 'pdf' ? 'text-gray-400' : 'text-gray-900'}`}>
                                Include Charts & Graphics
                              </p>
                              <p className="text-sm text-gray-600">
                                {selectedFormat !== 'pdf' ? 'Available for PDF exports only' : 'Add visual elements to reports'}
                              </p>
                            </div>
                          </label>

                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={filters.splitFiles}
                              onChange={(e) => setFilters(prev => ({ ...prev, splitFiles: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">Split Large Files</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-sm text-gray-600">Max rows per file:</p>
                                <input
                                  type="number"
                                  min="10000"
                                  max="1000000"
                                  step="10000"
                                  value={filters.maxRowsPerFile}
                                  onChange={(e) => setFilters(prev => ({ ...prev, maxRowsPerFile: parseInt(e.target.value) }))}
                                  disabled={!filters.splitFiles}
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Export Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <DocumentChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
                          Export Summary
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time Range:</span>
                              <span className="font-medium text-gray-900">
                                {Math.ceil((filters.dateRange.endDateTime.getTime() - filters.dateRange.startDateTime.getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Branches:</span>
                              <span className="font-medium text-gray-900">
                                {filters.branches.length || 'All'} ({filters.branches.length || branches.length})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Data Categories:</span>
                              <span className="font-medium text-gray-900">{filters.dataTypes.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Format:</span>
                              <span className="font-medium text-gray-900">{selectedFormatDetails.name}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Rows:</span>
                              <span className="font-bold text-blue-600 ltr-numbers">{metrics.totalRows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Size:</span>
                              <span className="font-bold text-blue-600">{metrics.estimatedSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Processing Time:</span>
                              <span className="font-bold text-blue-600">~{metrics.processingTime} min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Compression:</span>
                              <span className={`font-medium ${filters.compression ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {filters.compression ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Progress/Navigation */}
              <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 flex flex-col">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-4">Export Progress</h4>
                  
                  {/* Step Indicators */}
                  <div className="space-y-4 mb-6">
                    {[
                      { step: 1, title: 'Date & Branches', description: 'Select time range and locations' },
                      { step: 2, title: 'Data & Format', description: 'Choose data types and export format' },
                      { step: 3, title: 'Configure & Export', description: 'Review settings and export' }
                    ].map(({ step, title, description }) => (
                      <div
                        key={step}
                        className={`flex items-start space-x-3 p-3 rounded-lg ${
                          step <= currentStep ? 'bg-white border border-blue-200' : 'bg-gray-100'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            step < currentStep
                              ? 'bg-emerald-500 text-white'
                              : step === currentStep
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {step < currentStep ? '✓' : step}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${step <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                            {title}
                          </p>
                          <p className={`text-xs ${step <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Selection Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">Current Selection</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="text-gray-900 ltr-numbers">
                          {Math.ceil((filters.dateRange.endDateTime.getTime() - filters.dateRange.startDateTime.getTime()) / (1000 * 60 * 60 * 24))}d
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branches:</span>
                        <span className="text-gray-900">{filters.branches.length || 'All'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categories:</span>
                        <span className="text-gray-900">{filters.dataTypes.length}</span>
                      </div>
                      {currentStep >= 2 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="text-gray-900">{selectedFormat.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons - RIGHT ALIGNED */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={
                        (currentStep === 1 && filters.dataTypes.length === 0) ||
                        (currentStep === 2 && !selectedFormat)
                      }
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={initiateExport}
                      disabled={isProcessing || filters.dataTypes.length === 0}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="w-4 h-4" />
                          <span>Start Export</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}