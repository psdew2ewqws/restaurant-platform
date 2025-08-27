import { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Lazy load heavy components for better performance
const PigeonMapComponent = lazy(() => import('../src/components/PigeonMapComponent'))

// Memoized skeleton component for loading states
const BranchCardSkeleton = memo(() => (
  <div className="animate-pulse bg-white rounded-lg shadow border p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
    </div>
  </div>
))

BranchCardSkeleton.displayName = 'BranchCardSkeleton'

// Memoized BranchCard component for optimal list rendering
const BranchCard = memo(({ branch, onView, onEdit, onDelete }: {
  branch: any
  onView: (branch: any) => void
  onEdit: (branch: any) => void
  onDelete: (branch: any) => void
}) => {
  const handleView = useCallback(() => onView(branch), [branch, onView])
  const handleEdit = useCallback(() => onEdit(branch), [branch, onEdit])
  const handleDelete = useCallback(() => onDelete(branch), [branch, onDelete])

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{branch.name}</h3>
            {branch.nameAr && (
              <p className="text-sm text-gray-600 mb-2" dir="rtl">{branch.nameAr}</p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                branch.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {branch.isActive ? 'Active' : 'Inactive'}
              </span>
              {branch.isDefault && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {branch.phone && (
            <p className="text-sm text-gray-600">📞 {branch.phone}</p>
          )}
          {branch.address && (
            <p className="text-sm text-gray-600">📍 {branch.address}</p>
          )}
          {branch.city && branch.country && (
            <p className="text-sm text-gray-600">🌍 {branch.city}, {branch.country}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleView}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Edit branch"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete branch"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

BranchCard.displayName = 'BranchCard'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Generate time options with minutes
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      const formattedHour = hour12.toString()
      const formattedMinute = minute.toString().padStart(2, '0')
      const displayTime = `${formattedHour}:${formattedMinute} ${ampm}`
      const valueTime = `${hour.toString().padStart(2, '0')}:${formattedMinute}`
      times.push({ value: valueTime, display: displayTime })
    }
  }
  return times
}

const timeOptions = generateTimeOptions()

interface Branch {
  id: string
  name: string
  nameAr: string
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
  timezone: string
  createdAt: string
  updatedAt?: string
  company: { id: string; name: string }
}

const createBranchSchema = z.object({
  name: z.string().min(1, 'Name in English is required'),
  nameAr: z.string().min(1, 'Name in Arabic is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Jordan'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  isActive: z.boolean().default(true),
  allowsOnlineOrders: z.boolean().default(true),
  allowsDelivery: z.boolean().default(true),
  allowsPickup: z.boolean().default(true),
  timezone: z.string().default('Asia/Amman'),
})

const updateBranchSchema = createBranchSchema.partial()

type CreateBranchForm = z.infer<typeof createBranchSchema>
type UpdateBranchForm = z.infer<typeof updateBranchSchema>


const countries = [
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
]

export default function BranchesPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')

  // Debounce search query for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Memoized filtered branches for optimal performance
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = debouncedSearchQuery.toLowerCase() === '' || 
        branch.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        branch.nameAr?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        branch.address?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        branch.city?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        branch.phone?.includes(debouncedSearchQuery)

      const matchesCountry = selectedCountry === 'all' || 
        branch.country === countries.find(c => c.code === selectedCountry)?.name

      return matchesSearch && matchesCountry
    })
  }, [branches, debouncedSearchQuery, selectedCountry])

  // Memoized countries list from branches
  const availableCountries = useMemo(() => {
    const countrySet = new Set(branches.map(branch => branch.country).filter(Boolean))
    return countries.filter(country => countrySet.has(country.name))
  }, [branches])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>({ lat: 31.9539, lng: 35.9106 })
  const [manualCoordinates, setManualCoordinates] = useState({ lat: '31.953900', lng: '35.910600' })

  // Form instances
  const createForm = useForm<CreateBranchForm>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      country: 'Jordan',
      timezone: 'Asia/Amman',
      isActive: true,
      allowsOnlineOrders: true,
      allowsDelivery: true,
      allowsPickup: true,
    }
  })

  const editForm = useForm<UpdateBranchForm>({
    resolver: zodResolver(updateBranchSchema),
  })

  // Authentication check
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      
      // Check if user has access to branch management
      const allowedRoles = ['super_admin', 'company_owner']
      if (!allowedRoles.includes(user.role)) {
        toast.error('Access denied. Insufficient permissions.')
        router.push('/dashboard')
        return
      }
      
      setCurrentUser(user)
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/branches')
      const data = await response.json()
      setBranches(data.branches || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchBranches()
    }
  }, [currentUser, fetchBranches])


  // Create branch
  const handleCreateBranch = useCallback(async (data: CreateBranchForm) => {
    setSubmitting(true)
    try {
      const branchData = {
        ...data,
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
      }

      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Branch created successfully!')
        setShowCreateModal(false)
        createForm.reset()
        setMapLocation(null)
        fetchBranches()
      } else {
        toast.error(result.error || 'Failed to create branch')
      }
    } catch (error) {
      console.error('Error creating branch:', error)
      toast.error('Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }, [createForm, fetchBranches, mapLocation])

  // Edit branch
  const handleEditBranch = useCallback(async (data: UpdateBranchForm) => {
    if (!selectedBranch) return
    
    setSubmitting(true)
    try {
      const branchData = {
        ...data,
        latitude: mapLocation?.lat || selectedBranch.latitude,
        longitude: mapLocation?.lng || selectedBranch.longitude,
      }

      const response = await fetch(`/api/branches/branchid?id=${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Branch updated successfully!')
        setShowEditModal(false)
        setSelectedBranch(null)
        editForm.reset()
        setMapLocation(null)
        fetchBranches()
      } else {
        toast.error(result.error || 'Failed to update branch')
      }
    } catch (error) {
      console.error('Error updating branch:', error)
      toast.error('Failed to update branch')
    } finally {
      setSubmitting(false)
    }
  }, [selectedBranch, editForm, fetchBranches, mapLocation])

  // Delete branch
  // Memoized branch action callbacks

  const handleEditBranchClick = useCallback((branch: Branch) => {
    handleEditBranchSetup(branch)
  }, [])

  const handleDeleteBranchClick = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
    setShowDeleteModal(true)
  }, [])

  const handleDeleteBranch = useCallback(async () => {
    if (!selectedBranch) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/branches/branchid?id=${selectedBranch.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('Branch deleted successfully!')
        setShowDeleteModal(false)
        setSelectedBranch(null)
        fetchBranches()
      } else {
        toast.error(result.error || 'Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      toast.error('Failed to delete branch')
    } finally {
      setSubmitting(false)
    }
  }, [selectedBranch, fetchBranches])

  // View branch details
  const handleViewBranch = useCallback(async (branch: Branch) => {
    try {
      const response = await fetch(`/api/branches/branchid?id=${branch.id}`)
      const result = await response.json()
      
      if (response.ok) {
        setSelectedBranch(result.branch)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load branch details')
      }
    } catch (error) {
      console.error('Error fetching branch details:', error)
      toast.error('Failed to load branch details')
    }
  }, [])

  // Edit branch setup
  const handleEditBranchSetup = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
    editForm.reset({
      name: branch.name,
      nameAr: branch.nameAr,
      phone: branch.phone || '',
      address: branch.address || '',
      city: branch.city || '',
      country: branch.country || 'Jordan',
      openTime: branch.openTime || '',
      closeTime: branch.closeTime || '',
      isActive: branch.isActive,
      allowsOnlineOrders: branch.allowsOnlineOrders,
      allowsDelivery: branch.allowsDelivery,
      allowsPickup: branch.allowsPickup,
      timezone: branch.timezone
    })
    
    // Initialize coordinates and map location properly
    if (branch.latitude && branch.longitude) {
      const lat = parseFloat(branch.latitude.toString())
      const lng = parseFloat(branch.longitude.toString())
      setMapLocation({ lat, lng })
      setManualCoordinates({ 
        lat: lat.toFixed(6), 
        lng: lng.toFixed(6) 
      })
    } else {
      // Default to Amman, Jordan
      setMapLocation({ lat: 31.9539, lng: 35.9106 })
      setManualCoordinates({ 
        lat: '31.953900', 
        lng: '35.910600' 
      })
    }
    
    setShowEditModal(true)
  }, [editForm])

  const formatTime = useCallback((timeString: string) => {
    if (!timeString) return 'Not set'
    return timeString
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Branch Management - Restaurant Platform</title>
        <meta name="description" content="Manage restaurant branches" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/dashboard" className="mr-4">
                  <ChevronLeftIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                    Branch Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage your restaurant locations and settings
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Branch
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search branches by name, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Country Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Show skeleton loading states
              Array.from({ length: 6 }).map((_, index) => (
                <BranchCardSkeleton key={index} />
              ))
            ) : (
              filteredBranches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onView={handleViewBranch}
                  onEdit={handleEditBranchClick}
                  onDelete={handleDeleteBranchClick}
                />
              ))
            )}
          </div>

          {!loading && filteredBranches.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No branches found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCountry !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first branch.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Branch</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  createForm.reset()
                  setMapLocation(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={createForm.handleSubmit(handleCreateBranch)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch Names */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name (English) *
                  </label>
                  <input
                    {...createForm.register('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Main Branch"
                  />
                  {createForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name (Arabic) *
                  </label>
                  <input
                    {...createForm.register('nameAr')}
                    type="text"
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="الفرع الرئيسي"
                  />
                  {createForm.formState.errors.nameAr && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.nameAr.message}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country={'jo'}
                    value={createForm.watch('phone') || ''}
                    onChange={(phone) => createForm.setValue('phone', phone)}
                    inputClass="!w-full !h-10 !text-base !border-gray-300 !rounded-lg"
                    containerClass="!w-full"
                    buttonClass="!border-gray-300 !rounded-l-lg"
                  />
                </div>


                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    {...createForm.register('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, building number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    {...createForm.register('city')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Amman"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    {...createForm.register('country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    {...createForm.register('openTime')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    {...createForm.register('closeTime')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualCoordinates.lat}
                    onChange={(e) => {
                      const lat = e.target.value
                      setManualCoordinates(prev => ({ ...prev, lat }))
                      if (lat && manualCoordinates.lng) {
                        setMapLocation({ lat: parseFloat(lat), lng: parseFloat(manualCoordinates.lng) })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="31.9539"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualCoordinates.lng}
                    onChange={(e) => {
                      const lng = e.target.value
                      setManualCoordinates(prev => ({ ...prev, lng }))
                      if (manualCoordinates.lat && lng) {
                        setMapLocation({ lat: parseFloat(manualCoordinates.lat), lng: parseFloat(lng) })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="35.9106"
                  />
                </div>

                {/* Map */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location on Map (Click to set or enter coordinates above)
                  </label>
                  <Suspense 
                    fallback={
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading map...</p>
                        </div>
                      </div>
                    }
                  >
                    <PigeonMapComponent
                      center={mapLocation || { lat: 31.9539, lng: 35.9106 }} // Amman, Jordan
                      zoom={13}
                      onLocationSelect={(location) => {
                        setMapLocation(location)
                        setManualCoordinates({ 
                          lat: location.lat.toFixed(6), 
                          lng: location.lng.toFixed(6) 
                        })
                      }}
                      selectedLocation={mapLocation}
                    />
                  </Suspense>
                </div>

                {/* Settings */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Branch Settings
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        {...createForm.register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Branch is active
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...createForm.register('allowsOnlineOrders')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow online orders
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...createForm.register('allowsDelivery')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow delivery
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...createForm.register('allowsPickup')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow pickup
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    createForm.reset()
                    setMapLocation({ lat: 31.9539, lng: 35.9106 })
                    setManualCoordinates({ lat: '31.953900', lng: '35.910600' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Branch</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedBranch(null)
                  editForm.reset()
                  setMapLocation({ lat: 31.9539, lng: 35.9106 })
                  setManualCoordinates({ lat: '31.953900', lng: '35.910600' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editForm.handleSubmit(handleEditBranch)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch Names */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name (English)
                  </label>
                  <input
                    {...editForm.register('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name (Arabic)
                  </label>
                  <input
                    {...editForm.register('nameAr')}
                    type="text"
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editForm.formState.errors.nameAr && (
                    <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.nameAr.message}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country={'jo'}
                    value={editForm.watch('phone') || ''}
                    onChange={(phone) => editForm.setValue('phone', phone)}
                    inputClass="!w-full !h-10 !text-base !border-gray-300 !rounded-lg"
                    containerClass="!w-full"
                    buttonClass="!border-gray-300 !rounded-l-lg"
                  />
                </div>


                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    {...editForm.register('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    {...editForm.register('city')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    {...editForm.register('country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    {...editForm.register('openTime')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    {...editForm.register('closeTime')}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualCoordinates.lat}
                    onChange={(e) => {
                      const lat = e.target.value
                      setManualCoordinates(prev => ({ ...prev, lat }))
                      if (lat && manualCoordinates.lng) {
                        setMapLocation({ lat: parseFloat(lat), lng: parseFloat(manualCoordinates.lng) })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="31.9539"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualCoordinates.lng}
                    onChange={(e) => {
                      const lng = e.target.value
                      setManualCoordinates(prev => ({ ...prev, lng }))
                      if (manualCoordinates.lat && lng) {
                        setMapLocation({ lat: parseFloat(manualCoordinates.lat), lng: parseFloat(lng) })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="35.9106"
                  />
                </div>

                {/* Map */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location on Map (Click to set or enter coordinates above)
                  </label>
                  <Suspense fallback={
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }>
                    <PigeonMapComponent
                      center={mapLocation || (selectedBranch.latitude && selectedBranch.longitude 
                        ? { lat: parseFloat(selectedBranch.latitude), lng: parseFloat(selectedBranch.longitude) }
                        : { lat: 31.9539, lng: 35.9106 }
                      )}
                      zoom={13}
                      onLocationSelect={(location) => {
                        setMapLocation(location)
                        setManualCoordinates({ 
                          lat: location.lat.toFixed(6), 
                          lng: location.lng.toFixed(6) 
                        })
                      }}
                      selectedLocation={mapLocation || (selectedBranch.latitude && selectedBranch.longitude 
                        ? { lat: parseFloat(selectedBranch.latitude), lng: parseFloat(selectedBranch.longitude) }
                        : null
                      )}
                    />
                  </Suspense>
                </div>

                {/* Settings */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Branch Settings
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        {...editForm.register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Branch is active
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...editForm.register('allowsOnlineOrders')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow online orders
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...editForm.register('allowsDelivery')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow delivery
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        {...editForm.register('allowsPickup')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Allow pickup
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedBranch(null)
                    editForm.reset()
                    setMapLocation(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Branch Modal */}
      {showViewModal && selectedBranch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Branch Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedBranch(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name (English)</label>
                    <p className="text-sm text-gray-900">{selectedBranch.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name (Arabic)</label>
                    <p className="text-sm text-gray-900" dir="rtl">{selectedBranch.nameAr}</p>
                  </div>

                  {selectedBranch.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900">{selectedBranch.phone}</p>
                    </div>
                  )}


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedBranch.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedBranch.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {selectedBranch.isDefault && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                    <p className="text-sm text-gray-900">
                      {formatTime(selectedBranch.openTime)} - {formatTime(selectedBranch.closeTime)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedBranch.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-sm text-gray-900">{selectedBranch.address}</p>
                    </div>
                  )}

                  {selectedBranch.city && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <p className="text-sm text-gray-900">{selectedBranch.city}</p>
                    </div>
                  )}

                  {selectedBranch.country && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <p className="text-sm text-gray-900">{selectedBranch.country}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${selectedBranch.allowsOnlineOrders ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-900">Online Orders</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${selectedBranch.allowsDelivery ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-900">Delivery</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${selectedBranch.allowsPickup ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-900">Pickup</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedBranch.createdAt)}</p>
                  </div>
                </div>
              </div>

              {(selectedBranch.latitude && selectedBranch.longitude) && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Suspense fallback={
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }>
                    <PigeonMapComponent
                      center={{ 
                        lat: parseFloat(selectedBranch.latitude.toString()), 
                        lng: parseFloat(selectedBranch.longitude.toString()) 
                      }}
                      zoom={15}
                      selectedLocation={{ 
                        lat: parseFloat(selectedBranch.latitude.toString()), 
                        lng: parseFloat(selectedBranch.longitude.toString()) 
                      }}
                      readonly={true}
                    />
                  </Suspense>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditBranchSetup(selectedBranch)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  Edit Branch
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedBranch(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Branch Modal */}
      {showDeleteModal && selectedBranch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center p-6 border-b border-gray-200">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Delete Branch</h2>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{selectedBranch.name}</strong>? 
                This action cannot be undone and will remove all branch data.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-0 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedBranch(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBranch}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}