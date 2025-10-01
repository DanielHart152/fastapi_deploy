import { NextRequest, NextResponse } from 'next/server';
import { generateHighlight } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { segment } = await request.json();

    if (!segment || !segment.speaker || !segment.text) {
      return NextResponse.json(
        { error: 'Valid segment with speaker and text is required' },
        { status: 400 }
      );
    }

    const highlight = await generateHighlight(segment);

    return NextResponse.json({ highlight });
  } catch (error) {
    console.error('Highlight generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate highlight' },
      { status: 500 }
    );
  }
}