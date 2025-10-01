import { NextRequest, NextResponse } from 'next/server'

console.log('🔑 API Key configured:', !!process.env.OPENAI_API_KEY)

async function callOpenAI(messages: any[], maxTokens = 2000) {
  const axios = require('axios')
  const { SocksProxyAgent } = require('socks-proxy-agent')
  
  const proxyAgent = new SocksProxyAgent('socks5://14ad4ab3904c4:b4d7a59b79@88.209.233.94:12324')
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4",
    messages,
    temperature: 0.3,
    max_tokens: maxTokens
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    httpsAgent: proxyAgent
  })

  console.log('🔗 Using proxy agent:', true)
  console.log('🌐 Response status:', response.status)

  return response.data
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 OpenAI API endpoint called')
    const { transcript, meetingTitle, meetingDate } = await request.json()
    
    console.log('📝 Received data:')
    console.log('- Meeting Title:', meetingTitle)
    console.log('- Meeting Date:', meetingDate)
    console.log('- Transcript length:', transcript?.length)
    console.log('- OpenAI API Key configured:', !!process.env.OPENAI_API_KEY)

    if (!transcript || !Array.isArray(transcript)) {
      console.error('❌ Invalid transcript data')
      return NextResponse.json({ error: 'Invalid transcript data' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🤖 Starting OpenAI analysis...')
    
    // Extract topics and summaries in single OpenAI call
    const analysisResult = await extractTopicsAndSummaries(transcript, meetingTitle, meetingDate)
    
    console.log('✅ OpenAI analysis completed:')
    console.log('- Topics found:', analysisResult?.topics?.length || 0)
    console.log('- Summaries found:', analysisResult?.summaries?.length || 0)

    return NextResponse.json({
      topics: analysisResult?.topics || [],
      summaries: analysisResult?.summaries || [],
      speakers: extractSpeakers(transcript)
    })
  } catch (error) {
    console.error('❌ AI analysis error:', error)
    return NextResponse.json({ error: `AI analysis failed: ${error.message}` }, { status: 500 })
  }
}

async function extractTopicsAndSummaries(transcript: any[], meetingTitle: string, meetingDate: string) {
  const systemPrompt = `You are an AI system that analyzes meeting transcripts. Analyze the meeting titled "${meetingTitle}" from "${meetingDate}".

Return a JSON object with both topics and summaries:
{
  "topics": [
    {
      "id": "unique_id",
      "title": "Topic Title",
      "description": "Detailed description",
      "start_time": "00:00",
      "end_time": "05:00",
      "speakers": ["Speaker 1"],
      "summary": "Key points",
      "keywords": ["keyword1"],
      "status": "discussed",
      "ai_confidence": 0.9
    }
  ],
  "summaries": [
    {
      "speaker": "Speaker Name",
      "timestamp": "00:02:30",
      "summary": "Brief summary",
      "type": "SUBSTANTIAL",
      "topics": ["topic1"]
    }
  ]
}`

  const userPrompt = `Meeting transcript:
${JSON.stringify(transcript.slice(0, 20), null, 2)}

Extract topics and summaries.`

  console.log('🤖 Calling OpenAI for analysis...')

  const response = await callOpenAI([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ], 2000)

  console.log('✅ OpenAI Response:')
  console.log('📊 Usage:', response.usage)

  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{"topics":[], "summaries":[]}')
    return parsed
  } catch (error) {
    console.error('❌ Failed to parse response:', error)
    return { topics: [], summaries: [] }
  }
}

function extractSpeakers(transcript: any[]) {
  const speakerStats: { [key: string]: any } = {}

  transcript.forEach((segment) => {
    const speaker = segment.speaker
    if (!speakerStats[speaker]) {
      speakerStats[speaker] = {
        name: speaker,
        total_time: 0,
        segments_count: 0,
        identified: true,
        participation_percentage: 0,
        avg_segment_duration: 0
      }
    }

    const duration = (segment.end || 0) - (segment.start || 0)
    speakerStats[speaker].total_time += duration
    speakerStats[speaker].segments_count += 1
  })

  const totalTime = Object.values(speakerStats).reduce((sum: number, speaker: any) => sum + speaker.total_time, 0)

  return Object.values(speakerStats).map((speaker: any) => ({
    ...speaker,
    participation_percentage: totalTime > 0 ? (speaker.total_time / totalTime) * 100 : 0,
    avg_segment_duration: speaker.segments_count > 0 ? speaker.total_time / speaker.segments_count : 0
  }))
}