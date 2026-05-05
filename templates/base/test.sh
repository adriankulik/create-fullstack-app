#!/usr/bin/env bash
set -e

echo "Running Backend Tests..."
(cd backend && ./test.sh)

echo "Running Frontend Tests..."
(cd frontend && ./test.sh)

echo "All tests passed!"
