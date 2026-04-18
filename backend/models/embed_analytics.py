"""backend/models/embed_analytics.py — Embed widget event tracking."""
import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from backend.db import Base


class EmbedEvent(Base):
    __tablename__ = "embed_events"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, index=True)
    agent_id = Column(String(36), nullable=False, index=True)

    event_type = Column(String(30), nullable=False)   # widget_view|open|chat_started|booking_*|closed
    session_id = Column(String(50), nullable=False)
    domain = Column(String(200), nullable=True)
    language = Column(String(10), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
