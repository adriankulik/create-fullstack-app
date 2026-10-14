#!/usr/bin/env bash
set -e

echo "🔒 Initializing AI Sandbox with Pipelock Egress Firewall..."

# Start supporting services (database, migrations, backend, and pipelock firewall)
docker compose -f docker-compose.yml -f docker-compose.sandbox.yml up -d db migration backend pipelock

# Ensure backend Python dependencies are installed in the sandbox venv if python backend exists
if [ -f backend/requirements.txt ]; then
  docker compose -f docker-compose.yml -f docker-compose.sandbox.yml run --rm ai-sandbox bash -c 'if [ ! -f /home/developer/.venv/.installed ]; then pip install --no-cache-dir -r backend/requirements.txt && if [ -f database/requirements.txt ]; then pip install --no-cache-dir -r database/requirements.txt; fi && touch /home/developer/.venv/.installed; fi' >/dev/null 2>&1 || true
fi

echo "🚀 Entering isolated AI Sandbox container (/workspace)..."
echo "   - Host filesystem outside this repo is protected and inaccessible."
echo "   - Sensitive host secrets (.env.secrets, .env.local) are masked."
echo "   - Outbound HTTP/HTTPS egress is inspected by Pipelock (DLP & anti-exfiltration)."
echo "   - Python virtual environment active (/home/developer/.venv)."
echo ""

if [ "$#" -eq 0 ]; then
  docker compose -f docker-compose.yml -f docker-compose.sandbox.yml run --rm ai-sandbox /bin/bash
else
  docker compose -f docker-compose.yml -f docker-compose.sandbox.yml run --rm ai-sandbox "$@"
fi
