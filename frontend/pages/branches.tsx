import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon as BuildingIcon, 
  PlusIcon, 
  XMarkIcon, 
  MapPinIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline'
// import { EyeIcon } from '@heroicons/react/24/outline'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { useAuth } from '../src/contexts/AuthContext'
import { useApiClient } from '../src/hooks/useApiClient'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { COUNTRY_CODES } from '../src/constants/countries'
import { commonFields, createPhoneValidation } from '../src/schemas/common'

// Lazy load map component
const PigeonMapComponent = lazy(() => import('../src/components/PigeonMapComponent').catch(() => ({ default: () => <div>Map component unavailable</div> })))

// Types
interface Branch {
  id: string
  name: string
  nameAr?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  openTime?: string
  closeTime?: string
  isDefault: boolean
  isActive: boolean
  allowsOnlineOrders: boolean
  allowsDelivery: boolean
  allowsPickup: boolean
  timezone?: string
  createdAt: string
  updatedAt: string
  companyId: string
}


// Unified branch schema for both create and update
const baseBranchSchema = z.object({
  name: commonFields.name,
  nameAr: z.string().optional(),
  countryCode: commonFields.countryCode,
  phone: commonFields.phone,
  address: commonFields.address,
  city: commonFields.city,
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  openTime: commonFields.openTime,
  closeTime: commonFields.closeTime,
  isActive: z.boolean().default(true),
  allowsOnlineOrders: z.boolean().default(true),
  allowsDelivery: z.boolean().default(true),
  allowsPickup: z.boolean().default(true),
}).refine((data) => {
  // Validate phone number format based on country code
  const countryData = COUNTRY_CODES.find(c => c.code === data.countryCode)
  if (countryData && data.phone) {
    return countryData.pattern.test(data.phone)
  }
  return true
}, {
  message: 'Invalid phone number format for selected country',
  path: ['phone']
})

const createBranchSchema = baseBranchSchema
const updateBranchSchema = baseBranchSchema

type CreateBranchForm = z.infer<typeof createBranchSchema>
type UpdateBranchForm = z.infer<typeof updateBranchSchema>

