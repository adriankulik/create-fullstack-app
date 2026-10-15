#!/usr/bin/env bash
# Prints the addresses of all running services. Usage: ./urls.sh
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

if [ -f .env ]; then
  export $(grep -E '^(FRONTEND_PORT|BACKEND_PORT|POSTGRES_PORT)=' .env 2>/dev/null | xargs) || true
fi

FRONTEND_URL="http://localhost:${FRONTEND_PORT:-3000}"
BACKEND_URL="http://localhost:${BACKEND_PORT:-8000}"

echo ""
echo "✅ Fullstack services are up and running:"
echo "   • Frontend:  $FRONTEND_URL"
echo "   • Backend:   $BACKEND_URL"
# Only FastAPI serves interactive API docs; probe so we don't print dead links
if command -v curl >/dev/null 2>&1 && curl -fs -o /dev/null "$BACKEND_URL/docs"; then
  echo "   • API docs:  $BACKEND_URL/docs"
fi
echo "   • Database:  localhost:${POSTGRES_PORT:-5432}"
echo "   • Pipelock:  http://localhost:8888 (egress proxy, no UI — logs: docker compose logs -f pipelock)"
echo ""
