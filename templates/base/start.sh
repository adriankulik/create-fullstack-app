#!/usr/bin/env bash
set -e

echo "Starting Database via docker-compose..."
docker compose up -d

echo "Running Database Migrations (Alembic)..."
(
  cd database
  if [ ! -d "venv" ]; then
    python3 -m venv venv
  fi
  source venv/bin/activate
  pip install -r requirements.txt
  
  echo "Waiting for PostgreSQL to be ready..."
  for i in {1..60}; do
    if alembic current >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  
  alembic upgrade head
)

echo "Starting Backend..."
(cd backend && ./start.sh) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && ./start.sh) &
FRONTEND_PID=$!

echo "Services started. Press Ctrl+C to stop."
wait $BACKEND_PID $FRONTEND_PID
