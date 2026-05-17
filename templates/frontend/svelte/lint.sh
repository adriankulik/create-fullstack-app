#!/usr/bin/env bash
set -e
npm run lint
npx prettier --write .
