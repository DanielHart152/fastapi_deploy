import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { transcriptData, hierarchicalData } = await request.json()
    const meetingId = params.id

    // Check if user has access to this meeting
    const meetingQuery = `
      SELECT id, created_by FROM meetings 
      WHERE id = $1 AND (created_by = $2 OR $2 = ANY(participants))
    `
    const meetingResult = await pool.query(meetingQuery, [meetingId, userId])
    
    if (meetingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 })
    }

    // Update the meeting with new transcript data
    const updateQuery = `
      UPDATE meetings 
      SET 
        transcript_data = $1,
        hierarchical_data = $2,
        updated_at = NOW()
      WHERE id = $3
    `
    
    await pool.query(updateQuery, [
      transcriptData,
      hierarchicalData ? JSON.parse(hierarchicalData) : null,
      meetingId
    ])

    return NextResponse.json({ 
      message: 'Transcript updated successfully',
      meetingId 
    })

  } catch (error) {
    console.error('Error updating transcript:', error)
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    )
  }
}