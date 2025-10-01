# Speaker Diarization Project

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install FFmpeg:
   - Download from https://ffmpeg.org/download.html
   - Add to system PATH

## Usage

### Step 1: Audio Processing
```python
from audio_processor import AudioProcessor

processor = AudioProcessor()
processed_file = processor.prepare_for_diarization("input_file.mp3")
```

## Supported Formats
- Audio: MP3, WAV, M4A, FLAC, AAC, OGG, WMA
- Video: MP4, AVI, MKV, MOV, WEBM (extracts audio)

## Strategy
1. **File Processing** → Convert to 16kHz mono WAV
2. **Speaker Diarization** → Identify speaker segments  
3. **Transcription** → Whisper transcription per segment
4. **Output** → Timestamped transcript with speaker labels