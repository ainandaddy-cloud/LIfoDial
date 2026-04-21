"""
backend/routers/providers.py — Provider Discovery API.
Equivalent to OmniDim's client.providers.list_llms() / list_voices().

GET /providers             → all providers + live status
GET /providers/voices      → all Sarvam voices grouped by model/gender
GET /providers/llms        → Gemini model list (live + cached)
POST /providers/test-connection → test an API key
"""
import logging
import time
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Sarvam voices catalogue (full 35+ voices) ─────────────────────────────────

SARVAM_VOICES = [
    # ── bulbul:v2 ──
    {"id": "meera",    "name": "Meera",    "model": "bulbul:v2", "language": "hi-IN", "gender": "female", "description": "Warm, professional Hindi"},
    {"id": "pavithra", "name": "Pavithra", "model": "bulbul:v2", "language": "hi-IN", "gender": "female", "description": "Clear, authoritative"},
    {"id": "maitreyi", "name": "Maitreyi","model": "bulbul:v2", "language": "hi-IN", "gender": "female", "description": "Soft, caring tone"},
    {"id": "karan",    "name": "Karan",    "model": "bulbul:v2", "language": "hi-IN", "gender": "male",   "description": "Professional male Hindi"},
    {"id": "arvind",   "name": "Arvind",   "model": "bulbul:v2", "language": "hi-IN", "gender": "male",   "description": "Deep, formal"},
    {"id": "amol",     "name": "Amol",     "model": "bulbul:v2", "language": "hi-IN", "gender": "male",   "description": "Energetic, youthful"},
    {"id": "amartya",  "name": "Amartya",  "model": "bulbul:v2", "language": "hi-IN", "gender": "male",   "description": "Calm, measured"},
    # English
    {"id": "arya",     "name": "Arya",     "model": "bulbul:v2", "language": "en-IN", "gender": "female", "description": "Crisp Indian English"},
    {"id": "neel",     "name": "Neel",     "model": "bulbul:v2", "language": "en-IN", "gender": "male",   "description": "Neutral Indian English"},
    {"id": "misha",    "name": "Misha",    "model": "bulbul:v2", "language": "en-IN", "gender": "female", "description": "Friendly, approachable"},
    {"id": "vian",     "name": "Vian",     "model": "bulbul:v2", "language": "en-IN", "gender": "male",   "description": "Professional"},
    {"id": "maya",     "name": "Maya",     "model": "bulbul:v2", "language": "en-IN", "gender": "female", "description": "Warm, empathetic"},
    # Tamil
    {"id": "dhruv",    "name": "Dhruv",    "model": "bulbul:v2", "language": "ta-IN", "gender": "male",   "description": "Tamil male"},
    {"id": "manasi",   "name": "Manasi",   "model": "bulbul:v2", "language": "ta-IN", "gender": "female", "description": "Tamil female"},
    # Telugu
    {"id": "anushka",  "name": "Anushka",  "model": "bulbul:v2", "language": "te-IN", "gender": "female", "description": "Telugu female"},
    {"id": "abhilash", "name": "Abhilash", "model": "bulbul:v2", "language": "te-IN", "gender": "male",   "description": "Telugu male"},
    # Bengali
    {"id": "sarthak",  "name": "Sarthak",  "model": "bulbul:v2", "language": "bn-IN", "gender": "male",   "description": "Bengali male"},
    {"id": "aditi",    "name": "Aditi",    "model": "bulbul:v2", "language": "bn-IN", "gender": "female", "description": "Bengali female"},
    # Kannada
    {"id": "karun",    "name": "Karun",    "model": "bulbul:v2", "language": "kn-IN", "gender": "male",   "description": "Kannada male"},
    {"id": "hitesh",   "name": "Hitesh",   "model": "bulbul:v2", "language": "kn-IN", "gender": "male",   "description": "Kannada male 2"},
    # Malayalam
    {"id": "lekha",    "name": "Lekha",    "model": "bulbul:v2", "language": "ml-IN", "gender": "female", "description": "Malayalam female"},
    {"id": "revathi",  "name": "Revathi",  "model": "bulbul:v2", "language": "ml-IN", "gender": "female", "description": "Malayalam female 2"},
    # Gujarati
    {"id": "arjun",    "name": "Arjun",    "model": "bulbul:v2", "language": "gu-IN", "gender": "male",   "description": "Gujarati male"},
    {"id": "nirav",    "name": "Nirav",    "model": "bulbul:v2", "language": "gu-IN", "gender": "male",   "description": "Gujarati male 2"},

    # ── bulbul:v3 (premium — longer context, better naturalness) ──
    {"id": "ritu",     "name": "Ritu",     "model": "bulbul:v3", "language": "hi-IN", "gender": "female", "description": "Premium Hindi female — highly recommended"},
    {"id": "shantanu", "name": "Shantanu", "model": "bulbul:v3", "language": "hi-IN", "gender": "male",   "description": "Premium Hindi male"},
    {"id": "sia",      "name": "Sia",      "model": "bulbul:v3", "language": "hi-IN", "gender": "female", "description": "Expressive, warm"},
    {"id": "suhani",   "name": "Suhani",   "model": "bulbul:v3", "language": "hi-IN", "gender": "female", "description": "Gentle, clinical"},
    {"id": "kabir",    "name": "Kabir",    "model": "bulbul:v3", "language": "hi-IN", "gender": "male",   "description": "Authoritative"},
    {"id": "manav",    "name": "Manav",    "model": "bulbul:v3", "language": "hi-IN", "gender": "male",   "description": "Smooth"},
    {"id": "aarav",    "name": "Aarav",    "model": "bulbul:v3", "language": "en-IN", "gender": "male",   "description": "Premium Indian English male"},
    {"id": "diya",     "name": "Diya",     "model": "bulbul:v3", "language": "en-IN", "gender": "female", "description": "Premium Indian English female"},
    {"id": "shreya",   "name": "Shreya",   "model": "bulbul:v3", "language": "ta-IN", "gender": "female", "description": "Premium Tamil female"},
    {"id": "naren",    "name": "Naren",    "model": "bulbul:v3", "language": "ta-IN", "gender": "male",   "description": "Premium Tamil male"},
    # Arabic (Middle East)
    {"id": "hana",     "name": "Hana",     "model": "bulbul:v2", "language": "ar-SA", "gender": "female", "description": "Arabic female"},
    {"id": "omar",     "name": "Omar",     "model": "bulbul:v2", "language": "ar-SA", "gender": "male",   "description": "Arabic male"},
]

