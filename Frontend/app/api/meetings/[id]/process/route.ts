import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'
const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const requestData = await request.json()
    
    // Get meeting settings from database
    const meetingResult = await query(
      'SELECT settings FROM meetings WHERE id = $1 AND created_by = $2',
      [params.id, decoded.userId]
    )
    
    if (meetingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 })
    }
    
    const settings = meetingResult.rows[0].settings || {}
    
    // Forward processing request to backend
    const backendRequest = {
      meeting_id: params.id,
      file_path: requestData.file_path,
      youtube_url: requestData.youtube_url,
      settings: settings
    }
    
    const response = await fetch(`${BACKEND_URL}/api/meetings/${params.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Backend processing failed')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Processing failed' 
    }, { status: 500 })
  }
}

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

    // Get status from backend
    const response = await fetch(`${BACKEND_URL}/api/meetings/${params.id}/status`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Status check failed')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Status check failed' 
    }, { status: 500 })
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

    const { backendMeetingId, transcriptData, topicsData, speakersData, aiSummary } = await request.json()
    
    // Update meeting with AI processing results
    const result = await query(`
      UPDATE meetings 
      SET transcript_data = $1,
          topics_data = $2,
          speakers_data = $3,
          ai_summary = $4,
          status = 'completed',
          updated_at = NOW()
      WHERE id = $5 AND created_by = $6
      RETURNING *
    `, [
      transcriptData,
      topicsData,
      speakersData,
      aiSummary,
      params.id,
      decoded.userId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ meeting: result.rows[0] })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Update failed' 
    }, { status: 500 })
  }
}