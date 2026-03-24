#!/bin/sh

# Run Prisma migrations on startup
# Use --schema flag to bypass prisma.config.ts (which needs dotenv)
echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma || echo "Migration failed — starting anyway"

echo "Starting Next.js..."
exec node server.js