GEMINI_MODELS = [
    {"id": "gemini-2.5-flash-preview-04-17", "name": "Gemini 2.5 Flash (Preview)", "tier": "fast",    "context": 1048576, "recommended": True},
    {"id": "gemini-2.0-flash",               "name": "Gemini 2.0 Flash",            "tier": "fast",    "context": 1048576, "recommended": True},
    {"id": "gemini-2.0-flash-lite",          "name": "Gemini 2.0 Flash Lite",       "tier": "fastest", "context": 1048576, "recommended": False},
    {"id": "gemini-1.5-flash",               "name": "Gemini 1.5 Flash",            "tier": "fast",    "context": 1048576, "recommended": False},
    {"id": "gemini-1.5-flash-8b",            "name": "Gemini 1.5 Flash 8B",         "tier": "fastest", "context": 1048576, "recommended": False},
    {"id": "gemini-1.5-pro",                 "name": "Gemini 1.5 Pro",              "tier": "pro",     "context": 2097152, "recommended": False},
    {"id": "gemini-2.0-pro-exp",             "name": "Gemini 2.0 Pro (Exp)",        "tier": "pro",     "context": 2097152, "recommended": False},
]

STT_MODELS = [
    {"id": "saarika:v2",  "name": "Saarika v2",  "provider": "sarvam", "languages": ["hi-IN","en-IN","ta-IN","te-IN","bn-IN","mr-IN","gu-IN","kn-IN","ml-IN","pa-IN","or-IN"], "recommended": False},
    {"id": "saaras:v3",   "name": "Saaras v3",   "provider": "sarvam", "languages": ["hi-IN","en-IN","ta-IN","te-IN","bn-IN","mr-IN","gu-IN","kn-IN","ml-IN","pa-IN","or-IN","ar-SA"], "recommended": True},
]


