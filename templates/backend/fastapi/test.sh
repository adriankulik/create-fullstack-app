#!/usr/bin/env bash
set -e
if [ -d "venv" ] && [ -x "venv/bin/python" ] && ./venv/bin/python -c "import sys" >/dev/null 2>&1; then
    source venv/bin/activate
fi
python3 -m pytest
