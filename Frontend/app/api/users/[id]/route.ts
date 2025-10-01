import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    await query(
      'UPDATE users SET full_name = $1, email = $2, role = $3, organization = $4, phone_number = $5, updated_at = NOW() WHERE id = $6',
      [name, email, role, department, phone, params.id]
    )

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    await query('DELETE FROM users WHERE id = $1', [params.id])

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}