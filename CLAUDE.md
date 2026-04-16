# Spotboard

Multi-tenant skydiving dropzone winds & spotting platform. Remake of [spotboard.xyz](https://spotboard.xyz) (original repo: `austin-ge/winds_app`).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Database**: PostgreSQL + Prisma 7
- **Auth**: NextAuth v5 (beta) with Prisma adapter, JWT sessions
- **Maps**: Mapbox GL JS 3.18 + mapbox-gl-draw (token is URL-restricted)
- **Styling**: Tailwind CSS 4
- **Deployment**: Dokploy on VPS via Docker Compose, domain: spotboard.xyz
- **ADS-B**: readsb (ultrafeeder image) as Beast TCP aggregator

## Commands

- `npm run dev` — local dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — run migrations
- `npx prisma generate` — regenerate client
- `npx prisma studio` — DB browser
- `node prisma/seed.cjs` — seed dropzones (run once in prod container)

## Project Structure

```
app/                  # Next.js App Router pages & API routes
  admin/              # Global admin panel (ADMIN role only)
  api/
    adsb/[slug]/      # Live aircraft positions for a DZ
    aircraft-lookup/  # Proxy to adsbdb.com for tail→hex resolution
    auth/             # NextAuth handlers
    claim/            # DZ claim submission / admin approval
    dz/[slug]/        # DZ config CRUD (settings form backend)
    invite/           # Manager invite create / accept
    spot/[slug]/      # Public spot API (heading, offset, winds)
    winds/            # Winds fetch (cached server-side)
  claim/[token]       # Accept a DZ claim link
  dz/[slug]/          # Dropzone view (public, main UI)
  dz/[slug]/settings/ # DZ settings (authenticated, permission-gated)
  invite/[token]      # Accept a manager invite link
  login/  signup/     # Auth pages
  setup/              # DZ setup wizard
lib/
  adsb/               # ADS-B types + readsb fetch
  hooks/              # useWinds, useJumpRun, useAircraft
  winds/              # Forecast engine, jump run, offset, separation
  permissions.ts      # canEditDZ() — owner/manager/admin checks
  domain.ts           # Email domain → DZ auto-verify
  mapStyles.ts  mapZones.ts  geo.ts  slug.ts
components/
  admin/  auth/  dz/  layout/  map/  providers/
prisma/
  schema.prisma       # Database schema
  seed.ts / seed.cjs  # Seed 164 DZs from dropzones.json
auth.ts               # NextAuth configuration
docker-compose.yml    # app + db + readsb services
Dockerfile            # multi-stage Next.js build
docker-entrypoint.sh  # Runs prisma migrate deploy on container start
prisma.config.production.js  # Plain JS config used in container
```

## Conventions

- Use `@/*` path aliases (e.g., `@/lib/winds`, `@/components/map/MapView`)
- Server Components by default; add `"use client"` only when needed (interactivity, hooks, browser APIs like Mapbox)
- Colocate component-specific types in the same file; shared types go in `lib/types.ts` or domain-specific type files (e.g., `lib/adsb/types.ts`)
- Use Prisma for all DB access — no raw SQL
- API routes go in `app/api/` using Next.js Route Handlers
- Permission checks via `canEditDZ()` in `lib/permissions.ts` — never check roles inline
- Environment variables (see `.env.example`):
  - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `NEXT_PUBLIC_MAPBOX_TOKEN` (must be build-time arg for Docker — baked into client JS)
  - `READSB_URL` (e.g. `http://readsb:80`), `READSB_HOST_PORT` (Beast TCP, default 30004)
  - `AUTH_TRUST_HOST=true` required when behind Traefik

## Key Domain Concepts

- **Dropzone (DZ)**: A skydiving facility with location, aircraft, and jump profile config. Each gets a `/dz/[slug]` route.
- **Winds Aloft**: GFS forecast data from Open-Meteo API at pressure levels, mapped to altitudes
- **Jump Run**: The aircraft heading into the wind; auto-calculated from winds at 5k-14k ft
- **Offset / Green Light**: Where to start the jump run, accounting for canopy drift, freefall drift, and ground speed
- **ADS-B**: Central readsb aggregator on the VPS receives Beast TCP from remote feeders (e.g. Pi + RTL-SDR at a DZ) on port 30004. `/api/adsb/[slug]` filters aircraft by the DZ's registered JumpPlane hex codes plus nearby traffic (~30nm).

## Roles & Permissions

- **Global roles** (`UserRole` enum): `JUMPER` (default), `OPERATOR`, `ADMIN`
- **Per-DZ roles** (join tables): `DropzoneManager` (edit config), `DropzoneStaff`
- **Claiming**: Users with email matching a DZ's `verifiedDomains` can auto-claim ownership. System user (`system@spotboard.xyz`) owns seeded DZs until claimed.
- **Invites**: Managers invited via email token (`DropzoneInvite`)
- Bootstrap admin: `austin@spotboard.xyz`

## Branching & Deployment

- `main` — production (spotboard.xyz), auto-deployed by Dokploy on push
- `dev` — staging (traefik.me URL), auto-deployed by Dokploy on push
- Dokploy runs `docker compose up --build`; migrations run via `docker-entrypoint.sh`

## Obsidian Vault

This project is mirrored in the Obsidian vault at `~/Notes/Claude/10 Projects/Spot Board/Spot Board.md`. When significant work is completed (features shipped, deployments, architecture changes), update that note to reflect the current state.

## Session Summaries

When asked to summarize the session, "write it up", or "log this", append a dated entry to `~/Notes/Claude/00 Inbox/Inbox.md` with:
- **Date and project name** as a heading
- What was worked on
- What was completed
- What's still pending or blocked
- Links to relevant files that were created or modified

---

## Skills

When writing React components or pages, use `/vercel-react-best-practices` for performance patterns.
When designing page layouts and UI, use `/frontend-design` for high-quality, polished interfaces.
