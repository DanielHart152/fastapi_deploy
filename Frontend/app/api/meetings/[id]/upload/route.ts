import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Forward to backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const response = await fetch(`${BACKEND_URL}/api/meetings/${params.id}/upload`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Backend upload failed')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 })
  }
}