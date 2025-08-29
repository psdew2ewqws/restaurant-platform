import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useAuth } from '../../src/contexts/AuthContext'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { 
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface License {
  id: string
  company: {
    id: string
    name: string
    slug: string
    status: string
  }
  type: 'trial' | 'active' | 'premium'
  status: 'active' | 'expired' | 'suspended' | 'cancelled'
  daysRemaining: number
  expiresAt: string
  maxUsers: number
  maxBranches: number
  features: string[]
  createdAt: string
}

interface LicenseStats {
  total: number
  active: number
  expired: number
  trial: number
  premium: number
  expiringIn30Days: number
  estimatedMonthlyRevenue: number
}

export default function LicensesPage() {
  const { user } = useAuth()
  const [licenses, setLicenses] = useState<License[]>([])
  const [stats, setStats] = useState<LicenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

  const fetchLicenses = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`${API_BASE_URL}/licenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setLicenses(result.data || [])
      } else {
        toast.error('Failed to fetch licenses')
      }
    } catch (error) {
      console.error('Error fetching licenses:', error)
      toast.error('Error loading licenses')
    }
  }, [API_BASE_URL])

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`${API_BASE_URL}/licenses/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchLicenses(), fetchStats()])
      setIsLoading(false)
    }

    if (user?.role === 'super_admin') {
      loadData()
    }
  }, [user, fetchLicenses, fetchStats])

  const getStatusColor = (status: string, daysRemaining: number) => {
    if (status === 'expired') return 'bg-red-100 text-red-800'
    if (daysRemaining <= 7) return 'bg-red-100 text-red-800'
    if (daysRemaining <= 14) return 'bg-amber-100 text-amber-800'
    if (daysRemaining <= 30) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusIcon = (status: string, daysRemaining: number) => {
    if (status === 'expired' || daysRemaining <= 7) {
      return <ExclamationTriangleIcon className="w-4 h-4" />
    }
    if (daysRemaining <= 30) {
      return <ClockIcon className="w-4 h-4" />
    }
    return <CheckCircleIcon className="w-4 h-4" />
  }

  if (user?.role !== 'super_admin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Only super administrators can access license management.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>License Management - Restaurant Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
                  <p className="text-gray-600 mt-1">Manage customer licenses and subscriptions</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create License</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Licenses</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Licenses</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats.expiringIn30Days}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900">${stats.estimatedMonthlyRevenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Licenses Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">All Licenses</h2>
                  <button
                    onClick={() => {
                      fetchLicenses()
                      fetchStats()
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading licenses...</p>
                </div>
              ) : licenses.length === 0 ? (
                <div className="p-8 text-center">
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No licenses found</h3>
                  <p className="text-gray-500">Start by creating a license for a company.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Limits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {licenses.map((license) => (
                        <tr key={license.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {license.company.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {license.company.slug}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {license.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium space-x-1 ${getStatusColor(license.status, license.daysRemaining)}`}>
                              {getStatusIcon(license.status, license.daysRemaining)}
                              <span>
                                {license.status === 'expired' ? 'Expired' : `${license.daysRemaining}d left`}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(license.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {license.maxBranches} branches, {license.maxUsers} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}