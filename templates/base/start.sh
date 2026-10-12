#!/usr/bin/env bash
set -e

# If --docker or -d is passed, run the entire stack containerized
if [ "$1" == "--docker" ] || [ "$1" == "-d" ]; then
  echo "🚀 Starting all services via Docker Compose (frontend, backend, database)..."
  docker compose up --build
  exit 0
fi

echo "Starting Database via docker-compose..."
docker compose up -d db

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
