import { NextRequest, NextResponse } from 'next/server';
import { summarizeSpeakerSegments } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { segments } = await request.json();

    if (!segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { error: 'Invalid segments data' },
        { status: 400 }
      );
    }

    const summaries = await summarizeSpeakerSegments(segments);

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize segments' },
      { status: 500 }
    );
  }
}