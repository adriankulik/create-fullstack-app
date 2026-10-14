#!/usr/bin/env bash
set -e

# Parse optional flags
NO_OPEN=false
DETACH=false
PASS_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --no-open)
      NO_OPEN=true
      ;;
    -d|--detach)
      DETACH=true
      ;;
    *)
      PASS_ARGS+=("$arg")
      ;;
  esac
done

echo "🚀 Building and starting all fullstack services with Docker Compose..."
docker compose up -d --build "${PASS_ARGS[@]}"

# Load ports from .env if present
if [ -f .env ]; then
  export $(grep -E '^(FRONTEND_PORT|BACKEND_PORT|POSTGRES_PORT)=' .env 2>/dev/null | xargs) || true
fi

FRONTEND_URL="http://localhost:${FRONTEND_PORT:-3000}"
BACKEND_URL="http://localhost:${BACKEND_PORT:-8000}"

echo ""
echo "✅ Fullstack services are up and running:"
echo "   • Frontend: $FRONTEND_URL"
echo "   • Backend:  $BACKEND_URL"
echo "   • Database: localhost:${POSTGRES_PORT:-5432}"
echo ""

# Reopen directly in DevContainer window if interactive and editor is available
if [ "$NO_OPEN" != "true" ] && [ -z "$CI" ] && [ -t 1 ]; then
  PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  HEX_PATH="$(printf "%s" "$PROJECT_DIR" | od -A n -t x1 | tr -d '[\n\t ]')"
  URI="vscode-remote://dev-container+${HEX_PATH}/workspace"

  OPENED=false

  # 1. Check Cursor CLI or macOS App
  if command -v cursor >/dev/null 2>&1; then
    cursor --folder-uri "$URI" >/dev/null 2>&1 && OPENED=true
  elif [ -x "/Applications/Cursor.app/Contents/Resources/app/bin/cursor" ]; then
    "/Applications/Cursor.app/Contents/Resources/app/bin/cursor" --folder-uri "$URI" >/dev/null 2>&1 && OPENED=true
  # 2. Check VS Code CLI or macOS App
  elif command -v code >/dev/null 2>&1; then
    code --folder-uri "$URI" >/dev/null 2>&1 && OPENED=true
  elif [ -x "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --folder-uri "$URI" >/dev/null 2>&1 && OPENED=true
  # 3. macOS URL scheme fallback
  elif command -v open >/dev/null 2>&1; then
    if [ -d "/Applications/Cursor.app" ] || [ -d "$HOME/Applications/Cursor.app" ]; then
      open "cursor://vscode-remote/dev-container+${HEX_PATH}/workspace" >/dev/null 2>&1 && OPENED=true
    elif [ -d "/Applications/Visual Studio Code.app" ] || [ -d "$HOME/Applications/Visual Studio Code.app" ]; then
      open "vscode://vscode-remote/dev-container+${HEX_PATH}/workspace" >/dev/null 2>&1 && OPENED=true
    fi
  fi

  if [ "$OPENED" = "true" ]; then
    echo "✨ Reopened in DevContainer window!"
  fi
fi

if [ "$DETACH" = "true" ]; then
  exit 0
fi

echo "Streaming logs (Press Ctrl+C to stop)..."
trap 'echo -e "\n🛑 Stopping fullstack services..."; docker compose stop >/dev/null 2>&1; exit 0' SIGINT SIGTERM
docker compose logs -f
