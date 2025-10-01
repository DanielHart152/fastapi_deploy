from main import process_audio_file

# Example usage of the complete pipeline
def run_example():
    # Input file (any supported format)
    input_file = "sample_audio.mp3"  # Replace with your file
    
    # Optional: HuggingFace token for pyannote models
    hf_token = None  # or "your_hf_token_here"
    
    # Whisper model size (tiny, base, small, medium, large)
    whisper_model = "base"  # Good balance of speed and accuracy
    
    try:
        processed_file, segments, transcribed_segments, transcript = process_audio_file(
            input_file, hf_token, whisper_model
        )
        
        print("- Complete pipeline finished successfully!")
        return transcript
        
    except Exception as e:
        print(f"Pipeline error: {e}")
        return None

if __name__ == "__main__":
    transcript = run_example()