#!/usr/bin/env bash
set -e

echo "🚀 Building and running all fullstack services with Docker Compose..."
docker compose up --build "$@"
