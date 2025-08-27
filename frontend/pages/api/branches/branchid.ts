import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { getAuthUser, hasPermission, logActivity } from '../../../src/lib/auth'
import { z } from 'zod'

const updateBranchSchema = z.object({
  name: z.string().min(1, 'Name in English is required').optional(),
  nameAr: z.string().min(1, 'Name in Arabic is required').optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  isActive: z.boolean().optional(),
  allowsOnlineOrders: z.boolean().optional(),
  allowsDelivery: z.boolean().optional(),
  allowsPickup: z.boolean().optional(),
  timezone: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid branch ID' })
    }

    // Get authenticated user
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Get single branch details
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
      }
      
      const branch = await prisma.branch.findUnique({
        where: whereClause,
        select: {
          id: true,
          name: true,
          nameAr: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
          openTime: true,
          closeTime: true,
          isDefault: true,
          isActive: true,
          allowsOnlineOrders: true,
          allowsDelivery: true,
          allowsPickup: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true }
          }
        }
      })

      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' })
      }

      return res.json({ branch })

    } else if (req.method === 'PUT') {
      // Update branch
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const validatedData = updateBranchSchema.parse(req.body)

      // Check if branch exists and belongs to company
      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
      }

      const existingBranch = await prisma.branch.findUnique({
        where: whereClause
      })

      if (!existingBranch) {
        return res.status(404).json({ error: 'Branch not found' })
      }

      // Check if email is being changed and already exists
      if (validatedData.email && validatedData.email !== existingBranch.email) {
        const emailExists = await prisma.branch.findFirst({
          where: { 
            email: validatedData.email,
            deletedAt: null,
            id: { not: id }
          }
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

      // Update branch
      const updatedBranch = await prisma.branch.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          nameAr: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
          openTime: true,
          closeTime: true,
          isDefault: true,
          isActive: true,
          allowsOnlineOrders: true,
          allowsDelivery: true,
          allowsPickup: true,
          timezone: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true }
          }
        }
      })

      return res.json({ branch: updatedBranch })

    } else if (req.method === 'DELETE') {
      // Soft delete branch
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Check if branch exists and belongs to company
      const whereClause: any = {
        id,
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
      }

      const existingBranch = await prisma.branch.findUnique({
        where: whereClause
      })

      if (!existingBranch) {
        return res.status(404).json({ error: 'Branch not found' })
      }

      // Prevent deletion of default branch if there are other branches
      if (existingBranch.isDefault) {
        const otherBranches = await prisma.branch.count({
          where: {
            companyId: existingBranch.companyId,
            deletedAt: null,
            id: { not: id }
          }
        })

        if (otherBranches > 0) {
          return res.status(400).json({ error: 'Cannot delete default branch. Please set another branch as default first.' })
        }
      }

      // Soft delete branch
      await prisma.branch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedBy: authUser.id,
        }
      })

      return res.json({ success: true, message: 'Branch deleted successfully' })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Branch API error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      })
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}