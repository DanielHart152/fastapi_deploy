import torch
from pyannote.audio import Pipeline
from pyannote.core import Segment
import os

class SpeakerDiarizer:
    def __init__(self, auth_token=None, device=None):
        """Initialize speaker diarization pipeline"""
        self.auth_token = auth_token
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.pipeline = None
        self._load_pipeline()
    
    def _load_pipeline(self):
        """Load pyannote speaker diarization pipeline"""
        try:
            if self.auth_token:
                self.pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1",
                    use_auth_token=self.auth_token
                )
            else:
                # Try without token first
                self.pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1"
                )
            # Configure pipeline for longer segments
            if hasattr(self.pipeline, '_segmentation'):
                # Less sensitive segmentation for longer segments
                self.pipeline._segmentation.min_duration_on = 1.0
                self.pipeline._segmentation.min_duration_off = 0.5
            
            self.pipeline.to(torch.device(self.device))
            print(f"Diarization pipeline loaded on: {self.device}")
        except Exception as e:
            print(f"Error loading pipeline: {e}")
            print("You may need a HuggingFace token for pyannote models")
            raise
    
    def diarize(self, audio_file):
        """Perform speaker diarization on audio file"""
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"Audio file not found: {audio_file}")
        
        # Run diarization
        diarization = self.pipeline(audio_file)
        
        # Convert to segments list
        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                'start': turn.start,
                'end': turn.end,
                'speaker': speaker,
                'duration': turn.end - turn.start
            })
        
        return segments
    
    def get_speaker_segments(self, audio_file, min_duration=2.0):
        """Get speaker segments with minimum duration filter"""
        segments = self.diarize(audio_file)
        
        # Merge adjacent segments from same speaker
        merged_segments = self._merge_adjacent_segments(segments, max_gap=0.5)
        
        # Filter by minimum duration
        filtered_segments = [
            seg for seg in merged_segments
            if seg['duration'] >= min_duration
        ]
        
        print(f"Raw segments: {len(segments)}, Merged: {len(merged_segments)}, Filtered: {len(filtered_segments)}")
        return filtered_segments
    
    def _merge_adjacent_segments(self, segments, max_gap=1.0):
        """Merge adjacent segments from the same speaker"""
        if not segments:
            return segments
        
        # Sort by start time
        segments = sorted(segments, key=lambda x: x['start'])
        
        merged = []
        current = segments[0].copy()
        
        for next_seg in segments[1:]:
            gap = next_seg['start'] - current['end']
            same_speaker = current['speaker'] == next_seg['speaker']
            
            # Merge if same speaker and small gap
            if same_speaker and gap <= max_gap:
                current['end'] = next_seg['end']
                current['duration'] = current['end'] - current['start']
            else:
                merged.append(current)
                current = next_seg.copy()
        
        merged.append(current)
        return merged
    
    def print_segments(self, segments):
        """Print speaker segments in readable format"""
        print(f"\nFound {len(segments)} speaker segments:")
        print("-" * 50)
        
        for i, seg in enumerate(segments, 1):
            start_time = f"{seg['start']:.2f}s"
            end_time = f"{seg['end']:.2f}s"
            duration = f"{seg['duration']:.2f}s"
            
            print(f"{i:2d}. {seg['speaker']} | {start_time} - {end_time} ({duration})")

if __name__ == "__main__":
    # Test the diarizer
    diarizer = SpeakerDiarizer()
    
    audio_file = input("Enter path to processed WAV file: ")
    if os.path.exists(audio_file):
        try:
            segments = diarizer.get_speaker_segments(audio_file)
            diarizer.print_segments(segments)
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("File not found")