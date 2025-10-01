import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

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

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const speakerName = formData.get('speakerName') as string || 'user_voice'

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    // Save audio file temporarily
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const audioId = randomUUID()
    const audioPath = path.join(tempDir, `${audioId}.wav`)
    
    const arrayBuffer = await audioFile.arrayBuffer()
    fs.writeFileSync(audioPath, Buffer.from(arrayBuffer))

    // Call Python speaker enrollment
    const pythonScript = path.join(process.cwd(), '..', '4_speaker_diarization', 'speaker_enrollment_api.py')
    
    return new Promise((resolve) => {
      const python = spawn('python', [pythonScript, audioPath, speakerName, decoded.userId], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      })
      
      let output = ''
      let error = ''

      python.stdout.on('data', (data) => {
        output += data.toString('utf-8')
      })

      python.stderr.on('data', (data) => {
        error += data.toString('utf-8')
      })

      python.on('close', async (code) => {
        // Clean up temp file
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
        }

        console.log('Python output:', output)
        console.log('Python error:', error)
        console.log('Exit code:', code)

        if (code === 0) {
          try {
            // Clean the output and parse JSON
            const cleanOutput = output.replace(/\r\n/g, '').replace(/\r/g, '').trim()
            const lines = cleanOutput.split('\n')
            const jsonLine = lines.find(line => line.trim().startsWith('{')) || cleanOutput
            const result = JSON.parse(jsonLine.trim())
            if (result.success) {
              // Save voice print data to database
              await query(
                'UPDATE users SET voice_print_data = $1, voice_print_status = $2, updated_at = NOW() WHERE id = $3',
                [JSON.stringify(result.voiceprint), 'configured', decoded.userId]
              )
              resolve(NextResponse.json({ message: 'Voice print enrolled successfully', data: result }))
            } else {
              resolve(NextResponse.json({ error: result.error || 'Enrollment failed' }, { status: 500 }))
            }
          } catch (parseError) {
            console.log('Parse error:', parseError)
            resolve(NextResponse.json({ error: `Failed to parse: ${output}` }, { status: 500 }))
          }
        } else {
          resolve(NextResponse.json({ error: error || `Process failed with code ${code}` }, { status: 500 }))
        }
      })
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}