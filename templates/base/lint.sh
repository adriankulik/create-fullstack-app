#!/usr/bin/env bash
set -e
export COMPOSE_FILE="docker-compose.yml:docker-compose.sandbox.yml"

echo "Linting and Formatting Backend (in container)..."
docker compose exec -T backend ./lint.sh

echo "Linting and Formatting Frontend (in container)..."
docker compose exec -T frontend ./lint.sh

echo "Linting and formatting complete!"
