#!/bin/sh

# Run Prisma migrations on startup
# Use production config (plain JS, no TypeScript/dotenv needed)
echo "Running database migrations..."
npx prisma migrate deploy --config=prisma.config.production.js || { echo "Migration failed — refusing to start on a stale schema"; exit 1; }

echo "Starting Next.js..."
exec node server.js
