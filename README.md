# Spotboard

Multi-tenant skydiving dropzone winds & spotting app. Community tool built for any DZ to configure their own spotboard.

## Tech Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth v5
- Mapbox GL JS

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in values
3. `npm install`
4. `npx prisma db push` (after setting up PostgreSQL)
5. `npm run dev`

## Routes
- `/` — Landing page
- `/dz/[slug]` — Dropzone view
- `/setup` — Configure your dropzone
- `/login` — Sign in
- `/signup` — Create account
