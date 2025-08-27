import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../src/lib/db'
import { getAuthUser, logActivity } from '../../../src/lib/auth'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get current user
    const user = await getAuthUser(req as any)
    
    if (user) {
      // Get token from cookie
      const token = req.cookies['auth-token']
      
      if (token) {
        // Hash token to find in database
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        
        // Revoke session
        await prisma.userSession.updateMany({
          where: {
            userId: user.id,
            tokenHash,
            isActive: true
          },
          data: {
            isActive: false,
            revokedAt: new Date()
          }
        })
      }
      
      // Log logout activity
      await logActivity(user.id, 'logout', {
        description: 'User logged out',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      })
    }
    
    // Clear cookie
    res.setHeader('Set-Cookie', [
      'auth-token=; HttpOnly; Secure=false; SameSite=Lax; Max-Age=0; Path=/'
    ])
    
    res.json({ success: true, message: 'Logged out successfully' })
    
  } catch (error) {
    console.error('Logout error:', error)
    
    // Clear cookie anyway
    res.setHeader('Set-Cookie', [
      'auth-token=; HttpOnly; Secure=false; SameSite=Lax; Max-Age=0; Path=/'
    ])
    
    res.status(500).json({ error: 'Internal server error' })
  }
}