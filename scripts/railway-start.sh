#!/bin/sh
# Railway startup script for Outline

echo "🚀 Starting Outline on Railway..."

# Run database migrations
echo "📦 Running database migrations..."
yarn db:migrate

# Check if FORCE_SETUP_MODE is set
if [ "$FORCE_SETUP_MODE" = "true" ]; then
  echo "⚠️  FORCE_SETUP_MODE is enabled"
  echo "🎯 Installation wizard will be available"
  echo "📝 Visit your Railway URL and complete setup"
  echo "🔄 After setup, remove FORCE_SETUP_MODE from Railway environment variables"
fi

# Start the application
echo "🚀 Starting server..."
exec yarn start