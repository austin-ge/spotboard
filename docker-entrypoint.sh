#!/bin/sh

# Run Prisma migrations on startup
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed — starting anyway"

echo "Starting Next.js..."
exec node server.js
