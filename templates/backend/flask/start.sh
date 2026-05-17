#!/usr/bin/env bash
set -e
if [ -d "venv" ]; then
    source venv/bin/activate
    python main.py
else
    python3 main.py
fi
