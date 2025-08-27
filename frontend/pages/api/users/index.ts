import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { getAuthUser, hasPermission, logActivity, hashPassword } from '../../../src/lib/auth'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'company_owner', 'branch_manager', 'cashier', 'call_center']),
  branchId: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  pin: z.string().min(4).max(10).regex(/^\d+$/, 'PIN must contain only digits').optional(),
  language: z.enum(['en', 'ar']).default('en'),
})

const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req as any)
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Check permissions - only super_admin and company_owner can view users
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Build query based on user role
      const whereClause: any = {
        deletedAt: null
      }
      
      if (authUser.role === 'company_owner') {
        whereClause.companyId = authUser.companyId
        // Company owners cannot see super_admin users
        whereClause.role = { not: 'super_admin' }
      }
      
      // Get users
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          language: true,
          lastLoginAt: true,
          createdAt: true,
          company: {
            select: { id: true, name: true }
          },
          branch: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Log activity
      await logActivity(authUser.id, 'view_users', {
        description: `Viewed users list (${users.length} users)`,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      })

      return res.json({ users })

    } else if (req.method === 'POST') {
      // Check permissions - only super_admin and company_owner can create users
      if (!hasPermission(authUser, ['super_admin', 'company_owner'])) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      const validatedData = createUserSchema.parse(req.body)

      // Prevent company owners from creating super_admin users
      if (authUser.role === 'company_owner' && validatedData.role === 'super_admin') {
        return res.status(403).json({ error: 'Company owners cannot create super admin users' })
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' })
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password)

      // For company owners, restrict to their company
      let companyId = authUser.companyId
      if (authUser.role === 'super_admin' && req.body.companyId) {
        companyId = req.body.companyId
      }

      // Validate branch belongs to company if provided
      if (validatedData.branchId) {
        const branch = await prisma.branch.findFirst({
          where: {
            id: validatedData.branchId,
            companyId: companyId,
            deletedAt: null
          }
        })

        if (!branch) {
          return res.status(400).json({ error: 'Invalid branch' })
        }
      }

      // Create user
      const newUser = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          role: validatedData.role,
          companyId: companyId,
          branchId: validatedData.branchId,
          passwordHash,
          pin: validatedData.pin,
          language: validatedData.language,
          status: 'active',
          createdBy: authUser.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          language: true,
          createdAt: true,
          company: {
            select: { id: true, name: true }
          },
          branch: {
            select: { id: true, name: true }
          }
        }
      })

      // Log activity
      await logActivity(authUser.id, 'create_user', {
        resourceType: 'user',
        resourceId: newUser.id,
        description: `Created user: ${newUser.name} (${newUser.email})`,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      })

      return res.status(201).json({ user: newUser })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Users API error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      })
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}