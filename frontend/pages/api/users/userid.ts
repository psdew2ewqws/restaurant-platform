import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { getAuthUser, hasPermission, logActivity } from '../../../src/lib/auth'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'company_owner', 'branch_manager', 'cashier', 'call_center']).optional(),
  branchId: z.string().optional(),
  pin: z.union([z.string().min(4).max(10).regex(/^\d+$/, 'PIN must contain only digits'), z.literal('')]).optional(),
  language: z.enum(['en', 'ar']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    // Get authenticated user
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Get single user details
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
        // Company owners cannot access super_admin users
        whereClause.role = { not: 'super_admin' }
      }
      
      const user = await prisma.user.findUnique({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          language: true,
          pin: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true }
          },
          branch: {
            select: { id: true, name: true }
          },
          sessions: {
            where: { isActive: true },
            select: { 
              id: true, 
              createdAt: true,
              lastUsedAt: true,
              ipAddress: true,
              deviceType: true
            }
          },
          activityLogs: {
            take: 10,
            orderBy: { timestamp: 'desc' },
            select: {
              action: true,
              description: true,
              timestamp: true,
              success: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.json({ user })

    } else if (req.method === 'PUT') {
      // Update user
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const validatedData = updateUserSchema.parse(req.body)

      // Prevent company owners from setting super_admin role
      if (authUser.role === 'company_owner' && validatedData.role === 'super_admin') {
        return res.status(403).json({ error: 'Company owners cannot assign super admin role' })
      }

      // Check if user exists and belongs to company
      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
        // Company owners cannot access super_admin users
        whereClause.role = { not: 'super_admin' }
      }

      const existingUser = await prisma.user.findUnique({
        where: whereClause
      })

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Check if email is being changed and already exists
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: validatedData.email }
        })

        if (emailExists) {
          return res.status(400).json({ error: 'Email already exists' })
        }
      }

      // Prepare update data
      const updateData: any = {
        ...validatedData,
        updatedBy: authUser.id,
      }

      // Handle PIN field - convert empty string to null
      if (validatedData.pin === '') {
        updateData.pin = null
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          language: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true }
          },
          branch: {
            select: { id: true, name: true }
          }
        }
      })

      return res.json({ user: updatedUser })

    } else if (req.method === 'DELETE') {
      // Soft delete user
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Check if user exists and belongs to company
      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
        // Company owners cannot access super_admin users
        whereClause.role = { not: 'super_admin' }
      }

      const existingUser = await prisma.user.findUnique({
        where: whereClause
      })

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Prevent self-deletion
      if (existingUser.id === authUser.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' })
      }

      // Soft delete user
      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedBy: authUser.id,
        }
      })

      // Revoke all user sessions
      await prisma.userSession.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false, revokedAt: new Date() }
      })

      return res.json({ success: true, message: 'User deleted successfully' })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('User API error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      })
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}