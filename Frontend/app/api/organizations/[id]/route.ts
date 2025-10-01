import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const orgId = params.id

    // Get organization details
    const orgResult = await query(`
      SELECT o.*, om.role as user_role, om.joined_at as user_joined_at
      FROM organizations o
      JOIN organization_members om ON o.id = om.org_id
      WHERE o.id = $1 AND om.user_id = $2
    `, [orgId, decoded.userId])

    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const organization = orgResult.rows[0]

    // Get all members of the organization
    const membersResult = await query(`
      SELECT om.role, om.joined_at, u.id, u.full_name as name, u.email
      FROM organization_members om
      JOIN users u ON om.user_id = u.id
      WHERE om.org_id = $1
      ORDER BY om.joined_at ASC
    `, [orgId])

    organization.members = membersResult.rows.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      joinedAt: member.joined_at,
      lastActive: "Recently"
    }))

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}