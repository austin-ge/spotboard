#!/bin/sh
set -e

# Run Prisma migrations on startup
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Starting Next.js..."
exec node server.js
