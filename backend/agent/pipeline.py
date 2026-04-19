import asyncio
import logging
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import silero
import google.generativeai as genai
import httpx
import base64

logger = logging.getLogger(__name__)

class LifodialAgent(Agent):
    """
    Streaming voice pipeline for Lifodial.
    Uses Sarvam for STT + TTS, Gemini Flash for LLM.
    Target: < 800ms voice-to-voice latency.
    """
    
    def __init__(self, agent_config: dict, tenant: dict):
        self.agent_config = agent_config
        self.tenant = tenant
        self.session_history = []
        self.detected_lang = agent_config.get(
            "tts_language", "hi-IN"
        )
        
        # Build system prompt with clinic info
        self.system_prompt = self._build_system_prompt()
        
        super().__init__(instructions=self.system_prompt)
    
    def _build_system_prompt(self) -> str:
        doctors = self.tenant.get("doctors", [])
        doctors_text = "\n".join([
            f"- {d['name']} ({d['specialization']})"
            for d in doctors
        ]) or "- General Physician available"
        
        return f"""You are {self.agent_config.get('agent_name', 'Receptionist')}, 
the AI voice receptionist for {self.tenant.get('clinic_name', 'the clinic')}.

CRITICAL RULES FOR VOICE:
- Maximum 2 short sentences per response
- This is a PHONE CALL — be concise and natural
- Never say you are an AI unless directly asked
- Ask only ONE question at a time
- Speak numbers as words (eleven AM not 11 AM)
- Auto-detect patient language and respond in it

AVAILABLE DOCTORS:
{doctors_text}

CLINIC HOURS: {self.tenant.get('working_hours', '9 AM - 7 PM, Mon-Sat')}

BOOKING FLOW:
1. Get patient name
2. Get required specialty
3. Offer available slot
4. Confirm booking
5. Give appointment ID

EMERGENCY: On keywords (heart attack, accident, emergency, 
unconscious, bleeding) → transfer immediately.

FALLBACK: "Kya aap dobara bol sakte hain?" (or in patient's language)"""
    
    async def on_user_turn_completed(
        self, turn_ctx, new_message
    ):
        """Called when patient finishes speaking."""
        text = new_message.text_content
        if not text:
            return
        
        # Add to history
        self.session_history.append({
            "role": "user", "text": text
        })
        
        logger.info(f"Patient: {text[:50]} | Lang: {self.detected_lang}")


async def entrypoint(ctx):
    """
    LiveKit agent entrypoint.
    Sets up streaming pipeline with Sarvam + Gemini.
    """
    import json
    from backend.config import settings
    from livekit import api as livekit_api
    
    # Parse room metadata
    metadata = {}
    try:
        metadata = json.loads(ctx.room.metadata or '{}')
    except:
        pass
    
    tenant_id = metadata.get("tenant_id")
    agent_id = metadata.get("agent_id")
    
    logger.info(f"Agent starting for tenant={tenant_id} agent={agent_id}")
    
    # Load config from DB or use metadata defaults
    agent_config = metadata
    tenant = {
        "clinic_name": metadata.get("clinic_name", "Clinic"),
        "working_hours": "9 AM - 7 PM, Mon-Sat",
        "doctors": []
    }
    
    # Try to load from DB
    try:
        from backend.db import AsyncSessionLocal
        from backend.models.agent_config import AgentConfig
        from backend.models.tenant import Tenant
        from backend.models.doctor import Doctor
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as db:
            if agent_id:
                result = await db.execute(
                    select(AgentConfig).where(
                        AgentConfig.id == agent_id
                    )
                )
                config = result.scalar_one_or_none()
                if config:
                    agent_config = {
                        "agent_name": config.agent_name,
                        "first_message": config.first_message,
                        "system_prompt": config.system_prompt,
                        "tts_voice": config.tts_voice,
                        "tts_language": config.tts_language,
                        "tts_model": config.tts_model,
                        "stt_model": config.stt_model,
                        "llm_model": config.llm_model,
                        "llm_temperature": config.llm_temperature,
                    }
            
            if tenant_id:
                t_result = await db.execute(
                    select(Tenant).where(Tenant.id == tenant_id)
                )
                t = t_result.scalar_one_or_none()
                if t:
                    tenant["clinic_name"] = t.clinic_name
                
                d_result = await db.execute(
                    select(Doctor).where(
                        Doctor.tenant_id == tenant_id
                    )
                )
                doctors = d_result.scalars().all()
                tenant["doctors"] = [
                    {"name": d.name, "specialization": d.specialization}
                    for d in doctors
                ]
    except Exception as e:
        logger.warning(f"Could not load from DB: {e}. Using metadata.")
    
    # Configure Gemini API
    genai.configure(api_key=settings.gemini_api_key)
    
    # Create agent session with LiveKit
    await ctx.connect()
    
    session = AgentSession(
        # Sarvam STT — best for Indian languages
        stt=SarvamSTTPlugin(
            api_key=settings.sarvam_api_key,
            model=agent_config.get("stt_model", "saarika:v2"),
            language=agent_config.get("tts_language", "hi-IN"),
        ),
        # Gemini LLM — streaming
        llm=GeminiLLMPlugin(
            api_key=settings.gemini_api_key,
            model=agent_config.get("llm_model", "gemini-2.0-flash"),
            temperature=float(
                agent_config.get("llm_temperature", 0.3) if agent_config.get("llm_temperature") is not None else 0.3
            ),
        ),
        # Sarvam TTS — streaming
        tts=SarvamTTSPlugin(
            api_key=settings.sarvam_api_key,
            model=agent_config.get("tts_model", "bulbul:v3"),
            voice=agent_config.get("tts_voice", "ritu"),
            language=agent_config.get("tts_language", "hi-IN"),
        ),
        # Silero VAD — detects when patient stops speaking
        vad=silero.VAD.load(
            min_silence_duration=0.3,  # 300ms silence = turn end
            prefix_padding_duration=0.2,
            activation_threshold=0.5,
        ),
        turn_detection="vad",
    )
    
    agent = LifodialAgent(agent_config, tenant)
    
    # Start session
    session.start(
        agent=agent,
        room=ctx.room,
        room_input_options=RoomInputOptions(),
    )
    
    # Speak first message
    first_msg = agent_config.get(
        "first_message",
        f"Namaste! {tenant['clinic_name']} mein aapka swagat hai. "
        f"Main kaise madad kar sakti hoon?"
    )
    
    await session.say(first_msg, allow_interruptions=True)


