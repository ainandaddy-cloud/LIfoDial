---
name: vps-deploy
description: >
  Use this skill for anything involving deployment, Docker, VPS, server setup,
  nginx, production configuration, environment setup, going live.
  Triggers on: "deploy", "VPS", "production", "Docker", "server", "go live",
  "nginx", "docker-compose", "SSL", "domain".
---

# VPS Deployment Skill — RxVoice on VPS

## Target: Any Linux VPS ($5-10/month)
Recommended providers (cheapest to most reliable):
- Hetzner Cloud (Germany/Finland): €3.29/month for CX11 (2GB RAM) — BEST VALUE
- Contabo VPS S: €4.99/month (4GB RAM) — good for India
- DigitalOcean Droplet: $6/month (1GB RAM)
- Hostinger VPS: $3.99/month
Minimum spec: 2GB RAM, 2 vCPU, 20GB SSD

## Free Services Used
- PostgreSQL: self-hosted on VPS (no cost) — OR Supabase free tier (500MB)
- Redis: self-hosted on VPS (no cost) — OR Upstash free tier (10K commands/day)
- LiveKit: Cloud free tier (10K participant-minutes/month) — enough for MVP testing
- SSL: Let's Encrypt (free)
- Domain: Namecheap ~$8/year OR use IP directly for testing

## Docker Compose — Full Stack

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: rxvoice
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rxvoice_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d rxvoice"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - rxvoice_net

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres/rxvoice
      REDIS_URL: redis://redis:6379
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - rxvoice_net

  livekit-agent:
    build:
      context: .
      dockerfile: Dockerfile.agent
    restart: unless-stopped
    env_file: .env
    depends_on:
      - backend
      - redis
    networks:
      - rxvoice_net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - rxvoice_net

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot_certs:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    depends_on:
      - backend
      - frontend
    networks:
      - rxvoice_net

volumes:
  postgres_data:
  redis_data:
  certbot_certs:
  certbot_www:

networks:
  rxvoice_net:
    driver: bridge
```

## Dockerfiles

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

```dockerfile
# Dockerfile.agent  
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
CMD ["python", "-m", "backend.agent.pipeline", "start"]
```

```dockerfile
# frontend/Dockerfile.frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Nginx Config

```nginx
# nginx.conf
events { worker_connections 1024; }

http {
    upstream backend { server backend:8000; }
    upstream frontend { server frontend:80; }

    # Redirect HTTP → HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        location /.well-known/acme-challenge/ { root /var/www/certbot; }
        location / { return 301 https://$host$request_uri; }
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;
        
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # API
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # WebSocket for live call counter
        location /ws/ {
            proxy_pass http://backend/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
        }
    }
}
```

## VPS Setup Script (run once on fresh server)

```bash
#!/bin/bash
# setup_vps.sh — run on fresh Ubuntu 22.04 VPS

set -e

echo "=== Installing Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker

echo "=== Installing Docker Compose ==="
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "=== Setting up firewall ==="
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable

echo "=== Cloning project ==="
git clone https://github.com/YOUR_USERNAME/rxvoice.git /opt/rxvoice
cd /opt/rxvoice

echo "=== Copying .env ==="
# Copy your .env file manually: scp .env user@vps:/opt/rxvoice/.env
echo "⚠️  Copy your .env file to /opt/rxvoice/.env before continuing"

echo "=== VPS ready. Run: cd /opt/rxvoice && docker-compose up -d ==="
```

## Deploy Commands

```bash
# First deploy
cd /opt/rxvoice
docker-compose up -d --build

# Run DB migrations
docker-compose exec backend python -m alembic upgrade head

# Seed demo data
docker-compose exec backend python backend/scripts/seed_demo.py

# Check logs
docker-compose logs -f backend
docker-compose logs -f livekit-agent

# Update after code change
git pull
docker-compose up -d --build backend livekit-agent

# SSL certificate (replace yourdomain.com)
docker run --rm -v certbot_certs:/etc/letsencrypt -v certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com --email your@email.com --agree-tos
docker-compose restart nginx
```

## .env.example

```env
# ═══ LiveKit ═══
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxx

# ═══ Sarvam AI ═══
SARVAM_API_KEY=xxxxxxxxxxxxxxxxxxxx

# ═══ Google Gemini ═══
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxx

# ═══ Vobiz (Phase 6 — skip for browser testing) ═══
VOBIZ_ACCOUNT_SID=
VOBIZ_AUTH_TOKEN=
VOBIZ_VIRTUAL_NUMBER=

# ═══ Oxzygen HIS (leave blank to use mock) ═══
OXZYGEN_BASE_URL=
OXZYGEN_API_KEY=

# ═══ Telegram ═══
TELEGRAM_BOT_TOKEN=xxxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=-100xxxxxxxxxx

# ═══ Database ═══
POSTGRES_USER=rxvoice
POSTGRES_PASSWORD=change_this_strong_password
DATABASE_URL=postgresql+asyncpg://rxvoice:change_this_strong_password@postgres/rxvoice
REDIS_URL=redis://redis:6379

# ═══ App ═══
SECRET_KEY=generate_with_openssl_rand_hex_32
ENVIRONMENT=production

# ═══ Frontend ═══
VITE_API_URL=https://yourdomain.com/api
```

## Health Check Endpoint
```python
# backend/main.py
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
```

## Monitoring (free)
```bash
# Check resource usage
docker stats

# Disk usage  
df -h

# Simple uptime monitoring: use UptimeRobot (free) pointing to /health endpoint
# Get SMS/email alerts if server goes down
```