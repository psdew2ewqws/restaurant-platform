import { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { UserRole, UserStatus } from '@prisma/client'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  companyId: string
  branchId?: string
}

export interface JWTPayload {
  userId: string
  role: UserRole
  companyId: string
  branchId?: string
  iat: number
  exp: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '30d', // 30 days like Picolinate
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    return null
  }
}

// Get current user from request
export async function getAuthUser(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    // Try to get token from cookie first, then Authorization header
    let token = req.cookies['auth-token']
    
    if (!token) {
      const authHeader = req.headers['authorization']
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return null
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        status: 'active',
        deletedAt: null
      },
      include: {
        company: {
          select: { id: true, name: true, status: true }
        },
        branch: {
          select: { id: true, name: true }
        }
      }
    })

    if (!user || user.company.status !== 'active') {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      branchId: user.branchId || undefined
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Check if user has permission
export function hasPermission(user: AuthUser, requiredRole: UserRole | UserRole[]): boolean {
  const roleHierarchy: UserRole[] = [
    'super_admin',
    'company_owner',
    'branch_manager', 
    'cashier',
    'call_center'
  ]

  const userRoleIndex = roleHierarchy.indexOf(user.role)
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => {
      const requiredRoleIndex = roleHierarchy.indexOf(role)
      return userRoleIndex <= requiredRoleIndex
    })
  } else {
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
    return userRoleIndex <= requiredRoleIndex
  }
}

// Log user activity
export async function logActivity(
  userId: string,
  action: string,
  options?: {
    resourceType?: string
    resourceId?: string
    description?: string
    ipAddress?: string
    userAgent?: string
    success?: boolean
    errorMessage?: string
  }
) {
  try {
    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
        description: options?.description,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        success: options?.success ?? true,
        errorMessage: options?.errorMessage,
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}