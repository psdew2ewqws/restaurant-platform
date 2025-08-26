import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

interface Column<T> {
  key: keyof T
  title: string
  width: number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface FilterConfig {
  key: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: { label: string; value: any }[]
  placeholder?: string
}

interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

interface OptimizedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  filters?: FilterConfig[]
  onRowClick?: (row: T, index: number) => void
  onRowSelect?: (selectedRows: T[]) => void
  selectable?: boolean
  loading?: boolean
  pageSize?: number
  virtualScrolling?: boolean
  height?: number
  searchable?: boolean
  exportable?: boolean
  refreshable?: boolean
  onRefresh?: () => void
}

// Row component for virtualization
const TableRow = <T extends Record<string, any>>({ 
  index, 
  style, 
  data: { items, columns, onRowClick, selectedRows, onRowSelect, selectable } 
}: any) => {
  const row = items[index]
  const isSelected = selectedRows.some((selected: any) => selected.id === row.id)
  
  return (
    <div 
      style={style} 
      className={`flex items-center border-b border-gray-100 hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      } ${onRowClick ? 'cursor-pointer' : ''}`}
      onClick={() => onRowClick?.(row, index)}
    >
      {selectable && (
        <div className="flex items-center justify-center w-12 px-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              if (e.target.checked) {
                onRowSelect?.([...selectedRows, row])
              } else {
                onRowSelect?.(selectedRows.filter((r: any) => r.id !== row.id))
              }
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      )}
      
      {columns.map((column: Column<T>, colIndex: number) => (
        <div
          key={String(column.key)}
          className={`px-4 py-3 text-sm flex-shrink-0 ${
            column.align === 'center' ? 'text-center' : 
            column.align === 'right' ? 'text-right' : 'text-left'
          }`}
          style={{ width: column.width }}
        >
          {column.render ? 
            column.render(row[column.key], row, index) : 
            String(row[column.key] || '')
          }
        </div>
      ))}
    </div>
  )
}

export function OptimizedDataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  onRowClick,
  onRowSelect,
  selectable = false,
  loading = false,
  pageSize = 100,
  virtualScrolling = true,
  height = 600,
  searchable = true,
  exportable = false,
  refreshable = false,
  onRefresh
}: OptimizedDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce((acc, col) => ({ ...acc, [String(col.key)]: col.width }), {})
  )
  
  const listRef = useRef<any>(null)
  const { t } = useLanguage()

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    // Apply column filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        filtered = filtered.filter(item => {
          const itemValue = item[key]
          if (typeof value === 'string') {
            return String(itemValue).toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    return filtered
  }, [data, searchQuery, activeFilters])

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue && bValue && typeof aValue === 'object' && typeof bValue === 'object' && 
                 aValue.constructor.name === 'Date' && bValue.constructor.name === 'Date') {
        comparison = (aValue as Date).getTime() - (bValue as Date).getTime()
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison
    })
  }, [filteredData, sortConfig])

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (virtualScrolling) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, virtualScrolling])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sorting
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current?.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters({})
    setSearchQuery('')
    setSortConfig(null)
    setCurrentPage(1)
  }, [])

  // Select all handler
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData)
    } else {
      setSelectedRows([])
    }
  }, [paginatedData])

  // Calculate total width for horizontal scrolling
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + columnWidths[String(col.key)], 0) + (selectable ? 48 : 0)
  }, [columns, columnWidths, selectable])

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === paginatedData.length

  useEffect(() => {
    onRowSelect?.(selectedRows)
  }, [selectedRows, onRowSelect])

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Data Table ({sortedData.length.toLocaleString()} records)
            </h3>
            
            {selectedRows.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <span>{selectedRows.length} selected</span>
                <button
                  onClick={() => setSelectedRows([])}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
            )}

            {/* Filter Toggle */}
            {filters.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || Object.keys(activeFilters).length > 0
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
              </button>
            )}

            {/* Refresh */}
            {refreshable && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Clear Filters */}
            {(Object.keys(activeFilters).length > 0 || searchQuery || sortConfig) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && filters.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.key}
                  </label>
                  {filter.type === 'select' ? (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All</option>
                      {filter.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'date' ? (
                    <input
                      type="date"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : filter.type === 'number' ? (
                    <input
                      type="number"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div 
        className="flex items-center bg-gray-50 border-b border-gray-200 sticky top-0 z-10"
        style={{ minWidth: totalWidth }}
      >
        {selectable && (
          <div className="flex items-center justify-center w-12 px-2 py-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        )}
        
        {columns.map((column, index) => (
          <div
            key={String(column.key)}
            className={`px-4 py-3 text-sm font-medium text-gray-700 flex-shrink-0 ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
            } ${column.align === 'center' ? 'text-center' : 
                column.align === 'right' ? 'text-right' : 'text-left'}`}
            style={{ width: columnWidths[String(column.key)] }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.title}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ArrowsUpDownIcon className={`w-3 h-3 ${
                    sortConfig?.key === column.key 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-600">Loading data...</span>
            </div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : virtualScrolling ? (
          <List
            ref={listRef}
            height={height}
            itemCount={paginatedData.length}
            itemSize={50}
            itemData={{
              items: paginatedData,
              columns,
              onRowClick,
              selectedRows,
              onRowSelect: setSelectedRows,
              selectable
            }}
            width="100%"
          >
            {TableRow}
          </List>
        ) : (
          <div style={{ maxHeight: height, overflow: 'auto' }}>
            {paginatedData.map((row, index) => (
              <div key={row.id || index}>
                <TableRow
                  index={index}
                  style={{ height: 50 }}
                  data={{
                    items: paginatedData,
                    columns,
                    onRowClick,
                    selectedRows,
                    onRowSelect: setSelectedRows,
                    selectable
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!virtualScrolling && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length.toLocaleString()} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (currentPage <= 4) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = currentPage - 3 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}