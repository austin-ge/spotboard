# Spotboard

Multi-tenant skydiving dropzone winds & spotting platform. Remake of [spotboard.xyz](https://spotboard.xyz) (original repo: `austin-ge/winds_app`).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Database**: PostgreSQL + Prisma 7
- **Auth**: NextAuth v5 (beta) with Prisma adapter, JWT sessions
- **Maps**: Mapbox GL JS 3.18 (token is URL-restricted)
- **Styling**: Tailwind CSS 4
- **Deployment**: Dokploy on VPS, domain: spotboard.xyz

## Commands

- `npm run dev` — local dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — run migrations
- `npx prisma generate` — regenerate client
- `npx prisma studio` — DB browser

## Project Structure

```
app/                  # Next.js App Router pages & API routes
  api/                # API route handlers
  dz/[slug]/          # Dropzone view (public, main UI)
  login/              # Auth pages
  signup/
  setup/              # DZ setup wizard (authenticated)
lib/                  # Shared utilities (winds engine, calculations, etc.)
components/           # React components
prisma/
  schema.prisma       # Database schema
auth.ts               # NextAuth configuration
```

## Conventions

- Use `@/*` path aliases (e.g., `@/lib/winds`, `@/components/Map`)
- Server Components by default; add `"use client"` only when needed (interactivity, hooks, browser APIs like Mapbox)
- Colocate component-specific types in the same file; shared types go in `lib/types.ts`
- Use Prisma for all DB access — no raw SQL
- API routes go in `app/api/` using Next.js Route Handlers
- Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_MAPBOX_TOKEN`

## Key Domain Concepts

- **Dropzone (DZ)**: A skydiving facility with location, aircraft, and jump profile config
- **Winds Aloft**: GFS forecast data from Open-Meteo API at pressure levels, mapped to altitudes
- **Jump Run**: The aircraft heading into the wind; auto-calculated from winds at 5k-14k ft
- **Offset / Green Light**: Where to start the jump run, accounting for canopy drift, freefall drift, and ground speed
- **ADS-B**: Aircraft tracking via dump1090 (local receiver) or adsb.lol (public fallback)

## Skills

When writing React components or pages, use `/vercel-react-best-practices` for performance patterns.
When designing page layouts and UI, use `/frontend-design` for high-quality, polished interfaces.
