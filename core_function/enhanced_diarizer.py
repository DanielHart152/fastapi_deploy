from speaker_diarizer import SpeakerDiarizer
from speaker_recognition import SpeakerRecognition

class EnhancedSpeakerDiarizer:
    def __init__(self, auth_token=None, voiceprint_db_path="voiceprints.pkl", device=None):
        """Enhanced diarizer with speaker recognition"""
        self.diarizer = SpeakerDiarizer(auth_token, device)
        self.recognizer = SpeakerRecognition(voiceprint_db_path, auth_token, device)
    
    def merge_short_segments(self, segments, min_duration=3.0, max_gap=1.0):
        """Merge short segments and adjacent segments from same speaker"""
        if not segments:
            return segments
        
        merged = []
        current = segments[0].copy()
        
        for next_seg in segments[1:]:
            gap = next_seg['start'] - current['end']
            same_speaker = current['speaker'] == next_seg['speaker']
            
            # Merge if same speaker and small gap, or if current segment is too short
            if (same_speaker and gap <= max_gap) or current['duration'] < min_duration:
                current['end'] = next_seg['end']
                current['duration'] = current['end'] - current['start']
            else:
                if current['duration'] >= min_duration:
                    merged.append(current)
                current = next_seg.copy()
        
        # Add last segment if long enough
        if current['duration'] >= min_duration:
            merged.append(current)
        
        return merged
    
    def diarize_and_identify(self, audio_file, identification_threshold=0.7, min_segment_duration=3.0):
        """Perform diarization and identify known speakers"""
        # Step 1: Basic diarization
        raw_segments = self.diarizer.get_speaker_segments(audio_file, min_duration = 2)
        
        # Step 2: Merge short segments
        segments = self.merge_short_segments(raw_segments, min_segment_duration)
        
        print(f"Reduced from {len(raw_segments)} to {len(segments)} segments after merging")
        
        # Step 3: Identify known speakers
        identified_segments = []
        unknown_speaker_count = 0
        
        for segment in segments:
            # Try to identify the speaker
            identified_name, confidence = self.recognizer.identify_speaker(
                audio_file, 
                segment['start'], 
                segment['end'], 
                identification_threshold
            )
            
            if identified_name:
                # Known speaker identified
                segment_info = {
                    'start': segment['start'],
                    'end': segment['end'],
                    'duration': segment['duration'],
                    'speaker': identified_name,
                    'original_label': segment['speaker'],
                    'confidence': confidence,
                    'identified': True
                }
            else:
                # Unknown speaker
                segment_info = {
                    'start': segment['start'],
                    'end': segment['end'],
                    'duration': segment['duration'],
                    'speaker': f"SPEAKER_{unknown_speaker_count:02d}",
                    'original_label': segment['speaker'],
                    'confidence': confidence,
                    'identified': False
                }
                unknown_speaker_count += 1
            
            identified_segments.append(segment_info)
        
        # Step 4: Cluster unknown speakers
        clustered_segments = self.cluster_unknown_speakers(identified_segments, audio_file)
        
        return clustered_segments
    
    def cluster_unknown_speakers(self, segments, audio_file, similarity_threshold=0.75):
        """Cluster unknown speakers by voice similarity"""
        unknown_segments = [s for s in segments if not s['identified']]
        
        if len(unknown_segments) < 2:
            return segments
        
        # Extract embeddings for unknown segments
        embeddings = []
        for seg in unknown_segments:
            try:
                embedding = self.recognizer.extract_embedding(audio_file, seg['start'], seg['end'])
                embeddings.append(embedding)
            except:
                embeddings.append(None)
        
        # Simple clustering by similarity
        clusters = []
        used = set()
        
        for i, emb1 in enumerate(embeddings):
            if i in used or emb1 is None:
                continue
                
            cluster = [i]
            used.add(i)
            
            for j, emb2 in enumerate(embeddings[i+1:], i+1):
                if j in used or emb2 is None:
                    continue
                    
                similarity = self.recognizer.cosine_similarity(emb1, emb2)
                if similarity >= similarity_threshold:
                    cluster.append(j)
                    used.add(j)
            
            if len(cluster) >= 2:  # Only keep clusters with multiple segments
                clusters.append(cluster)
        
        # Assign cluster IDs to segments
        cluster_map = {}
        for cluster_id, indices in enumerate(clusters):
            for idx in indices:
                cluster_map[idx] = f"SPEAKER_{cluster_id:02d}"
        
        # Update segment labels
        unknown_idx = 0
        remaining_speaker_id = len(clusters)
        
        for seg in segments:
            if not seg['identified']:
                if unknown_idx in cluster_map:
                    seg['speaker'] = cluster_map[unknown_idx]
                else:
                    seg['speaker'] = f"SPEAKER_{remaining_speaker_id:02d}"
                    remaining_speaker_id += 1
                unknown_idx += 1
        
        print(f"Clustered unknown speakers into {len(clusters)} groups")
        return segments
    
    def print_identified_segments(self, segments):
        """Print segments with identification info"""
        known_speakers = set()
        unknown_speakers = set()
        
        print(f"\nFound {len(segments)} speaker segments:")
        print("-" * 70)
        
        for i, seg in enumerate(segments, 1):
            start_time = f"{seg['start']:.2f}s"
            end_time = f"{seg['end']:.2f}s"
            duration = f"{seg['duration']:.2f}s"
            
            if seg['identified']:
                status = f"OK {seg['confidence']:.2f}"
                known_speakers.add(seg['speaker'])
            else:
                status = f"? {seg['confidence']:.2f}"
                unknown_speakers.add(seg['speaker'])
            
            print(f"{i:2d}. {seg['speaker']:<15} | {start_time} - {end_time} ({duration}) | {status}")
        
        print("-" * 70)
        print(f"Known speakers: {len(known_speakers)} | Unknown speakers: {len(unknown_speakers)}")
        if known_speakers:
            print(f"Identified: {', '.join(known_speakers)}")
        if unknown_speakers:
            print(f"Unknown: {', '.join(unknown_speakers)}")
    
    def enroll_speaker_from_segment(self, audio_file, segment, speaker_name):
        """Enroll a speaker using a specific segment"""
        return self.recognizer.enroll_speaker(
            audio_file, 
            speaker_name, 
            segment['start'], 
            segment['end']
        )
    
    def get_enrolled_speakers(self):
        """Get list of enrolled speakers"""
        return self.recognizer.get_enrolled_speakers()

if __name__ == "__main__":
    # Test enhanced diarizer
    diarizer = EnhancedSpeakerDiarizer()
    
    audio_file = input("Enter path to audio file: ")
    if os.path.exists(audio_file):
        try:
            segments = diarizer.diarize_and_identify(audio_file)
            diarizer.print_identified_segments(segments)
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("File not found")