#!/usr/bin/env bash
set -e
if [ -d "venv" ]; then
    source venv/bin/activate
    python -m pytest
else
    python3 -m pytest
fi
