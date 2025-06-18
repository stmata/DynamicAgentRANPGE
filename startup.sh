#!/usr/bin/env bash
# Production launcher : 4 workers × 8 threads
PORT=${PORT:-8000}
gunicorn \
  -k uvicorn.workers.UvicornWorker \
  -w 4 --threads 8 \
  -b 0.0.0.0:$PORT \
  --timeout 120 \
  app.main:app \