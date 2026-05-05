#!/usr/bin/env bash
if [ -d "venv" ]; then
    source venv/bin/activate
    python -m uvicorn main:app --reload --port 8000
else
    python3 -m uvicorn main:app --reload --port 8000
fi
