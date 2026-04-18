# Lifodial - Deployment Guide

This guide describes how to deploy the entire Lifodial stack (Frontend, Backend, LiveKit Agent, Postgres, Redis, Nginx) to a Linux VPS using Docker Compose.

## Prerequisites
- A Linux VPS (Ubuntu 22.04 recommended) with at least 2GB RAM, 2 vCPU, 20GB SSD. Example: Hetzner Cloud CX11.
- A registered domain name pointing to your VPS IP address.
- SSH access to the VPS.

---

## Step 1: Push Code to GitHub
Ensure all your code (including the scripts and Dockerfiles we just generated) is pushed to a Github repository.
You will need to change the repo URL inside `scripts/setup_vps.sh` from `https://github.com/YOUR_USERNAME/rxvoice.git` to your actual Lifodial repository URL.

## Step 2: Initial Server Setup
1. SSH into your newly created VPS:
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```
2. You can either copy the `setup_vps.sh` file over to your VPS or run the commands manually. To run it:
   ```bash
   bash setup_vps.sh
   ```
   **Note**: Make sure to update the github repository clone link in the script first!
   This script will install Docker, Docker Compose, configure UFW (Firewall), and clone your repository to `/opt/rxvoice`.

## Step 3: Configure Environment Variables
1. Ensure the repository has been cloned to `/opt/rxvoice` on your VPS.
2. From your local machine, securely copy your `.env` file to the VPS:
   ```bash
   scp .env root@<YOUR_VPS_IP>:/opt/rxvoice/.env
   ```
3. Update the `.env` on your VPS as necessary. Notably:
   - Make sure `ENVIRONMENT=production`
   - Ensure the database details in `DATABASE_URL` match `POSTGRES_USER` and `POSTGRES_PASSWORD`.
   - Update `VITE_API_URL` to match your real domain (e.g., `https://yourdomain.com/api`).
   - Fill in your LiveKit, Sarvam AI, and Gemini AI keys.

## Step 4: First Build and Deployment
1. SSH back into your VPS and navigate to the project root:
   ```bash
   cd /opt/rxvoice
   ```
2. Build and start the infrastructure:
   ```bash
   bash scripts/deploy.sh initial
   ```
   This will start Postgres, Redis, Backend, Python Agent, Frontend, and Nginx. It also automatically runs the database migrations inside the backend container.

## Step 5: Setup SSL Certificate and HTTPS
1. First, make sure your domain's DNS A Record points to the VPS IP address.
2. Run the SSL script, passing in your domain and email address (for Let's Encrypt expiration notices):
   ```bash
   bash scripts/deploy.sh ssl yourdomain.com your_email@example.com
   ```
3. This requests a TLS certificate, saves it in the `certbot_certs` volume, and restarts Nginx to apply it.

## Step 6: Monitor & Update
- To view logs for all containers:
  ```bash
  bash scripts/deploy.sh logs
  ```
- Make sure to monitor your docker logs to see if your python agent successfully connects to the LiveKit server.
- Whenever you push new code changes to github, you can easily pull and restart your application by running:
  ```bash
  bash scripts/deploy.sh update
  ```

Your comprehensive Lifodial voice agent stack is now deployed and running!
