import torch
import numpy as np
from pyannote.audio import Model
from pyannote.audio.pipelines.utils import get_devices
import pickle
import os
from pathlib import Path
import tempfile
import ffmpeg
from sklearn.cluster import DBSCAN
from collections import defaultdict

class SpeakerRecognition:
    def __init__(self, voiceprint_db_path="voiceprints.pkl", auth_token=None, device=None):
        """Initialize speaker recognition with voiceprint database"""
        self.voiceprint_db_path = voiceprint_db_path
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.voiceprints = self._load_voiceprints()
        self.unknown_embeddings = []  # Store unknown speaker embeddings for clustering
        # Try to load models in order of preference
        models_to_try = [
            # "./embedding",  # Local pyannote embedding model
            "pyannote/embedding",
            "pyannote/wespeaker-voxceleb-resnet34-LM",
        ]
        
        self.model = None
        for model_path in models_to_try:
            try:
                if model_path.startswith("./"):
                    # Load local model
                    self.model = Model.from_pretrained(model_path)
                    print(f"- Loaded local model: {model_path}")
                else:
                    # Load from HuggingFace
                    if auth_token:
                        self.model = Model.from_pretrained(model_path, use_auth_token=auth_token)
                    else:
                        self.model = Model.from_pretrained(model_path)
                    print(f" Loaded HF model: {model_path}")
                break
            except Exception as e:
                print(f" Failed to load {model_path}: {e}")
                continue
        
        if self.model is None:
            raise RuntimeError("Could not load any speaker recognition model")
        if self.model:
            self.model.to(torch.device(self.device))
            print(f"Speaker recognition model loaded on: {self.device}")
        
    def _load_voiceprints(self):
        """Load existing voiceprint database"""
        if os.path.exists(self.voiceprint_db_path):
            with open(self.voiceprint_db_path, 'rb') as f:
                return pickle.load(f)
        return {}
    
    def _save_voiceprints(self):
        """Save voiceprint database"""
        with open(self.voiceprint_db_path, 'wb') as f:
            pickle.dump(self.voiceprints, f)
    
    def extract_embedding(self, audio_file, start_time=None, end_time=None):
        """Extract speaker embedding from audio segment"""
        from pyannote.audio import Inference
        
        inference = Inference(self.model, device=torch.device(self.device))
        
        if start_time is not None and end_time is not None:
            # Extract segment first
            temp_dir = tempfile.mkdtemp()
            segment_file = os.path.join(temp_dir, "temp_segment.wav")
            
            try:
                (
                    ffmpeg
                    .input(audio_file, ss=start_time, t=end_time-start_time)
                    .output(segment_file, acodec='pcm_s16le', ac=1, ar='16000')
                    .overwrite_output()
                    .run(quiet=True)
                )
                embedding = inference(segment_file)
                os.remove(segment_file)
                return np.mean(embedding.data, axis=0)
            except Exception as e:
                if os.path.exists(segment_file):
                    os.remove(segment_file)
                raise e
        else:
            # Use full audio file
            embedding = inference(audio_file)
            return np.mean(embedding.data, axis=0)
    
    def enroll_speaker(self, audio_file, speaker_name, start_time=None, end_time=None):
        """Enroll a new speaker with their voiceprint"""
        try:
            embedding = self.extract_embedding(audio_file, start_time, end_time)
            
            if speaker_name in self.voiceprints:
                # Update existing speaker with multiple embeddings
                if isinstance(self.voiceprints[speaker_name], list):
                    self.voiceprints[speaker_name].append(embedding)
                else:
                    # Convert single embedding to list
                    self.voiceprints[speaker_name] = [self.voiceprints[speaker_name], embedding]
            else:
                # New speaker
                self.voiceprints[speaker_name] = [embedding]
            
            self._save_voiceprints()
            print(f"OK Enrolled speaker: {speaker_name} (samples: {len(self.voiceprints[speaker_name])})")
            return True
        except Exception as e:
            print(f"Error enrolling speaker {speaker_name}: {e}")
            return False
    
    def cosine_similarity(self, embedding1, embedding2):
        """Calculate cosine similarity between embeddings"""
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        return dot_product / (norm1 * norm2)
    
    def identify_speaker(self, audio_file, start_time, end_time, threshold=0.7):
        """Identify speaker from audio segment"""
        if not self.voiceprints:
            return None, 0.0
        
        try:
            segment_embedding = self.extract_embedding(audio_file, start_time, end_time)
            
            best_match = None
            best_score = 0.0
            
            for speaker_name, embeddings in self.voiceprints.items():
                # Handle both single embedding and list of embeddings
                if isinstance(embeddings, list):
                    # Use average similarity across all embeddings
                    similarities = [self.cosine_similarity(segment_embedding, emb) for emb in embeddings]
                    similarity = np.mean(similarities)
                else:
                    similarity = self.cosine_similarity(segment_embedding, embeddings)
                
                if similarity > best_score:
                    best_score = similarity
                    best_match = speaker_name
            
            if best_score >= threshold:
                # Update speaker profile with new sample
                self._update_speaker_profile(best_match, segment_embedding)
                return best_match, best_score
            else:
                # Store unknown embedding for clustering
                self.unknown_embeddings.append({
                    'embedding': segment_embedding,
                    'timestamp': f"{start_time:.2f}-{end_time:.2f}",
                    'file': audio_file
                })
                return None, best_score
                
        except Exception as e:
            print(f"Error identifying speaker: {e}")
            return None, 0.0
    
    def get_enrolled_speakers(self):
        """Get list of enrolled speakers"""
        return list(self.voiceprints.keys())
    
    def _update_speaker_profile(self, speaker_name, new_embedding, max_samples=5):
        """Update speaker profile with new embedding"""
        if speaker_name in self.voiceprints:
            if isinstance(self.voiceprints[speaker_name], list):
                self.voiceprints[speaker_name].append(new_embedding)
                # Keep only recent samples
                if len(self.voiceprints[speaker_name]) > max_samples:
                    self.voiceprints[speaker_name] = self.voiceprints[speaker_name][-max_samples:]
            else:
                self.voiceprints[speaker_name] = [self.voiceprints[speaker_name], new_embedding]
            self._save_voiceprints()
    
    def cluster_unknown_speakers(self, eps=0.3, min_samples=2):
        """Cluster unknown speakers using DBSCAN"""
        if len(self.unknown_embeddings) < min_samples:
            return []
        
        # Extract embeddings for clustering
        embeddings = np.array([item['embedding'] for item in self.unknown_embeddings])
        
        # Use DBSCAN clustering
        clustering = DBSCAN(eps=eps, min_samples=min_samples, metric='cosine')
        labels = clustering.fit_predict(embeddings)
        
        # Group by clusters
        clusters = defaultdict(list)
        for i, label in enumerate(labels):
            if label != -1:  # Ignore noise points
                clusters[label].append(self.unknown_embeddings[i])
        
        # Create suggested speaker groups
        suggested_speakers = []
        for cluster_id, items in clusters.items():
            if len(items) >= min_samples:
                suggested_speakers.append({
                    'cluster_id': cluster_id,
                    'count': len(items),
                    'embeddings': [item['embedding'] for item in items],
                    'timestamps': [item['timestamp'] for item in items],
                    'files': [item['file'] for item in items]
                })
        
        return suggested_speakers
    
    def create_speaker_from_cluster(self, cluster_data, speaker_name):
        """Create a new speaker from clustered unknown embeddings"""
        self.voiceprints[speaker_name] = cluster_data['embeddings']
        self._save_voiceprints()
        
        # Remove clustered embeddings from unknown list
        cluster_embeddings = set(id(emb) for emb in cluster_data['embeddings'])
        self.unknown_embeddings = [
            item for item in self.unknown_embeddings 
            if id(item['embedding']) not in cluster_embeddings
        ]
        
        print(f"OK Created speaker '{speaker_name}' from {len(cluster_data['embeddings'])} samples")
        return True
    
    def get_clustering_suggestions(self):
        """Get speaker clustering suggestions"""
        clusters = self.cluster_unknown_speakers()
        if clusters:
            print(f"\nFound {len(clusters)} potential new speakers:")
            for i, cluster in enumerate(clusters):
                print(f"  Cluster {i+1}: {cluster['count']} samples")
        return clusters
    
    def remove_speaker(self, speaker_name):
        """Remove speaker from database"""
        if speaker_name in self.voiceprints:
            del self.voiceprints[speaker_name]
            self._save_voiceprints()
            print(f"OK Removed speaker: {speaker_name}")
            return True
        return False

if __name__ == "__main__":
    # Test speaker recognition
    recognizer = SpeakerRecognition()
    
    print("Speaker Recognition Test")
    print("Enrolled speakers:", recognizer.get_enrolled_speakers())
    
    # Example enrollment
    audio_file = input("Enter audio file for enrollment (or press Enter to skip): ")
    if audio_file and os.path.exists(audio_file):
        speaker_name = input("Enter speaker name: ")
        recognizer.enroll_speaker(audio_file, speaker_name)