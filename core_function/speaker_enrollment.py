from speaker_recognition import SpeakerRecognition
from audio_processor import AudioProcessor
import os

def enroll_speakers_interactive():
    """Interactive speaker enrollment tool"""
    hf_token = input("Enter HuggingFace token (required for pyannote models): ").strip()
    if not hf_token:
        print("HuggingFace token is required. Get one at: https://huggingface.co/settings/tokens")
        return
    
    recognizer = SpeakerRecognition("voiceprints.pkl", hf_token)
    processor = AudioProcessor()
    
    print("=== Speaker Enrollment Tool ===")
    print(f"Supported formats: {', '.join(processor.supported_formats)}")
    print(f"Current enrolled speakers: {recognizer.get_enrolled_speakers()}")
    
    while True:
        print("\nOptions:")
        print("1. Enroll new speaker")
        print("2. List enrolled speakers") 
        print("3. Remove speaker")
        print("4. Exit")
        
        choice = input("Choose option (1-4): ").strip()
        
        if choice == "1":
            audio_file = input("Enter audio file path: ").strip()
            if not os.path.exists(audio_file):
                print("File not found!")
                continue
            
            if not processor.is_supported(audio_file):
                print(f"Unsupported format! Supported: {', '.join(processor.supported_formats)}")
                continue
                
            speaker_name = input("Enter speaker name: ").strip()
            if not speaker_name:
                print("Speaker name cannot be empty!")
                continue
            
            # Process file if not WAV
            processed_file = audio_file
            if not audio_file.lower().endswith('.wav'):
                print("Converting to WAV format...")
                try:
                    processed_file = processor.prepare_for_diarization(audio_file)
                    print(f"Converted file: {processed_file}")
                except Exception as e:
                    print(f"Conversion error: {e}")
                    continue
            
            # Optional: specify time segment
            use_segment = input("Use specific time segment? (y/n): ").lower() == 'y'
            start_time = end_time = None
            
            if use_segment:
                try:
                    start_time = float(input("Start time (seconds): "))
                    end_time = float(input("End time (seconds): "))
                except ValueError:
                    print("Invalid time format!")
                    continue
            
            success = recognizer.enroll_speaker(processed_file, speaker_name, start_time, end_time)
            if success:
                print(f" Successfully enrolled {speaker_name}")
            else:
                print(f" Failed to enroll {speaker_name}")
        
        elif choice == "2":
            speakers = recognizer.get_enrolled_speakers()
            if speakers:
                print(f"Enrolled speakers ({len(speakers)}): {', '.join(speakers)}")
            else:
                print("No speakers enrolled yet")
        
        elif choice == "3":
            speakers = recognizer.get_enrolled_speakers()
            if not speakers:
                print("No speakers to remove")
                continue
                
            print(f"Available speakers: {', '.join(speakers)}")
            speaker_name = input("Enter speaker name to remove: ").strip()
            
            if recognizer.remove_speaker(speaker_name):
                print(f" Removed {speaker_name}")
            else:
                print(f" Speaker {speaker_name} not found")
        
        elif choice == "4":
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice!")

if __name__ == "__main__":
    enroll_speakers_interactive()