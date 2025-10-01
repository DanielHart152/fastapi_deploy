import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

const proxyAgent = new SocksProxyAgent('socks5://14ad4ab3904c4:b4d7a59b79@88.209.233.94:12324');
const OPENAI_API_KEY = process.env.OPENAI_APIKEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: any[], temperature: number = 0.3): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    agent: proxyAgent,
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export interface SpeakerSegment {
  speaker: string;
  text: string;
  start_time?: number;
  end_time?: number;
}

export interface SummaryResult {
  speaker: string;
  summary: string;
  topics: string[];
  classification: 'SUBSTANTIAL' | 'PROCEDURAL';
}

export interface AgendaItem {
  index: number;
  title: string;
  description?: string;
  location?: string;
  responsible?: string;
}

export async function summarizeSpeakerSegments(segments: SpeakerSegment[]): Promise<SummaryResult[]> {
  const prompt = `Analyze the following meeting transcript segments and for each speaker segment, provide:
1. A concise summary (1-3 sentences, ~50 words)
2. Key topics/subjects discussed
3. Classification as either "SUBSTANTIAL" (meaningful discussion) or "PROCEDURAL" (administrative)

Segments:
${segments.map((seg, i) => `${i + 1}. Speaker ${seg.speaker}: ${seg.text}`).join('\n')}

Respond in JSON format as an array of objects with fields: speaker, summary, topics (array), classification`;

  const response = await callOpenAI([{ role: 'user', content: prompt }], 0.3);
  return JSON.parse(response || '[]');
}

export async function extractAgendaFromText(agendaText: string): Promise<AgendaItem[]> {
  const prompt = `Extract agenda items from the following meeting agenda text. For each item, identify:
- Index number
- Title/topic
- Description (if available)
- Location (if mentioned)
- Responsible person/department (if mentioned)

Agenda text:
${agendaText}

Respond in JSON format as an array of objects with fields: index, title, description, location, responsible`;

  const response = await callOpenAI([{ role: 'user', content: prompt }], 0.2);
  return JSON.parse(response || '[]');
}

export async function fixTranscriptErrors(transcript: string): Promise<string> {
  const prompt = `Fix transcription errors in the following meeting transcript while preserving:
- Original meaning and context
- Speaker attributions
- Proper grammar and readability

Transcript:
${transcript}

Return only the corrected transcript text.`;

  const response = await callOpenAI([{ role: 'user', content: prompt }], 0.1);
  return response || transcript;
}

export async function generateHighlight(segment: SpeakerSegment): Promise<string> {
  const prompt = `Create a social media-ready highlight summary from this meeting segment:

Speaker: ${segment.speaker}
Content: ${segment.text}

Generate a concise, engaging summary suitable for public sharing (1-2 sentences, under 280 characters).`;

  const response = await callOpenAI([{ role: 'user', content: prompt }], 0.4);
  return response || '';
}