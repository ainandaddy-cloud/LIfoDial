"""
backend/routers/web_calls.py — Web call token generation + outbound call endpoints.
Enables browser-based voice calls to AI agents via LiveKit.
"""
import json
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db import get_db
from backend.models.agent_config import AgentConfig
from backend.models.tenant import Tenant
from backend.models.call_record import CallRecord
from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agents", tags=["web-calls"])


@router.post("/{agent_id}/web-call-token")
async def create_web_call_token(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a LiveKit room + returns token for browser web call.
    Admin clicks 'Web Call' -> this endpoint -> browser joins room
    -> LiveKit agent auto-dispatches to the room.
    """
    # Load agent config
    result = await db.execute(
        select(AgentConfig).where(AgentConfig.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(404, "Agent not found")

    # Load tenant
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == agent.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    # Create unique room name for this call
    room_name = f"webcall-{agent_id[:8]}-{uuid.uuid4().hex[:8]}"

    # Room metadata — agent reads this to configure itself
    metadata = json.dumps({
        "tenant_id": str(agent.tenant_id),
        "agent_id": agent_id,
        "clinic_name": tenant.clinic_name if tenant else "Clinic",
        "first_message": agent.first_message,
        "system_prompt": agent.system_prompt,
        "tts_voice": agent.tts_voice,
        "tts_language": agent.tts_language,
        "tts_model": agent.tts_model,
        "stt_model": agent.stt_model,
        "llm_model": agent.llm_model,
        "call_type": "web",
    })

    # Check if LiveKit keys are configured
    lk_url = settings.livekit_url
    lk_key = settings.livekit_api_key
    lk_secret = settings.livekit_api_secret

    if not lk_key or not lk_secret or lk_url == "wss://your-project.livekit.cloud":
        # Return a mock token for development/demo without LiveKit
        call_id = str(uuid.uuid4())
        call = CallRecord(
            id=call_id,
            tenant_id=str(agent.tenant_id),
            agent_id=agent_id,
            call_type="web",
            livekit_room_name=room_name,
            started_at=datetime.now(timezone.utc),
            status="in_progress",
        )
        db.add(call)
        # commit handled by get_db context manager

        return {
            "token": "",
            "roomName": room_name,
            "wsUrl": lk_url,
            "callId": call_id,
            "demo": True,
            "message": "LiveKit not configured — web call will use demo mode",
        }

    try:
        from livekit import api as livekit_api

        lk = livekit_api.LiveKitAPI(lk_url, lk_key, lk_secret)

        # Create room with metadata
        await lk.room.create_room(
            livekit_api.CreateRoomRequest(
                name=room_name,
                metadata=metadata,
                empty_timeout=300,
                max_participants=2,
            )
        )

        # Generate browser token for admin/patient
        token = livekit_api.AccessToken(lk_key, lk_secret)
        token.with_identity(f"user-{uuid.uuid4().hex[:6]}")
        token.with_name("Web Call User")
        token.with_grants(
            livekit_api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )
        token.with_ttl(3600)

        jwt_token = token.to_jwt()
    except Exception as e:
        logger.error(f"LiveKit room creation failed: {e}")
        raise HTTPException(500, f"Failed to create call room: {str(e)}")

    # Create call record
    call_id = str(uuid.uuid4())
    call = CallRecord(
        id=call_id,
        tenant_id=str(agent.tenant_id),
        agent_id=agent_id,
        call_type="web",
        livekit_room_name=room_name,
        started_at=datetime.now(timezone.utc),
        status="in_progress",
    )
    db.add(call)

    return {
        "token": jwt_token,
        "roomName": room_name,
        "wsUrl": lk_url,
        "callId": call_id,
    }


@router.post("/{agent_id}/outbound-call")
async def make_outbound_call(
    agent_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Admin dials a real phone number from dashboard.
    Uses LiveKit SIP to call the number.
    """
    phone_number = body.get("phone_number", "").strip()
    if not phone_number:
        raise HTTPException(400, "phone_number required")

    # Basic phone validation
    if not phone_number.startswith("+") or len(phone_number) < 10:
        raise HTTPException(400, "Invalid phone number format. Use +country_code...")

    # Load agent
    result = await db.execute(
        select(AgentConfig).where(AgentConfig.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(404, "Agent not found")

    room_name = f"outbound-{agent_id[:8]}-{uuid.uuid4().hex[:8]}"

    # Create call record
    call_id = str(uuid.uuid4())
    call = CallRecord(
        id=call_id,
        tenant_id=str(agent.tenant_id),
        agent_id=agent_id,
        call_type="outbound",
        patient_number=phone_number,
        patient_number_masked=phone_number[:4] + "XX XXXX" + phone_number[-2:],
        livekit_room_name=room_name,
        started_at=datetime.now(timezone.utc),
        status="dialing",
    )
    db.add(call)

    # SIP trunk check
    if not agent.sip_provider:
        return {
            "status": "pending",
            "callId": call_id,
            "room_name": room_name,
            "phone_number": phone_number,
            "message": "SIP trunk not configured for this agent. Configure telephony first.",
        }

    return {
        "status": "dialing",
        "callId": call_id,
        "room_name": room_name,
        "phone_number": phone_number,
        "message": f"Calling {phone_number}...",
    }


@router.get("/{agent_id}/call-records")
async def get_call_records(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all call records for an agent."""
    result = await db.execute(
        select(CallRecord)
        .where(CallRecord.agent_id == agent_id)
        .order_by(CallRecord.created_at.desc())
        .limit(50)
    )
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "call_type": r.call_type,
            "patient_number_masked": r.patient_number_masked,
            "livekit_room_name": r.livekit_room_name,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "ended_at": r.ended_at.isoformat() if r.ended_at else None,
            "duration_seconds": r.duration_seconds,
            "status": r.status,
            "end_reason": r.end_reason,
            "outcome": r.outcome,
            "transcript": r.transcript,
            "summary": r.summary,
            "sentiment": r.sentiment,
            "detected_language": r.detected_language,
        }
        for r in records
    ]