# ── Sarvam STT Plugin ──────────────────────────────────────────
class SarvamSTTPlugin:
    """
    Sarvam STT wrapper for LiveKit agents.
    Uses streaming for low latency.
    """
    def __init__(self, api_key: str, model: str, language: str):
        self.api_key = api_key
        self.model = model
        self.language = language
    
    async def transcribe(self, audio: bytes) -> str:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.sarvam.ai/speech-to-text",
                headers={
                    "api-subscription-key": self.api_key
                },
                files={"file": ("audio.wav", audio, "audio/wav")},
                data={
                    "language_code": self.language,
                    "model": self.model,
                    "with_timestamps": "false",
                    "with_disfluencies": "false",
                }
            )
            response.raise_for_status()
            return response.json().get("transcript", "")


# ── Sarvam TTS Plugin ──────────────────────────────────────────
class SarvamTTSPlugin:
    """
    Sarvam TTS wrapper for LiveKit agents.
    Handles chunking for low latency.
    """
    def __init__(self, api_key: str, model: str, 
                 voice: str, language: str):
        self.api_key = api_key
        self.model = model
        self.voice = voice
        self.language = language
    
    async def synthesize(self, text: str) -> bytes:
        if not text.strip():
            return b""
        
        # v3 supports 2500 chars, v2 supports 500
        max_chars = 2500 if "v3" in self.model else 500
        
        if len(text) <= max_chars:
            return await self._call_tts(text)
        
        # Chunk and concatenate
        chunks = self._chunk_text(text, max_chars - 50)
        parts = []
        for chunk in chunks:
            audio = await self._call_tts(chunk)
            if audio:
                parts.append(audio)
        return b"".join(parts)
    
    async def _call_tts(self, text: str) -> bytes:
        payload = {
            "inputs": [text],
            "target_language_code": self.language,
            "speaker": self.voice,
            "model": self.model,
            "speech_sample_rate": 16000,
            "enable_preprocessing": True,
            "pace": 1.0,
        }
        
        # v3 uses temperature, v2 uses pitch/loudness
        if "v3" in self.model:
            payload["temperature"] = 0.6
        else:
            payload["pitch"] = 0.0
            payload["loudness"] = 1.5
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={
                    "api-subscription-key": self.api_key,
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(
                    f"Sarvam TTS error {response.status_code}: "
                    f"{response.text[:100]}"
                )
                return b""
            
            data = response.json()
            audios = data.get("audios", [])
            if not audios:
                return b""
            
            return base64.b64decode(audios[0])
    
    def _chunk_text(self, text: str, max_len: int) -> list:
        import re
        sentences = re.split(r'(?<=[।.!?])\s+', text)
        chunks, current = [], ""
        for s in sentences:
            if len(current) + len(s) < max_len:
                current += s + " "
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = s + " "
        if current.strip():
            chunks.append(current.strip())
        return chunks


# ── Gemini LLM Plugin ──────────────────────────────────────────
class GeminiLLMPlugin:
    """
    Gemini LLM wrapper with streaming support.
    Switches model dynamically based on agent config.
    """
    def __init__(self, api_key: str, model: str, temperature: float):
        genai.configure(api_key=api_key)
        self.model_id = model
        self.temperature = temperature
        self._model = genai.GenerativeModel(
            model,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 150,
                "candidate_count": 1,
            }
        )
    
    async def generate(self, prompt: str, history: list) -> str:
        chat = self._model.start_chat(history=[
            {
                "role": msg["role"],
                "parts": [msg["text"]]
            }
            for msg in history[-6:]  # last 6 turns
        ])
        
        response = await chat.send_message_async(prompt)
        return response.text.strip()
    
    async def generate_streaming(self, prompt: str, history: list):
        """Yields text chunks as they are generated."""
        chat = self._model.start_chat(history=[
            {"role": m["role"], "parts": [m["text"]]}
            for m in history[-6:]
        ])
        
        async for chunk in await chat.send_message_async(
            prompt, stream=True
        ):
            if chunk.text:
                yield chunk.text


if __name__ == "__main__":
    from livekit.agents import cli, WorkerOptions
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
