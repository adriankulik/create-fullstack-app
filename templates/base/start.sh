#!/usr/bin/env bash
set -e

echo "Starting Backend..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    python -m uvicorn main:app --reload --port 8000 &
else
    python3 -m uvicorn main:app --reload --port 8000 &
fi
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Services started. Press Ctrl+C to stop."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
