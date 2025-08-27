import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthUser } from '../../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getAuthUser(req)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' })
    }

    return res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        branchId: user.branchId
      }
    })
    
  } catch (error) {
    console.error('Session validation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}