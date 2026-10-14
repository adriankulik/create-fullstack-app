#!/usr/bin/env bash
set -e
export COMPOSE_FILE="docker-compose.yml:docker-compose.sandbox.yml"

echo "Running Backend Tests (in container)..."
docker compose exec -T backend ./test.sh

echo "Running Frontend Tests (in container)..."
docker compose exec -T frontend ./test.sh

echo "All tests passed!"
