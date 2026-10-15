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


# Load ports from .env if present
if [ -f .env ]; then
  export $(grep -E '^(FRONTEND_PORT|BACKEND_PORT|POSTGRES_PORT)=' .env 2>/dev/null | xargs) || true
fi

# Pre-flight check for port availability
if command -v lsof >/dev/null 2>&1; then
  for port_info in "${POSTGRES_PORT:-5432}:Database (POSTGRES_PORT)" "${BACKEND_PORT:-8000}:Backend (BACKEND_PORT)" "${FRONTEND_PORT:-3000}:Frontend (FRONTEND_PORT)"; do
    port="${port_info%%:*}"
    service="${port_info#*:}"
    if lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "⚠️  Port $port ($service) is already in use by another process or container."
      echo "   Please stop the conflicting process/container (e.g., docker stop <id>) or update the port in your .env file."
    fi
  done
fi

echo "🚀 Building and starting all fullstack services with Docker Compose..."
docker compose up -d --build --wait "${PASS_ARGS[@]}" || {
  echo "❌ Some services failed to become healthy. Recent logs:"
  docker compose ps
  docker compose logs --tail=40
  exit 1
}

"$(dirname "${BASH_SOURCE[0]}")/urls.sh"

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
