#!/bin/sh

# Run Prisma migrations on startup
# Use prisma's --url flag to pass DATABASE_URL directly, bypassing prisma.config.ts
echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma --url="$DATABASE_URL" || echo "Migration failed — starting anyway"

echo "Starting Next.js..."
exec node server.js
