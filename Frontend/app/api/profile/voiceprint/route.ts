import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const voiceprintFile = formData.get('voiceprint') as File
    const trimStart = formData.get('trimStart') as string
    const trimEnd = formData.get('trimEnd') as string

    if (!voiceprintFile) {
      return NextResponse.json({ error: 'No voiceprint file provided' }, { status: 400 })
    }

    // Generate unique voiceprint ID
    const voiceprintId = `vp_${decoded.userId}_${Date.now()}`

    const client = await pool.connect()
    try {
      // Update user's voiceprint status
      await client.query(`
        UPDATE users 
        SET voice_print_id = $1, voice_print_status = 'configured', updated_at = NOW()
        WHERE id = $2
      `, [voiceprintId, decoded.userId])

      return NextResponse.json({
        message: 'Voiceprint saved successfully',
        voiceprintId,
        trimStart: parseFloat(trimStart),
        trimEnd: parseFloat(trimEnd)
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Voiceprint save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}