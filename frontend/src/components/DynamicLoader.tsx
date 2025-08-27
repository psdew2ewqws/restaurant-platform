import dynamic from 'next/dynamic'
import { ChartSkeleton, TableSkeleton } from './SkeletonLoader'

// Dynamic imports with loading fallbacks for better performance
export const DynamicRealTimeAnalytics = dynamic(
  () => import('./RealTimeAnalytics').then(mod => ({ default: mod.RealTimeAnalytics })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Disable SSR for this component to prevent hydration issues
  }
)

export const DynamicEnterpriseAnalytics = dynamic(
  () => import('./EnterpriseAnalytics').then(mod => ({ default: mod.EnterpriseAnalytics })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const DynamicOrderManagement = dynamic(
  () => import('./OrderManagement').then(mod => ({ default: mod.OrderManagement })),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

export const DynamicOptimizedDataTable = dynamic(
  () => import('./OptimizedDataTable').then(mod => ({ default: mod.OptimizedDataTable })),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)