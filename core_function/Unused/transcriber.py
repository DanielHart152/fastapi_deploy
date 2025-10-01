import whisper
import ffmpeg
import tempfile
import os
from pathlib import Path

class WhisperTranscriber:
    def __init__(self, model_size="base", device=None):
        """Initialize Whisper transcriber"""
        import torch
        self.model_size = model_size
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = whisper.load_model(model_size, device=self.device)
        print(f"Whisper model loaded on: {self.device}")
    
    def extract_segment(self, audio_file, start_time, end_time, output_path=None):
        """Extract audio segment using ffmpeg"""
        if output_path is None:
            temp_dir = tempfile.mkdtemp()
            output_path = os.path.join(temp_dir, f"segment_{start_time}_{end_time}.wav")
        
        try:
            (
                ffmpeg
                .input(audio_file, ss=start_time, t=end_time-start_time)
                .output(output_path, acodec='pcm_s16le', ac=1, ar='16000')
                .overwrite_output()
                .run(quiet=True)
            )
            return output_path
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg segment extraction error: {e}")
    
    def transcribe_segment(self, audio_file, start_time, end_time):
        """Transcribe a specific audio segment"""
        # Extract segment
        segment_file = self.extract_segment(audio_file, start_time, end_time)
        
        try:
            # Transcribe segment
            # result = self.model.transcribe(segment_file)
            
            # < ------------------ ------------------------ >
            
            result = self.model.transcribe(segment_file, language="el")
            
            
            return result['text'].strip()
        finally:
            # Clean up temporary file
            if os.path.exists(segment_file):
                os.remove(segment_file)
    
    def transcribe_segments(self, audio_file, segments):
        """Transcribe all speaker segments"""
        transcribed_segments = []
        
        for i, segment in enumerate(segments, 1):
            print(f"Transcribing segment {i}/{len(segments)} ({segment['speaker']})...")
            
            try:
                text = self.transcribe_segment(
                    audio_file, 
                    segment['start'], 
                    segment['end']
                )
                
                transcribed_segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'speaker': segment['speaker'],
                    'text': text,
                    'duration': segment['duration']
                })
                
            except Exception as e:
                print(f"Error transcribing segment {i}: {e}")
                transcribed_segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'speaker': segment['speaker'],
                    'text': "[Transcription Error]",
                    'duration': segment['duration']
                })
        
        return transcribed_segments
    
    def format_transcript(self, transcribed_segments):
        """Format transcript with timestamps and speakers"""
        transcript = []
        
        for segment in transcribed_segments:
            start_min = int(segment['start'] // 60)
            start_sec = int(segment['start'] % 60)
            end_min = int(segment['end'] // 60)
            end_sec = int(segment['end'] % 60)
            
            timestamp = f"[{start_min:02d}:{start_sec:02d} - {end_min:02d}:{end_sec:02d}]"
            line = f"{timestamp} {segment['speaker']}: {segment['text']}"
            transcript.append(line)
        
        return "\n".join(transcript)

if __name__ == "__main__":
    # Test transcriber
    transcriber = WhisperTranscriber()
    
    audio_file = input("Enter path to processed WAV file: ")
    if os.path.exists(audio_file):
        # Test with a single segment
        start = float(input("Enter start time (seconds): "))
        end = float(input("Enter end time (seconds): "))
        
        try:
            text = transcriber.transcribe_segment(audio_file, start, end)
            print(f"\nTranscription: {text}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("File not found")