export default function BranchesPage() {
  const { user } = useAuth()
  const { apiCall } = useApiClient()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Form setup
  const createForm = useForm<CreateBranchForm>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      countryCode: '+962', // Default to Jordan
      isActive: true,
      allowsOnlineOrders: true,
      allowsDelivery: true,
      allowsPickup: true,
    },
  })

  const editForm = useForm<UpdateBranchForm>({
    resolver: zodResolver(baseBranchSchema),
    defaultValues: {
      countryCode: '+962',
      isActive: true,
      allowsOnlineOrders: true,
      allowsDelivery: true,
      allowsPickup: true,
    },
  })

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 fetchBranches: Starting to fetch branches...')
      const data = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/branches`)
      console.log('📥 fetchBranches: Received data:', data)
      if (data) {
        console.log('📝 fetchBranches: Setting branches to:', data.branches || [])
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error('❌ Error fetching branches:', error)
    } finally {
      setLoading(false)
      console.log('✅ fetchBranches: Finished')
    }
  }, [apiCall])

  // Load branches on mount
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // Create branch
  const handleCreateBranch = useCallback(async (data: CreateBranchForm) => {
    setSubmitting(true)
    try {
      const branchData = {
        ...data,
        phone: `${data.countryCode}${data.phone}`, // Combine country code with phone number
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
      }
      // Remove countryCode from the data being sent to API
      const { countryCode, ...apiData } = branchData

      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/branches`, {
        method: 'POST',
        body: JSON.stringify(apiData),
      })

      if (response) {
        toast.success('Branch created successfully!')
        createForm.reset()
        setShowCreateForm(false)
        setMapLocation(null)
        fetchBranches()
      }
    } catch (error) {
      console.error('Error creating branch:', error)
      toast.error('Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }, [apiCall, createForm, fetchBranches, mapLocation])

  // Edit branch
  const handleEditBranch = useCallback(async (data: UpdateBranchForm) => {
    console.log('handleEditBranch called with data:', data)
    if (!selectedBranch) return
    setSubmitting(true)
    try {
      const branchData = {
        ...data,
        phone: `${data.countryCode}${data.phone}`,
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
      }
      const { countryCode, ...apiData } = branchData

      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/branches/${selectedBranch.id}`, {
        method: 'PATCH',
        body: JSON.stringify(apiData),
      })

      if (response) {
        toast.success('Branch updated successfully!')
        
        // Close the modal and reset states
        editForm.reset()
        setShowEditForm(false)
        setSelectedBranch(null)
        setMapLocation(null)
        
        // Refresh the branches list to get updated data
        fetchBranches()
      }
    } catch (error) {
      console.error('Error updating branch:', error)
      toast.error('Failed to update branch')
    } finally {
      setSubmitting(false)
    }
  }, [apiCall, editForm, fetchBranches, mapLocation, selectedBranch])

  // Delete branch
  const handleDeleteBranch = useCallback(async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return
    }
    
    try {
      await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/branches/${branchId}`, {
        method: 'DELETE',
      })
      toast.success('Branch deleted successfully!')
      fetchBranches()
    } catch (error) {
      console.error('Error deleting branch:', error)
      toast.error('Failed to delete branch')
    }
  }, [apiCall, fetchBranches])

  // Open edit modal
  const openEditModal = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
    
    // Extract country code and phone number by matching against known country codes
    let countryCode = '+962' // Default to Jordan
    let phoneNumber = ''
    let phoneMatch = null
    
    if (branch.phone) {
      // Find the matching country code from our COUNTRY_CODES array
      const matchingCountry = COUNTRY_CODES.find(country => 
        branch.phone?.startsWith(country.code)
      )
      
      if (matchingCountry) {
        countryCode = matchingCountry.code
        phoneNumber = branch.phone.substring(matchingCountry.code.length)
        phoneMatch = [branch.phone, matchingCountry.code, phoneNumber]
      } else {
        // If no country code found, treat whole phone as number and use Jordan default
        phoneNumber = branch.phone.replace(/^\+/, '') // Remove any leading +
      }
    }
    
    console.log('Opening edit modal with branch:', branch)
    console.log('Phone match result:', phoneMatch)
    console.log('Extracted countryCode:', countryCode, 'phoneNumber:', phoneNumber)
    
    const formData = {
      name: branch.name,
      nameAr: branch.nameAr || '',
      countryCode,
      phone: phoneNumber,
      address: branch.address || '',
      city: branch.city || '',
      latitude: branch.latitude ? Number(branch.latitude) : undefined,
      longitude: branch.longitude ? Number(branch.longitude) : undefined,
      openTime: branch.openTime || '',
      closeTime: branch.closeTime || '',
      isActive: branch.isActive,
      allowsOnlineOrders: branch.allowsOnlineOrders,
      allowsDelivery: branch.allowsDelivery,
      allowsPickup: branch.allowsPickup,
    }
    console.log('Form data to be set:', formData)
    
    editForm.reset(formData)
    
    // Force update the country code field explicitly
    editForm.setValue('countryCode', countryCode)
    console.log('🔄 Manually set countryCode to:', countryCode)
    
    if (branch.latitude && branch.longitude) {
      setMapLocation({ lat: Number(branch.latitude), lng: Number(branch.longitude) })
    } else {
      setMapLocation(null)
    }
    
    setShowEditForm(true)
  }, [editForm])

  // Open view modal
  const openViewModal = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
    setShowViewModal(true)
  }, [])

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["super_admin", "company_owner"]}>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Loading branches...</h2>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["super_admin", "company_owner"]}>
      <Head>
        <title>Restaurant Branches - Management Dashboard</title>
        <meta name="description" content="Manage your restaurant branches and locations" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Simple B2B Header - Match Dashboard Style */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Navigation with Back Button */}
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <BuildingIcon className="w-5 h-5 text-gray-600" />
                  <h1 className="text-lg font-semibold text-gray-900">Branch Management</h1>
                </div>
              </div>
              
              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Branch
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Simple Stats Section - Match Dashboard Style */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Restaurant Branches</h2>
                  <p className="text-sm text-gray-600">Manage your restaurant locations</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{branches.length}</div>
                  <div className="text-sm text-gray-500">Total Branches</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{branches.filter(b => b.isActive).length}</div>
                  <div className="text-xs text-gray-500 mt-1">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{branches.filter(b => b.allowsDelivery).length}</div>
                  <div className="text-xs text-gray-500 mt-1">Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-indigo-600">{branches.filter(b => b.allowsPickup).length}</div>
                  <div className="text-xs text-gray-500 mt-1">Pickup</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-600">{branches.filter(b => b.allowsOnlineOrders).length}</div>
                  <div className="text-xs text-gray-500 mt-1">Online Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Branches List */}
          {branches.length === 0 ? (
            <div className="text-center py-12">
              <BuildingIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No branches found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first branch.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{branch.name}</h3>
                      {branch.nameAr && (
                        <p className="text-sm text-gray-600 mb-2" dir="rtl">{branch.nameAr}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      branch.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-grow">
                    {branch.phone && <p><strong>Phone:</strong> {branch.phone}</p>}
                    {branch.address && <p><strong>Address:</strong> {branch.address}</p>}
                    {branch.city && branch.country && <p><strong>Location:</strong> {branch.city}, {branch.country}</p>}
                  </div>
                  
                  {/* Action buttons positioned at very bottom */}
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => openViewModal(branch)}
                      className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(branch)}
                      className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      <PencilIcon className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Branch Modal - Dashboard Styling */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Branch</h3>
                  <p className="text-sm text-gray-600">Create a new restaurant location</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    createForm.reset()
                    setMapLocation(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={createForm.handleSubmit(handleCreateBranch)} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                    <input
                      {...createForm.register('name')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Main Branch"
                    />
                    {createForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                    <input
                      {...createForm.register('nameAr')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="الفرع الرئيسي"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <div className="flex">
                        <select
                          {...createForm.register('countryCode')}
                          className="flex-shrink-0 w-32 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          {...createForm.register('phone')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="791234567"
                        />
                      </div>
                      {createForm.formState.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.phone.message}</p>
                      )}
                      {createForm.formState.errors.countryCode && (
                        <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.countryCode.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        {...createForm.register('city')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Amman"
                      />
                      {createForm.formState.errors.city && (
                        <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      {...createForm.register('address')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                    {createForm.formState.errors.address && (
                      <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.address.message}</p>
                    )}
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time *</label>
                      <input
                        {...createForm.register('openTime')}
                        type="time"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {createForm.formState.errors.openTime && (
                        <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.openTime.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time *</label>
                      <input
                        {...createForm.register('closeTime')}
                        type="time"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {createForm.formState.errors.closeTime && (
                        <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.closeTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Location & Map Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location Coordinates</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="31.9520 (Amman, Jordan)"
                            value={mapLocation?.lat || ''}
                            onChange={(e) => {
                              const lat = parseFloat(e.target.value)
                              if (!isNaN(lat)) {
                                setMapLocation(prev => ({ lat, lng: prev?.lng || 35.9245 }))
                                createForm.setValue('latitude', lat)
                              } else {
                                setMapLocation(prev => ({ lat: 0, lng: prev?.lng || 35.9245 }))
                                createForm.setValue('latitude', undefined)
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="35.9245 (Amman, Jordan)"
                            value={mapLocation?.lng || ''}
                            onChange={(e) => {
                              const lng = parseFloat(e.target.value)
                              if (!isNaN(lng)) {
                                setMapLocation(prev => ({ lat: prev?.lat || 31.9520, lng }))
                                createForm.setValue('longitude', lng)
                              } else {
                                setMapLocation(prev => ({ lat: prev?.lat || 31.9520, lng: 0 }))
                                createForm.setValue('longitude', undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</label>
                      <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
                        <Suspense fallback={
                          <div className="h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Loading map...</p>
                            </div>
                          </div>
                        }>
                          <PigeonMapComponent
                            center={mapLocation || { lat: 31.9520, lng: 35.9245 }}
                            zoom={10}
                            onLocationSelect={({ lat, lng }) => {
                              setMapLocation({ lat, lng })
                              createForm.setValue('latitude', lat)
                              createForm.setValue('longitude', lng)
                            }}
                            selectedLocation={mapLocation}
                          />
                        </Suspense>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Click on the map to select the branch location, or enter coordinates manually above.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Branch Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          {...createForm.register('isActive')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Branch is active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...createForm.register('allowsOnlineOrders')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow online orders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...createForm.register('allowsDelivery')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow delivery</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...createForm.register('allowsPickup')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow pickup</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      createForm.reset()
                      setMapLocation(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {submitting ? 'Creating...' : 'Create Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Branch Modal */}
        {showEditForm && selectedBranch && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Branch</h3>
                  <p className="text-sm text-gray-600">Update branch information</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    editForm.reset()
                    setSelectedBranch(null)
                    setMapLocation(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={(e) => {
                console.log('Form submit event triggered', e)
                console.log('Form errors:', editForm.formState.errors)
                console.log('Form values:', editForm.getValues())
                editForm.handleSubmit(handleEditBranch, (errors) => {
                  console.log('Form validation errors:', errors)
                })(e)
              }} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                    <input
                      {...editForm.register('name')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Main Branch"
                    />
                    {editForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                    <input
                      {...editForm.register('nameAr')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="الفرع الرئيسي"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <div className="flex">
                        <select
                          {...editForm.register('countryCode')}
                          className="flex-shrink-0 w-32 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          {...editForm.register('phone')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="791234567"
                        />
                      </div>
                      {editForm.formState.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        {...editForm.register('city')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Amman"
                      />
                      {editForm.formState.errors.city && (
                        <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      {...editForm.register('address')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                    {editForm.formState.errors.address && (
                      <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time *</label>
                      <input
                        {...editForm.register('openTime')}
                        type="time"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {editForm.formState.errors.openTime && (
                        <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.openTime.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time *</label>
                      <input
                        {...editForm.register('closeTime')}
                        type="time"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {editForm.formState.errors.closeTime && (
                        <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.closeTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Location & Map Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location Coordinates</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="31.9520 (Amman, Jordan)"
                            value={mapLocation?.lat || ''}
                            onChange={(e) => {
                              const lat = parseFloat(e.target.value)
                              if (!isNaN(lat)) {
                                setMapLocation(prev => ({ lat, lng: prev?.lng || 35.9245 }))
                                editForm.setValue('latitude', lat)
                              } else {
                                setMapLocation(prev => ({ lat: 0, lng: prev?.lng || 35.9245 }))
                                editForm.setValue('latitude', undefined)
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="35.9245 (Amman, Jordan)"
                            value={mapLocation?.lng || ''}
                            onChange={(e) => {
                              const lng = parseFloat(e.target.value)
                              if (!isNaN(lng)) {
                                setMapLocation(prev => ({ lat: prev?.lat || 31.9520, lng }))
                                editForm.setValue('longitude', lng)
                              } else {
                                setMapLocation(prev => ({ lat: prev?.lat || 31.9520, lng: 0 }))
                                editForm.setValue('longitude', undefined)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Location on Map</label>
                      <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
                        <Suspense fallback={
                          <div className="h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Loading map...</p>
                            </div>
                          </div>
                        }>
                          <PigeonMapComponent
                            center={mapLocation || { lat: 31.9520, lng: 35.9245 }}
                            zoom={10}
                            onLocationSelect={({ lat, lng }) => {
                              setMapLocation({ lat, lng })
                              editForm.setValue('latitude', lat)
                              editForm.setValue('longitude', lng)
                            }}
                            selectedLocation={mapLocation}
                          />
                        </Suspense>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Click on the map to update the branch location, or enter coordinates manually above.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Branch Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          {...editForm.register('isActive')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Branch is active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...editForm.register('allowsOnlineOrders')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow online orders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...editForm.register('allowsDelivery')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow delivery</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...editForm.register('allowsPickup')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow pickup</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      editForm.reset()
                      setSelectedBranch(null)
                      setMapLocation(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    {submitting ? 'Updating...' : 'Update Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Branch Modal */}
        {showViewModal && selectedBranch && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Branch Details</h3>
                  <p className="text-sm text-gray-600">View branch information</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedBranch(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Name</label>
                          <p className="text-sm text-gray-900">{selectedBranch.name}</p>
                        </div>
                        {selectedBranch.nameAr && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Arabic Name</label>
                            <p className="text-sm text-gray-900" dir="rtl">{selectedBranch.nameAr}</p>
                          </div>
                        )}
                        {selectedBranch.phone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-sm text-gray-900">{selectedBranch.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
                      <div className="space-y-3">
                        {selectedBranch.address && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Address</label>
                            <p className="text-sm text-gray-900">{selectedBranch.address}</p>
                          </div>
                        )}
                        {selectedBranch.city && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">City</label>
                            <p className="text-sm text-gray-900">{selectedBranch.city}, {selectedBranch.country}</p>
                          </div>
                        )}
                        {selectedBranch.latitude && selectedBranch.longitude && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Coordinates</label>
                            <p className="text-sm text-gray-900">{selectedBranch.latitude}, {selectedBranch.longitude}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Operating Hours</h4>
                      <div className="space-y-3">
                        {selectedBranch.openTime && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Opening Time</label>
                            <p className="text-sm text-gray-900">{selectedBranch.openTime}</p>
                          </div>
                        )}
                        {selectedBranch.closeTime && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Closing Time</label>
                            <p className="text-sm text-gray-900">{selectedBranch.closeTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Status & Features</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBranch.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedBranch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedBranch.allowsOnlineOrders ? 'bg-green-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-700">Online Orders</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedBranch.allowsDelivery ? 'bg-green-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-700">Delivery</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedBranch.allowsPickup ? 'bg-green-400' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-700">Pickup</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBranch.isDefault && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <BuildingIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            This is the default branch for your company.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedBranch(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}