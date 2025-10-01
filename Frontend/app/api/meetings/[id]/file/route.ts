import { NextRequest, NextResponse } from 'next/server'
import { stat, createReadStream } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const statAsync = promisify(stat)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'SELECT file_path FROM meetings WHERE id = $1',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const meeting = result.rows[0]

    if (!meeting.file_path) {
      return NextResponse.json({ error: 'No file associated with this meeting' }, { status: 404 })
    }

    const filePath = join(process.cwd(), '..', 'backend', 'uploads', meeting.file_path)
    const fileStat = await statAsync(filePath)

    const ext = meeting.file_path.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    switch (ext) {
      case 'mp4': contentType = 'video/mp4'; break
      case 'avi': contentType = 'video/x-msvideo'; break
      case 'mov': contentType = 'video/quicktime'; break
      case 'mp3': contentType = 'audio/mpeg'; break
      case 'wav': contentType = 'audio/wav'; break
      case 'm4a': contentType = 'audio/mp4'; break
    }

    const range = request.headers.get('range')
    if (range) {
      // Example: "bytes=12345-"
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1

      const chunkSize = (end - start) + 1
      const fileStream = createReadStream(filePath, { start, end })

      return new NextResponse(fileStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
        },
      })
    } else {
      // No range: send whole file
      const fileStream = createReadStream(filePath)
      return new NextResponse(fileStream as any, {
        headers: {
          'Content-Length': fileStat.size.toString(),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
        },
      })
    }
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
