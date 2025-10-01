import ffmpeg
import os
import tempfile
from pathlib import Path

class AudioProcessor:
    def __init__(self):
        self.supported_formats = [
            '.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', 
            '.wma', '.mp4', '.avi', '.mkv', '.mov', '.webm'
        ]
    
    def is_supported(self, file_path):
        """Check if file format is supported"""
        return Path(file_path).suffix.lower() in self.supported_formats
    
    def convert_to_wav(self, input_path, output_path=None):
        """Convert any audio/video file to WAV format using ffmpeg"""
        if not self.is_supported(input_path):
            raise ValueError(f"Unsupported file format: {Path(input_path).suffix}")
        
        if output_path is None:
            output_path = str(Path(input_path).with_suffix('.wav'))
        
        try:
            (
                ffmpeg
                .input(input_path)
                .output(output_path, acodec='pcm_s16le', ac=1, ar='16000')
                .overwrite_output()
                .run(quiet=True)
            )
            return output_path
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg error: {e}")
    
    def get_audio_info(self, file_path):
        """Get audio file information"""
        try:
            probe = ffmpeg.probe(file_path)
            audio_stream = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
            return {
                'duration': float(probe['format']['duration']),
                'sample_rate': int(audio_stream['sample_rate']),
                'channels': int(audio_stream['channels']),
                'codec': audio_stream['codec_name']
            }
        except Exception as e:
            raise RuntimeError(f"Error getting audio info: {e}")
    
    def prepare_for_diarization(self, input_path):
        """Prepare audio file for speaker diarization (16kHz, mono, WAV)"""
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, 'processed_audio.wav')
        
        return self.convert_to_wav(input_path, output_path)

if __name__ == "__main__":
    processor = AudioProcessor()
    
    # Test with a sample file
    test_file = input("Enter path to audio/video file: ")
    if os.path.exists(test_file):
        try:
            info = processor.get_audio_info(test_file)
            print(f"Audio Info: {info}")
            
            processed_file = processor.prepare_for_diarization(test_file)
            print(f"Processed file saved to: {processed_file}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("File not found")