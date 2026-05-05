#!/usr/bin/env bash
set -e

echo "Linting and Formatting Backend..."
(cd backend && ./lint.sh)

echo "Linting and Formatting Frontend..."
(cd frontend && ./lint.sh)

echo "Linting and formatting complete!"
