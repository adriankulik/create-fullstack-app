#!/usr/bin/env bash
# Usage: tests/container-e2e.sh <generated-project-dir> <frontend-port>
# Verifies a generated project end-to-end inside Docker: services healthy,
# multiply API responds correctly, and the result was persisted in Postgres.
set -euo pipefail
cd "$1"
FRONTEND_PORT="${2:-3000}"
export COMPOSE_FILE="docker-compose.yml:docker-compose.sandbox.yml"

echo "==> Services"
docker compose ps

echo "==> Frontend reachable on :$FRONTEND_PORT"
curl -fsS -o /dev/null "http://127.0.0.1:$FRONTEND_PORT"

NUMBER=$(( (RANDOM % 900) + 100 ))
EXPECTED=$(( NUMBER * 2 ))
echo "==> POST /api/multiply number=$NUMBER (expect $EXPECTED)"
RESPONSE=$(curl -fsS -X POST http://127.0.0.1:8000/api/multiply \
  -H 'Content-Type: application/json' -d "{\"number\": $NUMBER}")
echo "$RESPONSE"
echo "$RESPONSE" | grep -Eq "\"result\": *$EXPECTED(\.0)?[,}]" \
  || { echo "Unexpected API response"; exit 1; }

echo "==> Verifying row in Postgres"
ROWS=$(docker compose exec -T db psql -U user -d appdb -tA \
  -c "SELECT count(*) FROM calculations WHERE input_number = $NUMBER AND result = $EXPECTED")
[ "$(echo "$ROWS" | tr -d '[:space:]')" -ge 1 ] \
  || { echo "No matching row found in calculations table"; exit 1; }

echo "✅ E2E OK"
