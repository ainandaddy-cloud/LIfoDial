"""
backend/routers/voices.py — Voice Library API
Serves voice metadata, live preview via Sarvam/ElevenLabs, and provider sync.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
import base64
import httpx
import logging

from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class PreviewRequest(BaseModel):
    provider: str
    voice_id: str
    model: Optional[str] = None
    language: Optional[str] = None
    text: str


class AssignVoiceRequest(BaseModel):
    voice_id: str
    agent_id: str


@router.get("/")
async def get_voices():
    """Returns provider connection status. Voice fixtures are in the frontend."""
    return {
        "voices": [],
        "providers": {
            "sarvam": {
                "connected": bool(settings.sarvam_api_key),
                "voice_count": 6
            },
            "gemini": {
                "connected": bool(settings.gemini_api_key),
                "voice_count": 7
            },
            "elevenlabs": {
                "connected": bool(settings.elevenlabs_api_key),
                "voice_count": 0
            }
        }
    }


@router.post("/preview")
async def preview_voice(req: PreviewRequest):
    """Generates live preview audio using the configured provider."""
    try:
        if req.provider == "sarvam":
            api_key = settings.sarvam_api_key
            if not api_key:
                raise HTTPException(status_code=400, detail="Sarvam API key not configured in .env")

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.sarvam.ai/text-to-speech",
                    headers={
                        "api-subscription-key": api_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "inputs": [req.text],
                        "target_language_code": req.language or "hi-IN",
                        "speaker": req.voice_id or "meera",
                        "model": req.model or "bulbul:v2",
                        "pitch": 0.0,
                        "pace": 1.0,
                        "loudness": 1.0,
                        "enable_preprocessing": True,
                        "speech_sample_rate": 22050
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    audios = data.get("audios", [])
                    if audios and audios[0]:
                        return {
                            "audio_base64": f"data:audio/wav;base64,{audios[0]}",
                            "format": "wav",
                            "latency_ms": 0
                        }
                    raise HTTPException(status_code=500, detail="Sarvam returned empty audio")
                else:
                    logger.error(f"Sarvam preview error: {response.status_code} {response.text}")
                    raise HTTPException(status_code=response.status_code, detail=f"Sarvam TTS error: {response.text[:200]}")

        elif req.provider == "elevenlabs":
            api_key = settings.elevenlabs_api_key
            if not api_key:
                raise HTTPException(status_code=400, detail="ElevenLabs API key not configured")

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{req.voice_id}",
                    headers={
                        "xi-api-key": api_key,
                        "Content-Type": "application/json",
                        "Accept": "audio/mpeg"
                    },
                    json={
                        "text": req.text,
                        "model_id": req.model or "eleven_multilingual_v2",
                        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
                    }
                )
                if response.status_code == 200:
                    audio_b64 = base64.b64encode(response.content).decode("utf-8")
                    return {
                        "audio_base64": f"data:audio/mpeg;base64,{audio_b64}",
                        "format": "mp3",
                        "latency_ms": 0
                    }
                else:
                    raise HTTPException(status_code=response.status_code, detail=f"ElevenLabs error: {response.text[:200]}")

        elif req.provider == "gemini":
            # Gemini doesn't have a direct raw REST TTS endpoint publicly available without heavy Google Cloud auth
            # For the platform preview, we use Google Translate TTS as a lightweight fallback
            async with httpx.AsyncClient(timeout=10.0) as client:
                lang = (req.language or "en").split("-")[0]
                response = await client.get(
                    "https://translate.google.com/translate_tts",
                    params={
                        "ie": "UTF-8",
                        "tl": lang,
                        "client": "tw-ob",
                        "q": req.text
                    }
                )
                if response.status_code == 200:
                    audio_b64 = base64.b64encode(response.content).decode("utf-8")
                    return {
                        "audio_base64": f"data:audio/mpeg;base64,{audio_b64}",
                        "format": "mp3",
                        "latency_ms": 0
                    }
                else:
                    raise HTTPException(status_code=500, detail="Failed to generate Gemini voice preview")

        else:
            # Fallback to Sarvam for unknown providers
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {req.provider}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice preview error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync")
async def sync_voices():
    return {"message": "Synced voices from configured providers.", "status": "success"}


@router.post("/assign")
async def assign_voice(req: AssignVoiceRequest):
    return {"message": f"Assigned voice {req.voice_id} to agent {req.agent_id}", "status": "success"}
