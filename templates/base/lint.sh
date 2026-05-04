#!/usr/bin/env bash
set -e

echo "Linting and Formatting Backend..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    ruff check . --fix
    ruff format .
else
    ruff check . --fix
    ruff format .
fi
cd ..

echo "Linting and Formatting Frontend..."
cd frontend
npm run lint
npx prettier --write .
cd ..

echo "Linting and formatting complete!"
