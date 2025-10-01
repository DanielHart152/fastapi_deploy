const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface MeetingStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stage: string;
  progress: number;
  error?: string;
  created_at: string;
}

export interface TranscriptSegment {
  speaker: string;
  timestamp: string;
  text: string;
  start: number;
  end: number;
}

export interface Topic {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  speakers: string[];
  summary: string;
  keywords: string[];
  status: 'discussed' | 'pending' | 'decided';
  ai_confidence: number;
}

export interface Speaker {
  name: string;
  total_time: number;
  segments_count: number;
  identified: boolean;
  participation_percentage: number;
  avg_segment_duration: number;
}

export interface MeetingData {
  meeting_id: string;
  transcript: TranscriptSegment[];
  topics: Topic[];
  speakers: Speaker[];
  processed_at: string;
  total_duration: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createPreRecordedMeeting(meetingId: string, formData: FormData): Promise<{ meeting_id: string; status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_id: meetingId,
        file_path: formData.get('file') ? 'uploaded_file' : null,
        youtube_url: formData.get('youtube_url') || null,
        settings: {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start processing');
    }

    return response.json();
  }

  async getMeetingStatus(meetingId: string): Promise<MeetingStatus> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get meeting status');
    }

    const data = await response.json();
    return {
      status: data.status as 'queued' | 'processing' | 'completed' | 'failed',
      stage: data.status === 'processing' ? 'transcription' : data.status,
      progress: data.progress || (data.status === 'completed' ? 100 : data.status === 'processing' ? 50 : 0),
      error: data.error,
      created_at: new Date().toISOString()
    };
  }


  async getMeetingData(meetingId: string): Promise<MeetingData> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/results`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get meeting data');
    }
    const data = await response.json();
    
    // Parse the transcript data
    let transcript = [];
    if (data.transcript_data) {
      const lines = data.transcript_data.split('\n');
      transcript = lines.map((line: string) => {
        if (line.includes('] ') && line.includes(': ')) {
          const [timestampPart, content] = line.split('] ', 2);
          const timestamp = timestampPart.replace('[', '');
          const [speaker, text] = content.split(': ', 2);
          return { speaker: speaker.trim(), text: text.trim(), timestamp };
        }
        return null;
      }).filter(Boolean);
    }
    
    return {
      meeting_id: meetingId,
      transcript,
      topics: data.topics_data ? JSON.parse(data.topics_data) : [],
      speakers: data.speakers_data ? JSON.parse(data.speakers_data) : [],
      processed_at: new Date().toISOString(),
      total_duration: 0
    };
  }

  async getTranscript(meetingId: string): Promise<{ transcript: string; segments: TranscriptSegment[] }> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/transcript`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get transcript');
    }
    return response.json();
  }

  async getTopics(meetingId: string): Promise<{ topics: Topic[] }> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/topics`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get topics');
    }

    return response.json();
  }

  async getSpeakers(meetingId: string): Promise<{ speakers: Speaker[] }> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/speakers`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get speakers');
    }

    return response.json();
  }

  async downloadTranscript(meetingId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/download`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download transcript');
    }

    return response.blob();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  // Utility method to poll meeting status until completion
  async pollMeetingStatus(
    meetingId: string,
    onStatusUpdate?: (status: MeetingStatus) => void,
    pollInterval: number = 2000
  ): Promise<MeetingStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getMeetingStatus(meetingId);
          
          if (onStatusUpdate) {
            onStatusUpdate(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Meeting processing failed'));
          } else {
            // Continue polling
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;