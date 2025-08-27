import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { 
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'super_admin' | 'company_owner' | 'branch_manager' | 'cashier' | 'call_center'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  language: 'en' | 'ar'
  pin?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
  company: { id: string; name: string }
  branch?: { id: string; name: string }
  sessions?: Array<{
    id: string
    createdAt: string
    lastUsedAt: string
    ipAddress?: string
    deviceType?: string
  }>
  activityLogs?: Array<{
    action: string
    description?: string
    timestamp: string
    success: boolean
  }>
}

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'company_owner', 'branch_manager', 'cashier', 'call_center']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  pin: z.string().min(4).max(10).regex(/^\d+$/, 'PIN must contain only digits').optional(),
  language: z.enum(['en', 'ar']).default('en'),
})

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'company_owner', 'branch_manager', 'cashier', 'call_center']).optional(),
  pin: z.union([z.string().min(4).max(10).regex(/^\d+$/, 'PIN must contain only digits'), z.literal('')]).optional(),
  language: z.enum(['en', 'ar']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
})

type CreateUserForm = z.infer<typeof createUserSchema>
type UpdateUserForm = z.infer<typeof updateUserSchema>

const roleLabels = {
  super_admin: 'Super Admin',
  company_owner: 'Company Owner',
  branch_manager: 'Branch Manager',
  cashier: 'Cashier',
  call_center: 'Call Center'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800'
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Form hooks
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  })

  const editForm = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
  })

  // Memoized filtered users for performance
  const memoizedFilteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, selectedRole, selectedStatus])

  // Update filtered users when filters change
  useEffect(() => {
    setFilteredUsers(memoizedFilteredUsers)
  }, [memoizedFilteredUsers])

  // Authentication check
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      
      if (!['super_admin', 'company_owner'].includes(user.role)) {
        toast.error('You don\'t have permission to manage users')
        router.push('/dashboard')
        return
      }
    } catch (error) {
      router.push('/login')
      return
    }
  }, [router])

  // Optimized fetch users with caching
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser, fetchUsers])

  // Optimized form handlers
  const handleCreateUser = useCallback(async (data: CreateUserForm) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('User created successfully!')
        setShowCreateModal(false)
        createForm.reset()
        fetchUsers()
      } else {
        toast.error(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }, [createForm, fetchUsers])

  const handleEditUser = useCallback(async (data: UpdateUserForm) => {
    if (!selectedUser) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/users/userid?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('User updated successfully!')
        setShowEditModal(false)
        editForm.reset()
        fetchUsers()
      } else {
        toast.error(result.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }, [selectedUser, editForm, fetchUsers])

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/users/userid?id=${selectedUser.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('User deleted successfully!')
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setSubmitting(false)
    }
  }, [selectedUser, fetchUsers])

  // Optimized view user details
  const handleViewUser = useCallback(async (user: User) => {
    try {
      const response = await fetch(`/api/users/userid?id=${user.id}`)
      const result = await response.json()
      
      if (response.ok) {
        setSelectedUser(result.user)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load user details')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Failed to load user details')
    }
  }, [])

  // Optimized edit user setup
  const handleEditUserSetup = useCallback((user: User) => {
    setSelectedUser(user)
    editForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      language: user.language,
      status: user.status,
      pin: user.pin || ''
    })
    setShowEditModal(true)
  }, [editForm])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const formatDateTime = useCallback((dateString: string | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>User Management - Restaurant Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">Settings</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">Users</span>
              </div>

              {/* Actions */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Users ({filteredUsers.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {roleLabels[user.role]}
                        </span>
                        {user.branch && (
                          <div className="text-xs text-gray-500">{user.branch.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.lastLoginAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUserSetup(user)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new user'
                  }
                </p>
                {!searchQuery && selectedRole === 'all' && selectedStatus === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...createForm.register('name')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {createForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...createForm.register('email')}
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {createForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    {...createForm.register('phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...createForm.register('role')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="cashier">Cashier</option>
                    <option value="call_center">Call Center</option>
                    <option value="branch_manager">Branch Manager</option>
                    {currentUser?.role === 'super_admin' && (
                      <>
                        <option value="company_owner">Company Owner</option>
                        <option value="super_admin">Super Admin</option>
                      </>
                    )}
                  </select>
                  {createForm.formState.errors.role && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    {...createForm.register('password')}
                    type="password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {createForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">PIN (Optional)</label>
                  <input
                    {...createForm.register('pin')}
                    type="text"
                    maxLength={10}
                    placeholder="4-10 digit PIN for POS access"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {createForm.formState.errors.pin && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.pin.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    {...createForm.register('language')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...editForm.register('name')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {editForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...editForm.register('email')}
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {editForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    {...editForm.register('phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...editForm.register('role')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="call_center">Call Center</option>
                    <option value="branch_manager">Branch Manager</option>
                    {currentUser?.role === 'super_admin' && (
                      <>
                        <option value="company_owner">Company Owner</option>
                        <option value="super_admin">Super Admin</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    {...editForm.register('status')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">PIN (Optional)</label>
                  <input
                    {...editForm.register('pin')}
                    type="text"
                    maxLength={10}
                    placeholder="4-10 digit PIN for POS access"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {editForm.formState.errors.pin && (
                    <p className="mt-1 text-sm text-red-600">{editForm.formState.errors.pin.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    {...editForm.register('language')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-2xl max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-sm text-gray-900">{roleLabels[selectedUser.role]}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedUser.status]}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.language === 'en' ? 'English' : 'Arabic'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PIN</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.pin ? '••••' : 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedUser.lastLoginAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                {selectedUser.sessions && selectedUser.sessions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Active Sessions</h4>
                    <div className="space-y-2">
                      {selectedUser.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center">
                            {session.deviceType === 'mobile' ? (
                              <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400 mr-2" />
                            ) : (
                              <ComputerDesktopIcon className="h-4 w-4 text-gray-400 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">
                              {session.ipAddress} • {session.deviceType || 'Desktop'}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatDateTime(session.lastUsedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {selectedUser.activityLogs && selectedUser.activityLogs.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUser.activityLogs.map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{log.action.replace('_', ' ')}</p>
                            {log.description && (
                              <p className="text-xs text-gray-500">{log.description}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(log.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              </div>
              
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}