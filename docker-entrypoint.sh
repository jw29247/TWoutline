#!/bin/sh
set -e

echo "=== Starting Outline ==="
echo "PORT: ${PORT:-3000}"
echo "NODE_ENV: ${NODE_ENV}"
echo "URL: ${URL}"
echo "DATABASE_URL: ${DATABASE_URL:+[SET]}"
echo "REDIS_URL: ${REDIS_URL:+[SET]}"
echo "SECRET_KEY: ${SECRET_KEY:+[SET]}"
echo "UTILS_SECRET: ${UTILS_SECRET:+[SET]}"

# Check if required environment variables are set
if [ -z "$SECRET_KEY" ]; then
  echo "ERROR: SECRET_KEY is not set"
  exit 1
fi

if [ -z "$UTILS_SECRET" ]; then
  echo "ERROR: UTILS_SECRET is not set"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$REDIS_URL" ]; then
  echo "ERROR: REDIS_URL is not set"
  exit 1
fi

echo "=== Environment checks passed ==="

# Run database migrations
echo "Running database migrations..."
yarn db:migrate

# Start the application
echo "Starting application on port ${PORT:-3000}..."
exec "$@"