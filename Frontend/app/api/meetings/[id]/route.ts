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

    const result = await query(`
      SELECT m.*, u.full_name as creator_name 
      FROM meetings m 
      LEFT JOIN users u ON m.created_by = u.id 
      WHERE m.id = $1 AND (m.created_by = $2 OR m.participants @> $3)
    `, [params.id, decoded.userId, JSON.stringify([decoded.userId])])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json({ meeting: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const updates = await request.json()

    const result = await query(`
      UPDATE meetings 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          meeting_date = COALESCE($3, meeting_date),
          meeting_time = COALESCE($4, meeting_time),
          duration = COALESCE($5, duration),
          status = COALESCE($6, status),
          participants = COALESCE($7, participants),
          settings = COALESCE($8, settings),
          updated_at = NOW()
      WHERE id = $9 AND created_by = $10
      RETURNING *
    `, [
      updates.title,
      updates.description,
      updates.date,
      updates.time,
      updates.duration ? parseInt(updates.duration) : null,
      updates.status,
      updates.participants ? JSON.stringify(updates.participants) : null,
      updates.settings ? JSON.stringify(updates.settings) : null,
      params.id,
      decoded.userId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ meeting: result.rows[0] })
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

    const result = await query(
      'DELETE FROM meetings WHERE id = $1 AND created_by = $2 RETURNING id',
      [params.id, decoded.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}