import { NextRequest, NextResponse } from 'next/server';
import { extractAgendaFromText } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { agendaText } = await request.json();

    if (!agendaText) {
      return NextResponse.json(
        { error: 'Agenda text is required' },
        { status: 400 }
      );
    }

    const agendaItems = await extractAgendaFromText(agendaText);

    return NextResponse.json({ agendaItems });
  } catch (error) {
    console.error('Agenda extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract agenda items' },
      { status: 500 }
    );
  }
}