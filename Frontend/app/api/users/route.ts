import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

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

    // Check if user is manager or admin
    const userResult = await query('SELECT role FROM users WHERE id = $1', [decoded.userId])
    if (userResult.rows.length === 0 || !['manager', 'admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const result = await query(
      'SELECT id, full_name as name, email, role, organization as department, phone_number as phone, created_at, updated_at FROM users ORDER BY created_at DESC'
    )

    return NextResponse.json({ users: result.rows })
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

    // Check if user is manager or admin
    const userResult = await query('SELECT role FROM users WHERE id = $1', [decoded.userId])
    if (userResult.rows.length === 0 || !['manager', 'admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, email, role, department, phone } = await request.json()

    const result = await query(
      'INSERT INTO users (full_name, email, password_hash, role, organization, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name as name, email, role, organization as department, phone_number as phone',
      [name, email, '$2b$10$temp123hash', role, department, phone]
    )

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}