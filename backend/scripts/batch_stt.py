import os
import time
from pathlib import Path
from dotenv import load_dotenv
from sarvamai import SarvamAI

# Load from .env if running from CLI
load_dotenv()

def run_batch_stt(audio_paths: list[str]):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        print("Error: SARVAM_API_KEY not found in .env file.")
        return

    print("Initializing SarvamAI Client...")
    client = SarvamAI(api_subscription_key=api_key)

    print(f"Creating Batch Job for {len(audio_paths)} file(s)...")
    try:
        # Create batch job — model="saaras:v3", mode="transcribe"
        job = client.speech_to_text_job.create_job(
            model="saaras:v3",
            mode="transcribe",
            language_code="unknown",
            with_diarization=True,
            num_speakers=2
        )

        # Upload and process files
        print("Uploading files...")
        job.upload_files(file_paths=audio_paths)
        
        print("Starting STT Job...")
        job.start()

        # Wait for completion
        print("Waiting for job completion (this may take a while depending on file size)...")
        job.wait_until_complete()

        # Check file-level results
        file_results = job.get_file_results()

        print("\n--- Transcription Results ---")
        print(f"Successful: {len(file_results.get('successful', []))}")
        for f in file_results.get('successful', []):
            print(f"  ✓ {f.get('file_name', 'Unknown')}")

        print(f"\nFailed: {len(file_results.get('failed', []))}")
        for f in file_results.get('failed', []):
            print(f"  ✗ {f.get('file_name', 'Unknown')}: {f.get('error_message', 'Unknown Error')}")

        # Download outputs for successful files
        if file_results.get('successful'):
            output_dir = Path("./output")
            output_dir.mkdir(exist_ok=True)
            job.download_outputs(output_dir=str(output_dir))
            print(f"\nDownloaded {len(file_results['successful'])} transcript(s) to: {output_dir.absolute()}")

    except Exception as e:
        print(f"Failed to complete batch transcription: {e}")


if __name__ == "__main__":
    import sys
    # Example usage: python batch_stt.py path/to/audio1.mp3 path/to/audio2.wav
    args = sys.argv[1:]
    if not args:
        print("Usage: python batch_stt.py <audio_file_path_1> [audio_file_path_2] ...")
        sys.exit(1)
        
    run_batch_stt(args)
