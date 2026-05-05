#!/usr/bin/env bash
set -e

echo "Starting CLI End-to-End Local Matrix Tests..."

echo "Installing root dependencies..."
npm install
npm install -D @playwright/test wait-on

echo "Ensuring Playwright Browsers are installed..."
npx playwright install --with-deps chromium

echo "Installing CLI dependencies..."
cd cli && npm install && cd ..

FRONTENDS=("nextjs" "angular" "vue" "svelte")
BACKENDS=("fastapi" "flask")
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
    echo "Waiting for backend on http://127.0.0.1:8000/api/health..."
    npx wait-on http-get://127.0.0.1:8000/api/health -t 60000

    # Wait for frontend
    if [ "$frontend" = "nextjs" ]; then
      PORT=3000
    elif [ "$frontend" = "angular" ]; then
      PORT=4200
    else
      PORT=5173
    fi

    echo "Waiting for frontend on http://127.0.0.1:$PORT..."
    npx wait-on http-get://127.0.0.1:$PORT -t 60000

    echo "Running Playwright integration test..."
    FRONTEND=$frontend npx playwright test tests/integration.spec.js --project=chromium

    echo "Tearing down servers..."
    # The servers are started in the background. 
    # Let's forcefully clear the ports to be absolutely sure there are no lingering processes for the next loop.
    lsof -ti:8000 | xargs kill -9 >/dev/null 2>&1 || true
    lsof -ti:$PORT | xargs kill -9 >/dev/null 2>&1 || true
    kill -9 $START_PID >/dev/null 2>&1 || true

    echo "Cleaning up directory..."
    rm -rf $TEST_APP_DIR

    echo "Combination $frontend + $backend completed successfully!"
    echo ""
  done
done

echo "All 8 permutations tested successfully locally!"
