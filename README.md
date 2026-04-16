# Spotboard

Multi-tenant skydiving dropzone winds & spotting platform. Live at [spotboard.xyz](https://spotboard.xyz).

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- PostgreSQL + Prisma 7
- NextAuth v5
- Mapbox GL JS
- Tailwind CSS 4
- Docker Compose (Dokploy on VPS)
- readsb (ultrafeeder) for ADS-B aggregation

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in values
3. `npm install`
4. Start Postgres (locally or via `docker compose up db`)
5. `npx prisma migrate dev` to apply migrations
6. `npx tsx prisma/seed.ts` to seed dropzones (optional)
7. `npm run dev`

## Environment Variables

See `.env.example`. Minimum required:

- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — random 32+ char secret
- `NEXTAUTH_URL` — full base URL
- `NEXT_PUBLIC_MAPBOX_TOKEN` — URL-restricted Mapbox token
- `READSB_URL` — readsb aggregator endpoint (e.g. `http://readsb:80`)

## Routes

**Public**
- `/` — DZ directory with favorites + search
- `/dz/[slug]` — Dropzone winds, jump run, map, live aircraft
- `/api/spot/[slug]` — Public JSON spot API

**Auth**
- `/login`, `/signup`

**Authenticated**
- `/setup` — New DZ setup wizard
- `/dz/[slug]/settings` — DZ configuration (owner/manager/admin)
- `/claim/[token]` — Accept a DZ claim link
- `/invite/[token]` — Accept a manager invite
- `/admin` — Global admin panel

## Deployment

Dokploy auto-deploys on push:
- `main` → production (spotboard.xyz)
- `dev` → staging (traefik.me dev URL)

Migrations run on container start via `docker-entrypoint.sh`. See `CLAUDE.md` for architecture details.