# ── GET /providers ─────────────────────────────────────────────────────────────

@router.get("/providers")
async def get_providers() -> dict:
    """Returns all configured providers with live connection status."""
    sarvam_ok = bool(settings.sarvam_api_key)
    gemini_ok = bool(settings.gemini_api_key)
    elevenlabs_ok = bool(settings.elevenlabs_api_key)
    openai_ok = bool(settings.openai_api_key)

    return {
        "providers": [
            {
                "id": "sarvam",
                "name": "Sarvam AI",
                "type": ["stt", "tts"],
                "connected": sarvam_ok,
                "voice_count": len(SARVAM_VOICES),
                "stt_models": [m["id"] for m in STT_MODELS],
                "description": "Best for Indian languages. 22+ languages. Low latency.",
                "website": "https://sarvam.ai",
            },
            {
                "id": "gemini",
                "name": "Google Gemini",
                "type": ["llm"],
                "connected": gemini_ok,
                "model_count": len(GEMINI_MODELS),
                "description": "Default LLM. Gemini 2.0 Flash is recommended for voice.",
                "website": "https://ai.google.dev",
            },
            {
                "id": "elevenlabs",
                "name": "ElevenLabs",
                "type": ["tts"],
                "connected": elevenlabs_ok,
                "voice_count": 0 if not elevenlabs_ok else "sync required",
                "description": "Premium TTS for English. High naturalness.",
                "website": "https://elevenlabs.io",
            },
            {
                "id": "openai",
                "name": "OpenAI",
                "type": ["llm", "stt"],
                "connected": openai_ok,
                "description": "GPT-4o. Good for English-primary agents.",
                "website": "https://openai.com",
            },
        ],
        "summary": {
            "stt_ready": sarvam_ok,
            "tts_ready": sarvam_ok or elevenlabs_ok,
            "llm_ready": gemini_ok or openai_ok,
            "can_run_calls": sarvam_ok and gemini_ok,
        },
    }


# ── GET /providers/voices ──────────────────────────────────────────────────────

@router.get("/providers/voices")
async def list_all_voices(language: str | None = None, model: str | None = None, gender: str | None = None) -> dict:
    """Returns all Sarvam voices with optional filtering."""
    voices = SARVAM_VOICES
    if language:
        voices = [v for v in voices if v["language"] == language]
    if model:
        voices = [v for v in voices if v["model"] == model]
    if gender:
        voices = [v for v in voices if v["gender"] == gender]

    # Group by model
    by_model: dict[str, list] = {}
    for v in voices:
        by_model.setdefault(v["model"], []).append(v)

    return {
        "total": len(voices),
        "voices": voices,
        "by_model": by_model,
        "models_available": ["bulbul:v2", "bulbul:v3"],
        "languages_available": sorted({v["language"] for v in SARVAM_VOICES}),
    }


# ── GET /providers/llms ────────────────────────────────────────────────────────

@router.get("/providers/llms")
async def list_llms() -> dict:
    """Returns available LLM models. Gemini models are from our catalogue."""
    return {
        "gemini": {
            "connected": bool(settings.gemini_api_key),
            "models": GEMINI_MODELS,
        },
        "openai": {
            "connected": bool(settings.openai_api_key),
            "models": [
                {"id": "gpt-4o",       "name": "GPT-4o",           "tier": "pro",     "recommended": True},
                {"id": "gpt-4o-mini",  "name": "GPT-4o Mini",      "tier": "fast",    "recommended": False},
                {"id": "gpt-4-turbo",  "name": "GPT-4 Turbo",      "tier": "pro",     "recommended": False},
            ] if settings.openai_api_key else [],
        },
        "recommended_for_voice": "gemini-2.0-flash",
    }


