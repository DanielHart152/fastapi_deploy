import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", message=".*TensorFloat-32.*")
warnings.filterwarnings("ignore", message=".*std\(\).*degrees of freedom.*")

# Enable TF32 for better GPU performance
import torch
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

from audio_processor import AudioProcessor
from enhanced_diarizer import EnhancedSpeakerDiarizer

# from Unused.transcriber import WhisperTranscriber
# from greek_transcriber import GreekTranscriber

from hierarchical_transcriber import HierarchicalTranscriber
import json
import os

def process_audio_file(input_file, hf_token=None, whisper_model="base", device=None):
    """Complete pipeline: audio processing + speaker diarization + transcription"""
    
    # Step 1: Process audio file
    print(" < --- Step 1: Processing audio file... --- > ")
    processor = AudioProcessor()
    
    if not processor.is_supported(input_file):
        raise ValueError(f"Unsupported file format")
    
    # Get original file info
    info = processor.get_audio_info(input_file)
    print(f"Original: {info['duration']:.1f}s, {info['sample_rate']}Hz, {info['channels']} channels")
    
    # Convert to standard format
    processed_file = processor.prepare_for_diarization(input_file)
    print(f"Processed file: {processed_file}")
    
    # Step 2: Enhanced speaker diarization with identification
    print("\n < --- Step 2: Performing speaker diarization and identification... --- > ")
    diarizer = EnhancedSpeakerDiarizer(auth_token=hf_token, device=device)
    segments = diarizer.diarize_and_identify(processed_file, identification_threshold=0.7, min_segment_duration=3.0)
    
    # Display results
    diarizer.print_identified_segments(segments)
    
    # Step 3: Hierarchical Transcription
    print("\n < --- Step 3: Creating hierarchical transcription... --- > ")
    hierarchical_transcriber = HierarchicalTranscriber(model_size=whisper_model, device=device)
    speaker_segments = hierarchical_transcriber.transcribe_segments_hierarchical(processed_file, segments)
    
    # Convert to different formats
    hierarchical_data = hierarchical_transcriber.to_dict(speaker_segments)
    transcript = hierarchical_transcriber.format_simple_transcript(speaker_segments)
    
    return processed_file, segments, speaker_segments, hierarchical_data, transcript

if __name__ == "__main__":
    import torch
    input_file = input("Enter path to audio/video file: ")
    hf_token = input("Enter HuggingFace token (optional, press Enter to skip): ").strip() or None
    whisper_model = input("Enter Whisper model size (tiny/base/small/medium/large, default=base): ").strip() or "base"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    if os.path.exists(input_file):
        try:
            processed_file, segments, speaker_segments, hierarchical_data, transcript = process_audio_file(
                input_file, hf_token, whisper_model, device
            )
            
            print(f"\n- Processing complete!")
            print(f"- Found {len(segments)} speaker segments")
            print(f"- Created {len(speaker_segments)} hierarchical speaker segments")
            
            # Display final transcript
            print("\n" + "="*60)
            print("FINAL TRANSCRIPT")
            print("="*60)
            print(transcript)
            
            # Save transcript and hierarchical data
            output_file = input_file + "_transcript.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(transcript)
            print(f"\n- Transcript saved to: {output_file}")
            
            # Save hierarchical JSON
            json_file = input_file + "_hierarchical.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(hierarchical_data, f, indent=2, ensure_ascii=False)
            print(f"- Hierarchical data saved to: {json_file}")
            
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("File not found")