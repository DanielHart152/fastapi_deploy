# Open Meeting Backend

Backend service for processing pre-recorded meetings using AI transcription and analysis.

## Features

- File upload handling (audio/video)
- YouTube URL processing
- Speaker diarization using core functions
- Hierarchical transcription with word-level timestamps
- AI-powered meeting analysis
- Real-time processing status updates

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/open_meeting
HUGGINGFACE_TOKEN=your_token_here
WHISPER_MODEL=base
DEVICE=cpu
```

3. Run database migrations:
```bash
psql -d open_meeting -f migrations.sql
```

4. Start the server:
```bash
python start.py
```

## API Endpoints

### File Upload
- `POST /api/meetings/{id}/upload` - Upload audio/video file

### Processing
- `POST /api/meetings/{id}/process` - Start meeting processing
- `GET /api/meetings/{id}/status` - Get processing status
- `GET /api/meetings/{id}/results` - Get processing results

### Health Check
- `GET /health` - Service health status

## Integration with Core Functions

The backend integrates with the core_function pipeline:
- `audio_processor.py` - Audio preprocessing
- `enhanced_diarizer.py` - Speaker diarization
- `hierarchical_transcriber.py` - Transcription with hierarchy
- `main.py` - Main processing pipeline

## Output Format

The backend returns hierarchical meeting data in the format:
```json
{
  "meeting": {
    "speakerSegments": [
      {
        "speakerTagId": "Speaker_1",
        "startTimestamp": 0.0,
        "endTimestamp": 10.5,
        "utterances": [
          {
            "text": "Hello everyone.",
            "startTimestamp": 0.0,
            "endTimestamp": 2.5,
            "confidence": 0.95,
            "words": [...]
          }
        ]
      }
    ]
  }
}
```