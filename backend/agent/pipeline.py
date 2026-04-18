import asyncio
import logging
from backend.agent.providers.gemini_provider import GeminiSTT, GeminiTTS
from backend.agent.providers.sarvam_provider import SarvamTTS

logger = logging.getLogger(__name__)

stt = GeminiSTT()
gemini = None # MOCK, if we need actual gemini.generate_response replace it
tts = SarvamTTS(
    model="bulbul:v2",
    voice="meera", 
    language="hi-IN"
)

async def handle_voice_turn(
    audio_bytes: bytes, 
    session: dict,
    audio_source  # LiveKit audio source
) -> None:
    """
    Handle one conversation turn using explicit TTS provider
    """
    try:
        # Step 1: STT
        logger.info("Transcribing audio...")
        transcript = await stt.transcribe(audio_bytes, lang="en-IN")
        if not transcript:
            return
            
        logger.info(f"Transcript: {transcript}")

        # Step 2: Play minimal backchannel 
        # (skipping for simplicity now)
        logger.info("Playing backchannel (mocked)")

        # Step 3: Generating LLM response...
        # Mock generate_response if gemini provider doesn't exist
        logger.info("Generating response...")
        response_text = f"Generating response for {transcript}"
        logger.info(f"LLM Response: {response_text}")

        # Step 4: SARVAM TTS (Explicit call)
        logger.info(f"Submitting to Sarvam TTS (lang: {session.get('detected_lang', 'en-IN')})...")
        import rtc
        
        # In a real setup, we'd use stream_synthesis or chunked
        # Below is a mock for fallback
        fallback = await tts.synthesize(
            response_text,
            lang=session.get("detected_lang", "en-IN")
        )
        
        logger.info(f"Received {len(fallback)} bytes from Sarvam.")
        
        # Convert to AudioFrame
        frame = rtc.AudioFrame(
            data=fallback,
            sample_rate=16000,
            num_channels=1,
            samples_per_channel=len(fallback)//2
        )
        await audio_source.capture_frame(frame)
        logger.info("✅ Audio framed sent to LiveKit")

    except Exception as e:
        logger.error(f"Error in pipeline: {e}", exc_info=True)
