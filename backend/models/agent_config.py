# backend/models/agent_config.py

import uuid
from sqlalchemy import (
    Column, String, Float, Integer, 
    Boolean, JSON, DateTime, ForeignKey, Text
)
from sqlalchemy.dialects.sqlite import TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db import Base


class AgentConfig(Base):
    __tablename__ = "agent_configs"

    # ── Primary Key ──────────────────────────────
    id = Column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    tenant_id = Column(
        String(36),
        ForeignKey("tenants.id"),
        nullable=False,
        unique=True,
        index=True
    )
    
    tenant = relationship("Tenant", back_populates="agent_config")

    # ── Identity ─────────────────────────────────
    agent_name = Column(String(100), default="Receptionist")
    template = Column(String(50), default="clinic_receptionist")
    first_message = Column(Text, nullable=False, default="")
    system_prompt = Column(Text, nullable=False, default="")

    # ── STT (Speech to Text) ─────────────────────
    stt_provider = Column(String(30), default="sarvam")
    stt_model = Column(String(50), default="saaras:v3")
    stt_language = Column(String(10), default="hi-IN")

    # ── TTS (Text to Speech) ─────────────────────
    tts_provider = Column(String(30), default="sarvam")
    tts_model = Column(String(50), default="bulbul:v3")
    tts_voice = Column(String(50), default="meera")
    tts_language = Column(String(10), default="hi-IN")
    tts_pitch = Column(Float, default=0.0)
    tts_pace = Column(Float, default=1.0)
    tts_loudness = Column(Float, default=1.0)

    # ── LLM ──────────────────────────────────────
    llm_provider = Column(String(30), default="gemini")
    llm_model = Column(String(100), default="gemini-2.0-flash")
    llm_temperature = Column(Float, default=0.3)
    max_response_tokens = Column(Integer, default=150)

    # ── Call Behavior ─────────────────────────────
    silence_timeout_seconds = Column(Integer, default=10)
    max_duration_seconds = Column(Integer, default=300)
    end_call_phrases = Column(
        JSON, 
        default=lambda: [
            "dhanyavaad", "thank you", "bye", 
            "goodbye", "shukriya", "alvida"
        ]
    )
    end_call_message = Column(
        Text, 
        default="Thank you for calling. Goodbye!"
    )

    # ── Capabilities ──────────────────────────────
    can_book_appointments = Column(Boolean, default=True)
    can_cancel_appointments = Column(Boolean, default=True)
    can_check_availability = Column(Boolean, default=True)
    can_transfer_emergency = Column(Boolean, default=True)
    emergency_transfer_number = Column(String(20), nullable=True)
    auto_detect_language = Column(Boolean, default=True)

    # ── Telephony ─────────────────────────────────
    telephony_option = Column(String(20), default="skip")
    country_code = Column(String(5), default="IN")
    ai_number = Column(String(25), nullable=True)
    sip_provider = Column(String(30), nullable=True)
    sip_account_sid = Column(String(100), nullable=True)
    sip_auth_token = Column(String(100), nullable=True)
    sip_domain = Column(String(200), nullable=True)
    existing_clinic_number = Column(String(25), nullable=True)

    # ── LiveKit ───────────────────────────────────
    livekit_url = Column(String(200), nullable=True)
    livekit_api_key = Column(String(100), nullable=True)
    livekit_api_secret = Column(String(100), nullable=True)

    # ── Clinic Knowledge ──────────────────────────
    clinic_info = Column(JSON, default=lambda: {
        "working_hours": "9:00 AM - 7:00 PM, Mon-Sat",
        "address": "",
        "emergency_number": "112",
        "services": [],
        "faqs": []
    })

    # ── Recording & Webhooks ──────────────────────
    record_calls = Column(Boolean, default=False)
    webhook_url = Column(String(500), nullable=True)

    # ── Embed / Widget ─────────────────────────────
    embed_enabled = Column(Boolean, default=True)
    embed_allowed_domains = Column(JSON, default=list)
    embed_position = Column(String(20), default="bottom-right")
    embed_theme = Column(String(10), default="dark")
    embed_button_text = Column(String(50), default="Talk to Receptionist")
    embed_primary_color = Column(String(7), default="#3ECF8E")
    embed_show_branding = Column(Boolean, default=True)

    # ── Status & Meta ─────────────────────────────
    status = Column(String(20), default="CONFIGURED")
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True), 
        onupdate=func.now()
    )

