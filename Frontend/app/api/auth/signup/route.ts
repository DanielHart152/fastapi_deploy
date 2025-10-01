import { NextRequest, NextResponse } from 'next/server'
import { pool, createUserTable } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      full_name,
      role = 'user',
      company,
      organization,
      phone_number,
      job_title,
      address
    } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 })
    }

    // Ensure user table exists
    await createUserTable()

    const client = await pool.connect()
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email])
      
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }

      // Hash password
      const password_hash = await hashPassword(password)

      // Insert new user
      const result = await client.query(`
        INSERT INTO users (
          email, password_hash, full_name, role, company, organization, 
          phone_number, job_title, address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, full_name, role, company, organization, phone_number, job_title, status, created_at
      `, [email, password_hash, full_name, role, company, organization, phone_number, job_title, address])

      const user = result.rows[0]

      return NextResponse.json({
        message: 'User created successfully',
        user
      }, { status: 201 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}