# Lifodial — Deployment Guide

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Redis (optional — backend falls back to in-memory)

### Backend
```bash
# Create venv and install
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Copy env
cp .env.example .env
# Edit .env — set GEMINI_API_KEY, SARVAM_API_KEY at minimum

# Run
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Health Check
```
GET http://localhost:8000/health
```
Returns database type, connection status, and environment.

---

## Docker Compose (Production)

### 1. Environment
```bash
cp .env.example .env
```
Set these at minimum:
| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@postgres/lifodial` |
| `POSTGRES_USER` | `lifodial` |
| `POSTGRES_PASSWORD` | `<strong-password>` |
| `GEMINI_API_KEY` | `AIza...` |
| `SARVAM_API_KEY` | `...` |
| `LIVEKIT_URL` | `wss://your-livekit.example.com` |
| `LIVEKIT_API_KEY` | `...` |
| `LIVEKIT_API_SECRET` | `...` |

### 2. Build & Start
```bash
docker compose up -d --build
```

Services started:
- **postgres** — PostgreSQL 16
- **redis** — Redis 7 with AOF persistence
- **backend** — FastAPI on :8000 (with healthcheck)
- **livekit-agent** — Voice pipeline worker
- **frontend** — React app served by nginx
- **nginx** — Reverse proxy on :80/:443

### 3. Verify
```bash
curl http://localhost/health
docker compose ps
docker compose logs -f backend
```

### 4. SSL (Let's Encrypt)
```bash
# Install certbot on host or use a certbot container
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com
```
Update `nginx.conf` to reference certs from `/etc/letsencrypt/`.

---

## VPS Deployment (Ubuntu 22.04)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone repo
git clone <your-repo-url> /opt/lifodial
cd /opt/lifodial

# 3. Configure
cp .env.example .env
nano .env   # Fill in API keys and passwords

# 4. Deploy
docker compose up -d --build

# 5. Verify
curl http://localhost/health
```

---

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Nginx   │────▸│ Frontend │     │  LiveKit SFU  │
│  :80/443 │     │  (React) │     │  (external)   │
│          │────▸│          │     └──────┬─────────┘
│          │     └──────────┘            │
│          │────▸┌──────────┐     ┌──────▼─────────┐
│          │     │ Backend  │◀───▸│ LiveKit Agent   │
│          │     │ FastAPI  │     │ (voice pipeline)│
│          │     └────┬─────┘     └────────────────┘
└──────────┘          │
                ┌─────▼─────┐   ┌───────────┐
                │ PostgreSQL │   │   Redis    │
                │   :5432    │   │   :6379    │
                └────────────┘   └───────────┘
```

## Key Endpoints
| Endpoint | Description |
|---|---|
| `GET /health` | System health + DB status |
| `GET /agents` | List agents |
| `POST /agents/{id}/web-call-token` | Get LiveKit token for browser call |
| `POST /agents/{id}/outbound-call` | Initiate SIP outbound call |
| `GET /agents/{id}/call-records` | Call history for agent |
| `GET /phone-numbers` | List virtual numbers |
| `WS /ws/calls/{tenant_id}` | Realtime call events |
