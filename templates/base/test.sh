#!/usr/bin/env bash
set -e

echo "Running Backend Tests..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    pytest
else
    pytest
fi
cd ..

echo "Running Frontend Tests..."
cd frontend
npm run test
cd ..

echo "All tests passed!"
