"""
backend/routers/ws.py — WebSocket endpoints for live call monitoring and streaming STT.
"""
import json
import logging
import asyncio
import base64
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.redis_client import get_session
from backend.services.sarvam_streaming import create_streaming_stt

logger = logging.getLogger(__name__)
router = APIRouter()

# Active WebSocket connections per tenant
connections: dict[str, list[WebSocket]] = {}


@router.websocket("/ws/calls/{tenant_id}")
async def live_calls_ws(websocket: WebSocket, tenant_id: str):
    """
    WebSocket endpoint for the frontend dashboard to receive live call events.
    Clients subscribe by tenant_id and receive JSON events for:
    - call_started, call_ended, booking_confirmed, etc.
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for tenant_id: {tenant_id}")

    if tenant_id not in connections:
        connections[tenant_id] = []
    connections[tenant_id].append(websocket)

    try:
        # Send initial ping
        await websocket.send_json({"type": "connected", "tenant_id": tenant_id, "active_calls": 0})

        while True:
            # Keep alive — wait for any message from client (ping/pong)
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                # Send keepalive
                await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for tenant_id: {tenant_id}")
    finally:
        if tenant_id in connections:
            connections[tenant_id] = [c for c in connections[tenant_id] if c != websocket]


async def broadcast_event(tenant_id: str, event: dict):
    """Broadcast an event to all connected WebSocket clients for a tenant."""
    if tenant_id not in connections:
        return
    dead = []
    for ws in connections[tenant_id]:
        try:
            await ws.send_json(event)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections[tenant_id].remove(ws)


@router.websocket("/ws/streaming-stt/{tenant_id}/{agent_id}")
async def streaming_stt_ws(websocket: WebSocket, tenant_id: str, agent_id: str):
    """
    WebSocket endpoint for real-time speech-to-text transcription.
    
    Client sends:
    {
        "type": "audio",
        "audio": "<base64-encoded-audio>",
        "language_code": "en-IN",
        "mode": "transcribe"  # or "translate", "verbatim", "translit", "codemix"
    }
    
    Server responds with:
    {
        "type": "transcript",
        "text": "...",
        "confidence": 0.95
    }
    """
    await websocket.accept()
    logger.info(f"Streaming STT WS connected — tenant_id={tenant_id}, agent_id={agent_id}")

    stt_client = None
    language_code = "en-IN"
    mode = "transcribe"
    sample_rate = 16000

    try:
        # Wait for initial config message
        data = await websocket.receive_json()
        if data.get("type") == "config":
            language_code = data.get("language_code", "en-IN")
            mode = data.get("mode", "transcribe")
            sample_rate = data.get("sample_rate", 16000)
            logger.info(f"STT config: lang={language_code}, mode={mode}, sr={sample_rate}")

        # Create and connect to Sarvam streaming API
        stt_client = await create_streaming_stt(
            language_code=language_code,
            mode=mode,
            sample_rate=sample_rate,
        )

        if not stt_client:
            await websocket.send_json({
                "type": "error",
                "message": "Failed to connect to Sarvam streaming API",
                "code": "SARVAM_CONNECTION_FAILED",
            })
            return

        await websocket.send_json({
            "type": "ready",
            "language_code": language_code,
            "mode": mode,
        })

        # Start receiving STT results in background
        async def receive_stt_results():
            try:
                async for result in stt_client.receive_results():
                    await websocket.send_json(result)
            except Exception as e:
                logger.error(f"Error receiving STT results: {e}")

        result_task = asyncio.create_task(receive_stt_results())

        # Receive audio chunks from client
        try:
            while True:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=60.0)

                if data.get("type") == "audio":
                    # Decode base64 audio
                    try:
                        audio_b64 = data.get("audio", "")
                        audio_bytes = base64.b64decode(audio_b64)
                        await stt_client.send_audio(
                            audio_bytes,
                            encoding=data.get("encoding", "audio/wav"),
                        )
                    except Exception as e:
                        logger.error(f"Failed to process audio: {e}")
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Audio processing error: {str(e)}",
                        })

                elif data.get("type") == "flush":
                    # Force immediate processing
                    await stt_client.flush()

                elif data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})

        except asyncio.TimeoutError:
            logger.warning(f"Streaming STT timeout for {agent_id}")
        except WebSocketDisconnect:
            logger.info(f"Streaming STT WS disconnected — agent_id={agent_id}")
            result_task.cancel()

    except Exception as e:
        logger.error(f"Streaming STT error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e),
            })
        except:
            pass

    finally:
        if stt_client:
            await stt_client.close()
