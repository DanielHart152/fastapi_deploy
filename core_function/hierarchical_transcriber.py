import whisper
import ffmpeg
import tempfile
import os
import re
from typing import List, Dict, Any

class Word:
    def __init__(self, text: str, start_timestamp: float, end_timestamp: float, confidence: float = 1.0):
        self.text = text
        self.startTimestamp = start_timestamp
        self.endTimestamp = end_timestamp
        self.confidence = confidence

class Utterance:
    def __init__(self, text: str, start_timestamp: float, end_timestamp: float, confidence: float = 1.0):
        self.text = text
        self.startTimestamp = start_timestamp
        self.endTimestamp = end_timestamp
        self.confidence = confidence
        self.words: List[Word] = []
        self.drift = 0.0

class SpeakerSegment:
    def __init__(self, speaker_tag_id: str, start_timestamp: float, end_timestamp: float):
        self.speakerTagId = speaker_tag_id
        self.startTimestamp = start_timestamp
        self.endTimestamp = end_timestamp
        self.utterances: List[Utterance] = []

class HierarchicalTranscriber:
    def __init__(self, model_size="base", device=None):
        import torch
        self.model_size = model_size
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = whisper.load_model(model_size, device=self.device)
        print(f"Hierarchical transcriber loaded on: {self.device}")
    
    def extract_segment(self, audio_file, start_time, end_time):
        """Extract audio segment using ffmpeg"""
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
    
    def split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def transcribe_segment_hierarchical(self, audio_file, start_time, end_time, speaker_id):
        """Transcribe segment with hierarchical structure"""
        segment_file = self.extract_segment(audio_file, start_time, end_time)
        
        try:
            # Get word-level timestamps
            result = self.model.transcribe(segment_file, word_timestamps=True)
            
            # Create speaker segment
            speaker_segment = SpeakerSegment(speaker_id, start_time, end_time)
            
            if 'segments' in result:
                for whisper_segment in result['segments']:
                    # Split segment text into sentences
                    sentences = self.split_into_sentences(whisper_segment['text'])
                    
                    if not sentences:
                        continue
                    
                    # Create utterances from sentences
                    words = whisper_segment.get('words', [])
                    word_idx = 0
                    
                    for sentence in sentences:
                        if not sentence:
                            continue
                            
                        # Find words for this sentence
                        sentence_words = []
                        sentence_start = None
                        sentence_end = None
                        
                        # Simple word matching for sentence boundaries
                        sentence_word_count = len(sentence.split())
                        for _ in range(min(sentence_word_count, len(words) - word_idx)):
                            if word_idx < len(words):
                                word_data = words[word_idx]
                                word_start = start_time + word_data['start']
                                word_end = start_time + word_data['end']
                                
                                if sentence_start is None:
                                    sentence_start = word_start
                                sentence_end = word_end
                                
                                # Word confidence is already 0-1 from Whisper
                                word_confidence = word_data.get('probability', 1.0)
                                
                                word_obj = Word(
                                    word_data['word'].strip(),
                                    word_start,
                                    word_end,
                                    word_confidence
                                )
                                sentence_words.append(word_obj)
                                word_idx += 1
                        
                        # Create utterance
                        if sentence_start is not None and sentence_end is not None:
                            # Convert log probability to 0-1 confidence
                            raw_confidence = whisper_segment.get('avg_logprob', -1.0)
                            confidence = max(0.0, min(1.0, (raw_confidence + 3.0) / 3.0))  # Scale -3 to 0 → 0 to 1
                            
                            utterance = Utterance(
                                sentence,
                                sentence_start,
                                sentence_end,
                                confidence
                            )
                            utterance.words = sentence_words
                            speaker_segment.utterances.append(utterance)
            
            return speaker_segment
            
        finally:
            if os.path.exists(segment_file):
                os.remove(segment_file)
    
    def transcribe_segments_hierarchical(self, audio_file, segments, gap_threshold=5.0):
        """Transcribe all segments with hierarchical structure"""
        speaker_segments = []
        
        # Group segments by speaker and detect gaps
        current_speaker_segments = self.group_by_speaker_with_gaps(segments, gap_threshold)
        
        for i, speaker_group in enumerate(current_speaker_segments, 1):
            print(f"Transcribing speaker group {i}/{len(current_speaker_segments)}...")
            
            try:
                speaker_segment = self.transcribe_segment_hierarchical(
                    audio_file,
                    speaker_group['start'],
                    speaker_group['end'],
                    speaker_group['speaker']
                )
                speaker_segments.append(speaker_segment)
                
            except Exception as e:
                print(f"Error transcribing speaker group {i}: {e}")
        
        return speaker_segments
    
    def group_by_speaker_with_gaps(self, segments, gap_threshold=5.0):
        """Group segments by speaker, splitting on gaps > threshold"""
        if not segments:
            return []
        
        grouped = []
        current_group = {
            'speaker': segments[0]['speaker'],
            'start': segments[0]['start'],
            'end': segments[0]['end'],
            'segments': [segments[0]]
        }
        
        for segment in segments[1:]:
            gap = segment['start'] - current_group['end']
            same_speaker = segment['speaker'] == current_group['speaker']
            
            if same_speaker and gap <= gap_threshold:
                # Continue current group
                current_group['end'] = segment['end']
                current_group['segments'].append(segment)
            else:
                # Start new group
                grouped.append(current_group)
                current_group = {
                    'speaker': segment['speaker'],
                    'start': segment['start'],
                    'end': segment['end'],
                    'segments': [segment]
                }
        
        grouped.append(current_group)
        return grouped
    
    def to_dict(self, speaker_segments):
        """Convert hierarchical structure to dictionary"""
        return {
            'meeting': {
                'speakerSegments': [
                    {
                        'speakerTagId': seg.speakerTagId,
                        'startTimestamp': seg.startTimestamp,
                        'endTimestamp': seg.endTimestamp,
                        'utterances': [
                            {
                                'text': utt.text,
                                'startTimestamp': utt.startTimestamp,
                                'endTimestamp': utt.endTimestamp,
                                'confidence': utt.confidence,
                                'drift': utt.drift,
                                'words': [
                                    {
                                        'text': word.text,
                                        'startTimestamp': word.startTimestamp,
                                        'endTimestamp': word.endTimestamp,
                                        'confidence': word.confidence
                                    } for word in utt.words
                                ]
                            } for utt in seg.utterances
                        ]
                    } for seg in speaker_segments
                ]
            }
        }
    
    def format_simple_transcript(self, speaker_segments):
        """Format as simple transcript for compatibility"""
        transcript = []
        
        for seg in speaker_segments:
            for utt in seg.utterances:
                start_min = int(utt.startTimestamp // 60)
                start_sec = int(utt.startTimestamp % 60)
                end_min = int(utt.endTimestamp // 60)
                end_sec = int(utt.endTimestamp % 60)
                
                timestamp = f"[{start_min:02d}:{start_sec:02d} - {end_min:02d}:{end_sec:02d}]"
                line = f"{timestamp} {seg.speakerTagId}: {utt.text}"
                transcript.append(line)
        
        return "\n".join(transcript)