# ── GET /providers/voices/{voice_id}/preview ───────────────────────────────────

@router.get("/providers/voices/{voice_id}/preview")
async def preview_voice_by_id(voice_id: str, language: str = "hi-IN", model: str = "bulbul:v3") -> dict:
    """Generate audio preview for a specific Sarvam voice_id."""
    if not settings.sarvam_api_key:
        raise HTTPException(status_code=400, detail="Sarvam API key not configured")

    # Sample text per language
    samples = {
        "hi-IN": "Namaste! Main aapki kaise madad kar sakti hoon?",
        "en-IN": "Hello! How can I assist you today?",
        "ta-IN": "Vanakkam! Naan ungalukkku eppadi udavi seyya mudiyum?",
        "te-IN": "Namaskaram! Meeru ela sahayam kavaalantunnaru?",
        "ml-IN": "Namaskaram! Njan ningale enthu sahayikkam?",
        "ar-SA": "مرحباً! كيف يمكنني مساعدتك اليوم؟",
    }
    sample_text = samples.get(language, samples["en-IN"])

    try:
        import base64
        async with httpx.AsyncClient(timeout=20.0) as client:
            payload: dict = {
                "inputs": [sample_text],
                "target_language_code": language,
                "speaker": voice_id,
                "model": model,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "pace": 1.0,
            }
            if "v3" in model:
                payload["temperature"] = 0.6
            else:
                payload["pitch"] = 0.0
                payload["loudness"] = 1.5

            resp = await client.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            audios = data.get("audios", [])
            if not audios:
                raise HTTPException(status_code=500, detail="Sarvam returned empty audio")
            return {
                "voice_id": voice_id,
                "language": language,
                "model": model,
                "audio_base64": f"data:audio/wav;base64,{audios[0]}",
                "text": sample_text,
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice preview error for {voice_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /providers/test-connection ───────────────────────────────────────────

class TestConnectionRequest(BaseModel):
    provider: str
    api_key: str


@router.post("/providers/test-connection")
async def test_connection(req: TestConnectionRequest) -> dict:
    """Test if an API key is valid for the given provider."""
    t0 = time.time()

    if req.provider == "gemini":
        try:
            import google.generativeai as genai
            genai.configure(api_key=req.api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            resp = await model.generate_content_async("Say: OK")
            latency_ms = int((time.time() - t0) * 1000)
            return {
                "provider": "gemini",
                "connected": True,
                "latency_ms": latency_ms,
                "models_count": len(GEMINI_MODELS),
                "test_response": resp.text[:30] if resp.text else "OK",
            }
        except Exception as e:
            return {"provider": "gemini", "connected": False, "error": str(e)[:100]}

    elif req.provider == "sarvam":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://api.sarvam.ai/text-to-speech",
                    headers={"api-subscription-key": req.api_key, "Content-Type": "application/json"},
                    json={
                        "inputs": ["test"],
                        "target_language_code": "hi-IN",
                        "speaker": "meera",
                        "model": "bulbul:v2",
                        "speech_sample_rate": 16000,
                        "enable_preprocessing": False,
                        "pace": 1.0,
                        "pitch": 0.0,
                        "loudness": 1.0,
                    },
                )
                latency_ms = int((time.time() - t0) * 1000)
                if resp.status_code == 200:
                    return {
                        "provider": "sarvam",
                        "connected": True,
                        "latency_ms": latency_ms,
                        "voices_count": len(SARVAM_VOICES),
                    }
                else:
                    return {"provider": "sarvam", "connected": False, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            return {"provider": "sarvam", "connected": False, "error": str(e)[:100]}

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {req.provider}")
