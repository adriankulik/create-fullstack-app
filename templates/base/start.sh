#!/usr/bin/env bash
set -e

echo "Starting Backend..."
(cd backend && ./start.sh) &
BACKEND_PID=$!

echo "Starting Frontend..."
(cd frontend && ./start.sh) &
FRONTEND_PID=$!

echo "Services started. Press Ctrl+C to stop."
wait $BACKEND_PID $FRONTEND_PID
