import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1 AND status = $2',
        [email, 'active']
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const user = result.rows[0]
      const isValidPassword = await verifyPassword(password, user.password_hash)

      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = generateToken(user.id)
      const { password_hash, ...userWithoutPassword } = user

      return NextResponse.json({
        token,
        user: userWithoutPassword
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}