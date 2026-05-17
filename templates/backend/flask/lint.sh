#!/usr/bin/env bash
set -e
if [ -d "venv" ]; then
    source venv/bin/activate
    ruff check . --fix
    ruff format .
else
    ruff check . --fix
    ruff format .
fi
