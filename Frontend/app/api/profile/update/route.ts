import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const {
      full_name,
      phone_number,
      company,
      organization,
      job_title,
      address,
      avatar_url
    } = await request.json()

    const client = await pool.connect()
    try {
      const result = await client.query(`
        UPDATE users 
        SET full_name = $1, phone_number = $2, company = $3, organization = $4, 
            job_title = $5, address = $6, avatar_url = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING id, email, full_name, role, company, organization, phone_number, job_title, address, avatar_url, status, created_at
      `, [full_name, phone_number, company, organization, job_title, address, avatar_url, decoded.userId])

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}