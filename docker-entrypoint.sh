#!/bin/sh
set -e

# Run Prisma migrations on startup
echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Next.js..."
exec node server.js
