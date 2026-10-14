#!/usr/bin/env bash
# Usage: tests/container-e2e.sh <generated-project-dir> <frontend-port>
# Verifies a generated project end-to-end inside Docker: services healthy,
# multiply API responds correctly, and the result was persisted in Postgres.
set -euo pipefail
cd "$1"
FRONTEND_PORT="${2:-3000}"
echo "==> Services"
docker compose ps

echo "==> Waiting for frontend reachable on :$FRONTEND_PORT..."
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$FRONTEND_PORT" 2>/dev/null; then
    echo "Frontend reachable!"
    break
  fi
  sleep 2
done

echo "==> Waiting for backend API reachable on :8000..."
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:8000" 2>/dev/null || curl -fsS -o /dev/null "http://127.0.0.1:8000/docs" 2>/dev/null; then
    echo "Backend reachable!"
    break
  fi
  sleep 2
done

NUMBER=$(( (RANDOM % 900) + 100 ))
EXPECTED=$(( NUMBER * 2 ))
echo "==> POST /api/multiply number=$NUMBER (expect $EXPECTED)"
RESPONSE=""
for i in $(seq 1 15); do
  if RESPONSE=$(curl -fsS -X POST http://127.0.0.1:8000/api/multiply \
    -H 'Content-Type: application/json' -d "{\"number\": $NUMBER}" 2>/dev/null); then
    break
  fi
  sleep 2
done
echo "$RESPONSE"
echo "$RESPONSE" | grep -Eq "\"result\": *$EXPECTED(\.0)?[,}]" \
  || { echo "Unexpected API response"; exit 1; }

echo "==> Verifying row in Postgres"
ROWS=$(docker compose exec -T db psql -U user -d appdb -tA \
  -c "SELECT count(*) FROM calculations WHERE input_number = $NUMBER AND result = $EXPECTED")
[ "$(echo "$ROWS" | tr -d '[:space:]')" -ge 1 ] \
  || { echo "No matching row found in calculations table"; exit 1; }

echo "✅ E2E OK"
