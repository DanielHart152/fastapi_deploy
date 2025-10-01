import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { role } = await request.json()
    const orgId = params.id
    const userId = params.userId

    // Check if user is admin of the organization
    const adminCheck = await query(`
      SELECT role FROM organization_members 
      WHERE user_id = $1 AND org_id = $2 AND role = 'admin'
    `, [decoded.userId, orgId])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Only admins can change member roles' }, { status: 403 })
    }

    // Update member role
    await query(`
      UPDATE organization_members 
      SET role = $1 
      WHERE user_id = $2 AND org_id = $3
    `, [role, userId, orgId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}