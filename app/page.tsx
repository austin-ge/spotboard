import Link from "next/link";
import { prisma } from "@/lib/db";
import DirectorySearch from "@/components/dz/DirectorySearch";

export const dynamic = "force-dynamic";

const READSB_URL = process.env.READSB_URL ?? "http://localhost:8078";
const COVERAGE_RADIUS_DEG = 2.5; // ~150nm — conservative feeder range

// Cache coverage check for 10 minutes
let coverageCache: { slugs: Set<string>; ts: number } | null = null;
const COVERAGE_TTL = 10 * 60 * 1000;

async function getAdsbCoverageSlugs(
  dropzones: { slug: string; lat: number; lon: number }[]
): Promise<Set<string>> {
  if (coverageCache && Date.now() - coverageCache.ts < COVERAGE_TTL) {
    return coverageCache.slugs;
  }

  try {
    const res = await fetch(`${READSB_URL}/data/aircraft.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return new Set();

    const data = await res.json();
    const aircraft: { lat?: number; lon?: number }[] = data.aircraft ?? [];

    // Build set of aircraft positions with valid coordinates
    const positions = aircraft.filter(
      (ac): ac is { lat: number; lon: number } =>
        ac.lat != null && ac.lon != null
    );

    // For each DZ, check if any aircraft is within range
    const covered = new Set<string>();
    for (const dz of dropzones) {
      const hasCoverage = positions.some(
        (ac) =>
          Math.abs(ac.lat - dz.lat) < COVERAGE_RADIUS_DEG &&
          Math.abs(ac.lon - dz.lon) < COVERAGE_RADIUS_DEG
      );
      if (hasCoverage) covered.add(dz.slug);
    }

    coverageCache = { slugs: covered, ts: Date.now() };
    return covered;
  } catch {
    return new Set();
  }
}

export default async function HomePage() {
  const dropzones = await prisma.dropzone.findMany({
    where: { isPublic: true },
    select: {
      slug: true,
      name: true,
      lat: true,
      lon: true,
      airportCode: true,
      _count: { select: { jumpPlanes: true } },
    },
    orderBy: { name: "asc" },
  });

  const coverageSlugs = await getAdsbCoverageSlugs(dropzones);

  return (
    <main className="min-h-screen bg-[#080c14] relative overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14] via-[#0d1424] to-[#111a2e]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#0f1b3d]/40 via-transparent to-transparent" />

      <div className="relative z-10">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
          <div className="flex items-end gap-4 mb-2">
            <h1 className="text-5xl font-extrabold tracking-tighter text-white leading-none">
              Spotboard
            </h1>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mb-2.5 led-glow" style={{ color: "#34d399" }} />
          </div>
          <p className="text-[15px] text-slate-500 font-light tracking-wide">
            Live winds & spotting across{" "}
            <span className="text-slate-300 font-medium tabular-nums">
              {dropzones.length}
            </span>{" "}
            dropzones
          </p>
        </div>

        {/* Directory */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {dropzones.length > 0 ? (
            <DirectorySearch
              dropzones={dropzones.map((dz) => ({
                ...dz,
                hasAdsb: dz._count.jumpPlanes > 0,
                hasAdsbCoverage: coverageSlugs.has(dz.slug),
              }))}
            />
          ) : (
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm text-center py-16 px-8">
              <p className="text-slate-500 mb-5">No dropzones yet.</p>
              <Link
                href="/setup"
                className="inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Create the first one
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
