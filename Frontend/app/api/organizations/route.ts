import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.headers.get('authorization')?.replace('Bearer ', '')
//     if (!token) {
//       return NextResponse.json({ error: 'No token provided' }, { status: 401 })
//     }

//     const decoded = verifyToken(token)
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
//     }

//     // Get user's organizations
//     const result = await query(`
//       SELECT o.*, om.role, om.joined_at,
//              COUNT(om2.user_id) as member_count
//       FROM organizations o
//       JOIN organization_members om ON o.id = om.org_id
//       LEFT JOIN organization_members om2 ON o.id = om2.org_id
//       WHERE om.user_id = $1
//       GROUP BY o.id, om.role, om.joined_at
//       ORDER BY om.joined_at DESC
//     `, [decoded.userId])

//     return NextResponse.json({ organizations: result.rows })
//   } catch (error) {
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's organizations
    const orgsResult = await query(`
      SELECT DISTINCT o.*, om.role as user_role, om.joined_at as user_joined_at
      FROM organizations o
      JOIN organization_members om ON o.id = om.org_id
      WHERE om.user_id = $1
      ORDER BY om.joined_at DESC
    `, [decoded.userId])

    // Get members for each organization
    const organizations = []
    for (const org of orgsResult.rows) {
      const membersResult = await query(`
        SELECT om.role, om.joined_at, u.id as userId, u.full_name as name, u.email
        FROM organization_members om
        JOIN users u ON om.user_id = u.id
        WHERE om.org_id = $1
      `, [org.id])

      organizations.push({
        ...org,
        members: membersResult.rows.map(member => ({
          userId: member.userid,
          name: member.name,
          email: member.email,
          role: member.role,
          joinedAt: member.joined_at
        })),
        createdAt: org.created_at
      })
    }

    return NextResponse.json({ organizations })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, description } = await request.json()

    // Create organization
    const orgResult = await query(`
      INSERT INTO organizations (name, description, admin_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, decoded.userId])

    const organization = orgResult.rows[0]

    // Add creator as admin member
    await query(`
      INSERT INTO organization_members (user_id, org_id, role)
      VALUES ($1, $2, 'admin')
    `, [decoded.userId, organization.id])

    return NextResponse.json({ organization })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}