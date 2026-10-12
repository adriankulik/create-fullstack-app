#!/usr/bin/env bash
set -e

echo "🔒 Initializing AI Sandbox with Pipelock Egress Firewall..."

# Start supporting services (database, migrations, backend, and pipelock firewall)
docker compose -f docker-compose.yml -f docker-compose.sandbox.yml up -d db migration backend pipelock

echo "🚀 Entering isolated AI Sandbox container (/workspace)..."
echo "   - Host filesystem outside this repo is protected and inaccessible."
echo "   - Sensitive host secrets (.env.secrets, .env.local) are masked."
echo "   - Outbound HTTP/HTTPS egress is inspected by Pipelock (DLP & anti-exfiltration)."
echo ""

if [ "$#" -eq 0 ]; then
  docker compose -f docker-compose.yml -f docker-compose.sandbox.yml run --rm ai-sandbox /bin/bash
else
  docker compose -f docker-compose.yml -f docker-compose.sandbox.yml run --rm ai-sandbox "$@"
fi
