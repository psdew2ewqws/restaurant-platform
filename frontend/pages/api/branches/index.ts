import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { getAuthUser, hasPermission, logActivity } from '../../../src/lib/auth'
import { z } from 'zod'

const createBranchSchema = z.object({
  name: z.string().min(1, 'Name in English is required'),
  nameAr: z.string().min(1, 'Name in Arabic is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Check permissions - only super_admin and company_owner can view branches
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Build query based on user role
      const whereClause: any = {
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
      }
      
      // Get branches
      const branches = await prisma.branch.findMany({
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
        },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      return res.json({ branches })

    } else if (req.method === 'POST') {
      // Check permissions - only super_admin and company_owner can create branches
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const validatedData = createBranchSchema.parse(req.body)

      // For company owners, restrict to their company
      let companyId = authUser.companyId
      if (authUser.role === 'super_admin' && req.body.companyId) {
        companyId = req.body.companyId
      }

      // Check if this will be the first branch (make it default)
      const existingBranches = await prisma.branch.count({
        where: {
          companyId: companyId,
          deletedAt: null
        }
      })

      const isFirstBranch = existingBranches === 0

      // Create branch
      const newBranch = await prisma.branch.create({
        data: {
          name: validatedData.name,
          nameAr: validatedData.nameAr,
          phone: validatedData.phone,
          email: validatedData.email,
          address: validatedData.address,
          city: validatedData.city,
          country: validatedData.country,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          openTime: validatedData.openTime,
          closeTime: validatedData.closeTime,
          isDefault: isFirstBranch,
          isActive: validatedData.isActive,
          allowsOnlineOrders: validatedData.allowsOnlineOrders,
          allowsDelivery: validatedData.allowsDelivery,
          allowsPickup: validatedData.allowsPickup,
          timezone: validatedData.timezone,
          companyId: companyId,
          createdBy: authUser.id,
        },
        select: {
          id: true,
          name: true,
          nameAr: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          country: true,
          isDefault: true,
          isActive: true,
          allowsOnlineOrders: true,
          allowsDelivery: true,
          allowsPickup: true,
          createdAt: true,
          company: {
            select: { id: true, name: true }
          }
        }
      })

      return res.status(201).json({ branch: newBranch })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Branches API error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      })
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}