#!/usr/bin/env bash
set -e

# Make sure the locally installed .NET 9 SDK is in the PATH if the CLI just installed it
export PATH="$HOME/.dotnet:$PATH"
export DOTNET_ROOT="$HOME/.dotnet"

cleanup() {
  echo "Cleaning up lingering servers..."
  lsof -ti:8000,3000,4200,5173 | xargs kill -9 >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting CLI End-to-End Local Matrix Tests..."

echo "Installing root dependencies..."
npm install
npm install -D @playwright/test wait-on

echo "Ensuring Playwright Browsers are installed..."
npx playwright install --with-deps chromium

echo "CLI dependencies installed via root package.json."

echo "Installing .NET 9 SDK for E2E tests (non-interactive)..."
curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 9.0

FRONTENDS=($(find templates/frontend -mindepth 1 -maxdepth 1 -type d -exec basename {} \;))
BACKENDS=($(find templates/backend -mindepth 1 -maxdepth 1 -type d -exec basename {} \;))
TEST_APP_DIR="e2e-matrix-temp-app"

# Clean up any previous run
rm -rf $TEST_APP_DIR

for frontend in "${FRONTENDS[@]}"; do
  for backend in "${BACKENDS[@]}"; do
    echo "========================================================"
    echo "Testing Combination: Frontend: $frontend, Backend: $backend"
    echo "========================================================"

    # Scaffold the app
    node cli/index.js $TEST_APP_DIR --frontend $frontend --backend $backend

    echo "Running lint.sh..."
    (cd $TEST_APP_DIR && ./lint.sh)

    echo "Running test.sh..."
    (cd $TEST_APP_DIR && ./test.sh)

    echo "Starting servers in background..."
    (cd $TEST_APP_DIR && nohup ./start.sh > start.log 2>&1) &
    START_PID=$!

    # Wait for backend
    echo "Waiting for backend on tcp:8000..."
    npx wait-on tcp:8000 -t 60000

    # Wait for frontend
    if [ "$frontend" = "nextjs" ]; then
      PORT=3000
    elif [ "$frontend" = "angular" ]; then
      PORT=4200
    else
      PORT=5173
    fi

    echo "Waiting for frontend on http://localhost:$PORT..."
    npx wait-on http-get://localhost:$PORT -t 60000

    echo "Running Playwright integration test..."
    FRONTEND=$frontend npx playwright test tests/integration.spec.js --project=chromium

    echo "Tearing down servers..."
    # The servers are started in the background. 
    # Let's forcefully clear the ports to be absolutely sure there are no lingering processes for the next loop.
    lsof -ti:8000 | xargs kill -9 >/dev/null 2>&1 || true
    lsof -ti:$PORT | xargs kill -9 >/dev/null 2>&1 || true
    kill -9 $START_PID >/dev/null 2>&1 || true

    echo "Cleaning up directory..."
    sleep 1
    rm -rf $TEST_APP_DIR

    echo "Combination $frontend + $backend completed successfully!"
    echo ""
  done
done

PERMUTATIONS=$((${#FRONTENDS[@]} * ${#BACKENDS[@]}))
echo "All $PERMUTATIONS permutations tested successfully locally!"
