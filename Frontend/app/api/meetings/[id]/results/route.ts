import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

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

    // Get results from backend
    const response = await fetch(`${BACKEND_URL}/api/meetings/${params.id}/results`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Results retrieval failed')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Results retrieval error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Results retrieval failed' 
    }, { status: 500 })
  }
}