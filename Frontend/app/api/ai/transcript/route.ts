import { NextRequest, NextResponse } from 'next/server';
import { fixTranscriptErrors } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript text is required' },
        { status: 400 }
      );
    }

    const correctedTranscript = await fixTranscriptErrors(transcript);

    return NextResponse.json({ correctedTranscript });
  } catch (error) {
    console.error('Transcript correction error:', error);
    return NextResponse.json(
      { error: 'Failed to correct transcript' },
      { status: 500 }
    );
  }
}