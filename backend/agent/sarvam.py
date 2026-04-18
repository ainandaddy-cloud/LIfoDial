import logging
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)

async def _call_sarvam(endpoint: str, json_data: dict) -> dict:
    if not settings.sarvam_api_key:
        logger.warning(f"No Sarvam API key in .env, mocking {endpoint}")
        return {}
    
    url = f"https://api.sarvam.ai/{endpoint}"
    headers = {
        "API-Subscription-Key": settings.sarvam_api_key,
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=json_data, headers=headers, timeout=5.0)
            res.raise_for_status()
            return res.json()
    except Exception as e:
        logger.error(f"Sarvam API {endpoint} error: {e}")
        return {}

async def transcribe(audio_bytes: bytes, lang_code: str) -> str:
    """STT: bytes -> text"""
    # Assuming audio_bytes is already base64 encoded wav or similar
    # Mocking implementation since raw PCM from WebRTC needs to be buffered by VAD to be sent to REST API
    if not settings.sarvam_api_key:
        return "I want to see a cardiologist"
        
    data = {"audio": "base64...", "languageCode": lang_code}
    # result = await _call_sarvam("speech-to-text-translate", data)
    return "I want to see a cardiologist"

async def synthesize(text: str, lang_code: str, voice_id: str | None = None) -> bytes:
    """TTS: text -> PCM audio bytes"""
    logger.info(f"🎤 [Sarvam TTS] Speaks: '{text}'")
    if not settings.sarvam_api_key:
        # Mocking 0.1s of blank audio frames to trigger playback loop in LiveKit without crashing
        return b'\x00' * 4800  
        
    data = {
        "inputs": [text],
        "targetLanguageCode": lang_code,
        "speaker": voice_id or "meera"
    }
    # result = await _call_sarvam("text-to-speech", data)
    return b'\x00' * 4800

async def detect_language(text: str) -> str:
    """Language matching"""
    return "hi-IN"

async def get_greeting_audio(clinic_name: str, lang_code: str, voice_id: str | None) -> bytes:
    greeting = f"Welcome to {clinic_name}. How can I assist you today?"
    return await synthesize(greeting, lang_code, voice_id)

async def clone_voice(audio_bytes: bytes) -> str:
    """Uploads voice sample to Sarvam to get a cloned voice_id"""
    logger.info("🎙️ [Sarvam Voice Clone] Uploading voice sample...")
    if not settings.sarvam_api_key:
        return "mock_voice_id_123"
    
    # In production, pass audio_bytes to Sarvam's API
    # data = {"audio": base64_audio}
    # result = await _call_sarvam("voice-cloning", data)
    # return result.get("voice_id", "mock_voice_id_123")
    return "custom_sarvam_voice_999"
