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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const organizationId = searchParams.get('organization_id')
    const meetingType = searchParams.get('meeting_type')

    let queryText = `
      SELECT m.*, u.full_name as creator_name, o.name as organization_name
      FROM meetings m 
      LEFT JOIN users u ON m.created_by = u.id 
      LEFT JOIN organizations o ON m.org_id = o.id
      WHERE (
        m.created_by = $1 OR 
        m.participants @> $2 OR
        (m.org_id IN (
          SELECT org_id FROM organization_members WHERE user_id = $1
        ))
      )
    `
    let queryParams = [decoded.userId, JSON.stringify([decoded.userId])]
    let paramCount = 2

    if (organizationId) {
      queryText += ` AND m.org_id = $${++paramCount}`
      queryParams.push(organizationId)
    }

    if (meetingType) {
      queryText += ` AND m.meeting_type = $${++paramCount}`
      queryParams.push(meetingType)
    }

    if (status && status !== 'all') {
      queryText += ` AND m.status = $${++paramCount}`
      queryParams.push(status)
    }

    if (search) {
      queryText += ` AND (m.title ILIKE $${++paramCount} OR m.description ILIKE $${++paramCount})`
      queryParams.push(`%${search}%`, `%${search}%`)
      paramCount++
    }

    queryText += ' ORDER BY m.created_at DESC'

    const result = await query(queryText, queryParams)
    return NextResponse.json({ meetings: result.rows })
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

    const meetingData = await request.json()

    // Validate organization access if creating org meeting
    if (meetingData.organization_id) {
      const orgCheck = await query(`
        SELECT role FROM organization_members 
        WHERE user_id = $1 AND org_id = $2
      `, [decoded.userId, meetingData.organization_id])
      
      if (orgCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
      }
    }

    // Set initial status based on mode
    const initialStatus = meetingData.mode === 'pre-recorded' ? 'pending' : 'scheduled'

    const result = await query(`
      INSERT INTO meetings (
        title, description, meeting_date, meeting_time, duration,
        mode, status, participants, settings, created_by, org_id,
        meeting_type, access_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      meetingData.title,
      meetingData.description,
      meetingData.meeting_date,
      meetingData.meeting_time,
      parseInt(meetingData.duration),
      meetingData.mode,
      initialStatus,
      JSON.stringify(meetingData.participants || []),
      JSON.stringify(meetingData.settings || {}),
      decoded.userId,
      meetingData.organization_id || null,
      meetingData.meeting_type || 'public',
      meetingData.access_level || 'public'
    ])

    return NextResponse.json({ meeting: result.rows[0] })
  } catch (error) {
    console.error('Meeting creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}