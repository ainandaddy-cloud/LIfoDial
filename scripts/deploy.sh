#!/bin/bash
# deploy.sh - Commands for deployment and updating

set -e

COMMAND=$1

case "$COMMAND" in
    "initial")
        echo "=== Executing Initial Deployment ==="
        docker-compose up -d --build
        echo "Running DB migrations..."
        docker-compose exec backend python -m alembic upgrade head
        # Uncomment below if you want to seed demo data
        # docker-compose exec backend python backend/scripts/seed_demo.py
        ;;
    "update")
        echo "=== Updating Application ==="
        git pull
        docker-compose up -d --build backend livekit-agent frontend
        ;;
    "ssl")
        echo "=== Requesting SSL Certificate ==="
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: ./deploy.sh ssl <yourdomain.com> <your@email.com>"
            exit 1
        fi
        DOMAIN=$2
        EMAIL=$3
        docker run --rm -v certbot_certs:/etc/letsencrypt -v certbot_www:/var/www/certbot \
          certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
          -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email
        docker-compose restart nginx
        ;;
    "logs")
        echo "=== Following Logs ==="
        docker-compose logs -f
        ;;
    *)
        echo "Usage: ./deploy.sh [initial|update|ssl|logs]"
        exit 1
        ;;
esac
