#!/bin/sh

# Start nginx in background
nginx -g 'daemon off;' &
NGINX_PID=$!

# Start backend server
cd /app && npm start &
BACKEND_PID=$!

# Wait for both processes
wait $NGINX_PID
wait $BACKEND_PID
