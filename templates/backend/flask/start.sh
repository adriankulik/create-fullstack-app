#!/usr/bin/env bash
if [ -d "venv" ]; then
    source venv/bin/activate
    python main.py
else
    python3 main.py
fi
