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
