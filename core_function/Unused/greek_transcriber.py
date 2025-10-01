from transformers import pipeline, Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import librosa

class GreekTranscriber:
    def __init__(self, model_name="jonatasgrosman/wav2vec2-large-xlsr-53-greek"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Greek model: {model_name}")
        
        self.pipe = pipeline(
            "automatic-speech-recognition",
            model=model_name,
            device=0 if self.device == "cuda" else -1
        )
        print(f"Greek transcriber loaded on: {self.device}")
    
    def transcribe_segment(self, audio_file, start_time, end_time):
        """Transcribe Greek audio segment"""
        # Load and extract segment
        audio, sr = librosa.load(audio_file, sr=16000, offset=start_time, duration=end_time-start_time)
        
        # Transcribe
        result = self.pipe(audio)
        return result['text']
    
    def transcribe_segments(self, audio_file, segments):
        """Transcribe all segments in Greek"""
        transcribed_segments = []
        
        for i, segment in enumerate(segments, 1):
            print(f"Transcribing Greek segment {i}/{len(segments)}...")
            
            try:
                text = self.transcribe_segment(audio_file, segment['start'], segment['end'])
                transcribed_segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'speaker': segment['speaker'],
                    'text': text,
                    'duration': segment['duration']
                })
            except Exception as e:
                print(f"Error: {e}")
                transcribed_segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'speaker': segment['speaker'],
                    'text': "[Σφάλμα μεταγραφής]",
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