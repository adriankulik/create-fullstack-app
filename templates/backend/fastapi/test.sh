#!/usr/bin/env bash
if [ -d "venv" ]; then
    source venv/bin/activate
    pytest
else
    pytest
fi
