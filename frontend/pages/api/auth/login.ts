import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { comparePassword, generateToken, logActivity } from '../../../src/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  pin: z.string().length(4).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, pin } = loginSchema.parse(req.body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: { id: true, name: true, status: true }
        },
        branch: {
          select: { id: true, name: true }
        }
      }
    })
    
    if (!user || user.status !== 'active' || user.deletedAt) {
      await logActivity(user?.id || '', 'login_failed', {
        description: 'Invalid credentials - user not found or inactive',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: 'Invalid credentials'
      })
      
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if company is active
    if (user.company.status !== 'active') {
      await logActivity(user.id, 'login_failed', {
        description: 'Company is not active',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: 'Company not active'
      })
      
      return res.status(401).json({ error: 'Account suspended' })
    }
    
    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await logActivity(user.id, 'login_failed', {
        description: 'Account is locked',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: 'Account locked'
      })
      
      return res.status(401).json({ 
        error: 'Account locked. Please try again later.' 
      })
    }
    
    // Verify password or PIN
    let isValid = false
    if (password) {
      isValid = await comparePassword(password, user.passwordHash)
    } else if (pin && user.pin) {
      isValid = pin === user.pin
    }
    
    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1
      const shouldLock = failedAttempts >= 5
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes
        }
      })
      
      await logActivity(user.id, 'login_failed', {
        description: `Failed login attempt ${failedAttempts}/5`,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: 'Invalid credentials'
      })
      
      return res.status(401).json({ 
        error: shouldLock 
          ? 'Account locked due to too many failed attempts' 
          : 'Invalid credentials' 
      })
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
      branchId: user.branchId || undefined
    })
    
    // Hash token for database storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    
    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    })
    
    // Reset failed attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.socket.remoteAddress,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    })
    
    // Log successful login
    await logActivity(user.id, 'login', {
      description: 'User logged in successfully',
      ipAddress: req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    })
    
    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `auth-token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/`
    ])
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        language: user.language,
        mustChangePassword: user.mustChangePassword,
        company: user.company,
        branch: user.branch
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
}