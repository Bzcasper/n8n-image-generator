#!/bin/sh
set -e

# Start nginx in background
nginx -g 'daemon off;' &
NGINX_PID=$!

# Start backend server
cd /app && node dist/server.js &
BACKEND_PID=$!

# Function to handle signals
cleanup() {
    kill $NGINX_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    wait $NGINX_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    exit 0
}

# Trap signals
trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait -n
