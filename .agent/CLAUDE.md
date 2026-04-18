# CLAUDE.md — RxVoice AI Receptionist SaaS
# Antigravity reads this file automatically at the start of every session.
# Never delete or rename this file.

## Project: RxVoice
AI Voice Receptionist SaaS for clinics. Multi-tenant. India + Middle East markets.
Backend: FastAPI (Python 3.11). Frontend: React + Vite. DB: PostgreSQL. Cache: Redis.
VPS deployment using Docker Compose.

## Non-negotiable rules — follow these on EVERY task

### Multi-tenancy
- Every DB table has `tenant_id UUID NOT NULL`
- Every query filters by tenant_id — no exceptions
- Redis keys are namespaced: `{tenant_id}:{resource}:{id}`
- Middleware injects tenant from JWT on every API request

### Secrets
- All secrets in .env — never hardcode
- Use `from backend.config import settings` everywhere

### Error handling
- Every external API call (Sarvam, Gemini, HIS, LiveKit) has try/except
- On voice pipeline failure: synthesize fallback phrase and continue call
- Never drop a call silently

### Code style
- Python: async/await everywhere, type hints on all functions
- No print() — use Python logging module
- Tests in tests/ — pytest

### Latency target
- Each voice turn must complete in < 3 seconds total
- Profile any function that touches network

## Project structure
```
rxvoice/
├── CLAUDE.md                    ← this file
├── .agent/skills/               ← auto-loaded by Antigravity
├── .env / .env.example
├── backend/
│   ├── main.py                  ← FastAPI app
│   ├── config.py                ← Pydantic settings
│   ├── db.py                    ← SQLAlchemy async engine
│   ├── redis_client.py
│   ├── routers/
│   │   ├── voice.py             ← POST /voice/incoming (webhook)
│   │   ├── tenants.py           ← clinic CRUD
│   │   ├── doctors.py
│   │   └── appointments.py
│   ├── agent/
│   │   ├── pipeline.py          ← LiveKit agent — the voice loop
│   │   ├── sarvam.py            ← STT + TTS wrappers
│   │   └── gemini.py            ← LLM intent + response
│   ├── services/
│   │   ├── his.py               ← Oxzygen HIS client (with mock fallback)
│   │   ├── booking.py           ← booking orchestration
│   │   └── telegram.py          ← notification sender
│   ├── models/
│   │   ├── tenant.py
│   │   ├── doctor.py
│   │   ├── appointment.py
│   │   └── call_log.py
│   └── middleware/
│       └── tenant_context.py    ← JWT → tenant_id injection
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Onboarding.tsx
│       │   ├── CallLogs.tsx
│       │   └── VoiceRecorder.tsx
│       └── components/
├── tests/
├── docker-compose.yml
└── nginx.conf                   ← reverse proxy for VPS
```

## Voice pipeline (the critical path — do not change this flow)
```
Incoming call
→ /voice/incoming webhook (FastAPI)
→ resolve tenant from called number
→ create CallLog, create Redis session
→ trigger LiveKit agent for this room
→ [LOOP PER TURN]:
    1. Sarvam STT: audio bytes → transcript text
    2. detect language (first turn only)
    3. Gemini: extract intent as JSON
    4. if book_appointment: fetch doctors + slots from HIS
    5. if confirm_booking: create appointment in HIS → Telegram notify
    6. Gemini: generate natural language response
    7. Sarvam TTS: text → audio bytes → play to caller
→ call ends: update CallLog status, expire Redis session
```

## Data models (abbreviated — see models/ for full)
```python
Tenant:      id, clinic_name, forwarding_number, ai_number, language, custom_voice_id
Doctor:      id, tenant_id, name, specialization, his_doctor_id
Appointment: id, tenant_id, doctor_id, slot_time, patient_phone, status
CallLog:     id, tenant_id, call_id, duration_secs, outcome, transcript_json
```

## Redis session schema (TTL: 3600 seconds)
```json
{
  "call_id": "lk_room_xxxx",
  "tenant_id": "uuid",
  "detected_lang": "hi-IN",
  "clinic_voice_id": "sarvam_voice_id_or_null",
  "turn_count": 0,
  "context": {
    "patient_phone": "+91xxxxxxxxxx",
    "pending_booking": null,
    "confirmed_booking": null,
    "history": []
  }
}
```

## Environment variables
All defined in .env.example. Load via `from backend.config import settings`.
Never access os.environ directly.

## Deployment
VPS via Docker Compose. See .agent/skills/vps-deploy/SKILL.md for full steps.
Services in compose: backend, frontend (nginx), postgres, redis, livekit-agent.