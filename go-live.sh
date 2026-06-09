#!/bin/bash
set -euo pipefail

export PATH="/Users/manvith/node-v22.16.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")/.."

echo "Building ARISE..."
npm run build

echo "Starting production server on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
fi

export NODE_ENV=production
export PORT="${PORT:-3001}"

node server/index.js &
SERVER_PID=$!
sleep 2

echo "Opening public tunnel (URL appears below)..."
npx --yes cloudflared tunnel --url "http://localhost:${PORT}" &
TUNNEL_PID=$!

trap 'kill $SERVER_PID $TUNNEL_PID 2>/dev/null' EXIT
wait $TUNNEL_PID