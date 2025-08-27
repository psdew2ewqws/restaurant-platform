import React from 'react'

export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="flex items-baseline space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </div>
  </div>
)

export const ChartSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      <div className="h-32 bg-gray-200 rounded mt-4"></div>
    </div>
  </div>
)

export const TableSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
)

export const SidebarSkeleton = () => (
  <div className="p-6">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)