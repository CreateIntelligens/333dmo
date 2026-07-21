#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push --force 2>&1 || echo "Migration skipped or already up to date"

echo "Starting server..."
exec node --import tsx src/index.ts
