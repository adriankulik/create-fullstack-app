#!/usr/bin/env bash
set -e
if [ -d "venv" ]; then
    source venv/bin/activate
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
    python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
fi
