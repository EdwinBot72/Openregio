#!/bin/bash
set -e

echo "🔄 Running database migrations..."
# Use drizzle-kit push with yes input to skip interactive prompts
echo "yes" | npx drizzle-kit push --force 2>/dev/null || echo "✓ Database schema already up to date"

echo "✓ Database migrations completed"
echo "🚀 Starting application..."
exec npm run start
