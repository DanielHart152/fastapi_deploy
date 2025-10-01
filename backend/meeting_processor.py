import os
import sys
import asyncio
import json
import tempfile
import yt_dlp
from pathlib import Path
from typing import Dict, Any, Optional

# Add core_function to path
core_function_path = str(Path(__file__).parent.parent / "core_function")
sys.path.insert(0, core_function_path)

# Import from core_function with alias to avoid circular import
import importlib.util
spec = importlib.util.spec_from_file_location("core_main", core_function_path + "/main.py")
core_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core_main)

class MeetingProcessor:
    def __init__(self):
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.whisper_model = os.getenv("WHISPER_MODEL", "base")
        self.device = os.getenv("DEVICE", "cpu")
        
    async def download_youtube(self, url: str, meeting_id: str) -> str:
        """Download YouTube video and return file path"""
        try:
            output_dir = Path("uploads")
            output_dir.mkdir(exist_ok=True)
            
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': str(output_dir / f'{meeting_id}_%(title)s.%(ext)s'),
                'extractaudio': True,
                'audioformat': 'mp3',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                
                # Find the actual downloaded file
                for ext in ['.mp3', '.m4a', '.webm', '.mp4']:
                    potential_file = filename.replace('.webm', ext).replace('.mp4', ext)
                    if os.path.exists(potential_file):
                        return potential_file
                
                return filename
                
        except Exception as e:
            raise Exception(f"YouTube download failed: {str(e)}")
    
    async def process_meeting(self, input_file: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Process meeting file using core functions"""
        try:
            print(f"Processing file: {input_file}")
            
            # Run the core processing pipeline
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                self._process_sync,
                input_file,
                settings
            )
            
            return result
            
        except Exception as e:
            raise Exception(f"Meeting processing failed: {str(e)}")
    
    def _process_sync(self, input_file: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Synchronous processing wrapper"""
        try:
            # Extract settings
            ai_features = settings.get("aiFeatures", {})
            enable_transcription = ai_features.get("transcription", True)
            enable_diarization = ai_features.get("speakerDiarization", True)
            enable_summary = ai_features.get("aiSummary", True)
            enable_topics = ai_features.get("topicExtraction", True)
            
            # Process using core functions
            processed_file, segments, speaker_segments, hierarchical_data, transcript = core_main.process_audio_file(
                input_file,
                hf_token=self.hf_token,
                whisper_model=self.whisper_model,
                device=self.device
            )
            
            # Prepare results
            result = {
                "transcript_data": transcript if enable_transcription else None,
                "hierarchical_data": hierarchical_data,
                "speakers_data": self._extract_speakers_data(segments) if enable_diarization else None,
                "ai_summary": self._generate_summary(transcript) if enable_summary else None,
                "topics_data": self._extract_topics(transcript) if enable_topics else None,
                "processing_info": {
                    "processed_file": processed_file,
                    "total_segments": len(segments),
                    "total_speaker_segments": len(speaker_segments),
                    "settings_used": settings
                }
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Sync processing failed: {str(e)}")
    
    def _extract_speakers_data(self, segments) -> Dict[str, Any]:
        """Extract speaker information from segments"""
        speakers = {}
        
        for segment in segments:
            speaker_id = segment.get("speaker", "Unknown")
            if speaker_id not in speakers:
                speakers[speaker_id] = {
                    "id": speaker_id,
                    "name": segment.get("identified_speaker", speaker_id),
                    "total_duration": 0,
                    "segment_count": 0,
                    "confidence": segment.get("confidence", 0.0)
                }
            
            duration = segment.get("end", 0) - segment.get("start", 0)
            speakers[speaker_id]["total_duration"] += duration
            speakers[speaker_id]["segment_count"] += 1
        
        return {
            "speakers": list(speakers.values()),
            "total_speakers": len(speakers)
        }
    
    def _generate_summary(self, transcript: str) -> Dict[str, Any]:
        """Generate AI summary using OpenAI"""
        # Convert transcript to segments for OpenAI analysis
        segments = self._parse_transcript_to_segments(transcript)
        
        return {
            "summary": "AI summary will be generated by frontend OpenAI integration",
            "segments": segments,
            "key_points": [],
            "action_items": [],
            "decisions": [],
            "total_segments": len(segments)
        }
    
    def _extract_topics(self, transcript: str) -> Dict[str, Any]:
        """Extract topics from transcript - will be enhanced by OpenAI"""
        segments = self._parse_transcript_to_segments(transcript)
        
        return {
            "topics": [],  # Will be populated by OpenAI analysis
            "segments": segments,
            "total_topics": 0,
            "openai_ready": True
        }
    
    def _parse_transcript_to_segments(self, transcript: str) -> list:
        """Parse transcript text into segments for OpenAI analysis"""
        segments = []
        lines = transcript.strip().split('\n')
        
        for line in lines:
            if line.strip() and '] ' in line:
                # Parse format: [00:00 - 00:05] SPEAKER_00: text
                try:
                    timestamp_part, content = line.split('] ', 1)
                    timestamp_part = timestamp_part.strip('[')
                    start_time, end_time = timestamp_part.split(' - ')
                    
                    if ': ' in content:
                        speaker, text = content.split(': ', 1)
                        segments.append({
                            "speaker": speaker.strip(),
                            "text": text.strip(),
                            "timestamp": timestamp_part,
                            "start": start_time,
                            "end": end_time
                        })
                except:
                    continue
        
        return segments