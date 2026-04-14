import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildDropzoneConfig } from "@/lib/winds/config";
import { computeJumpRun } from "@/lib/winds/jumprun";
import { parseOpenMeteoWinds } from "@/lib/winds/parse";

const OPEN_METEO_PARAMS = [
  "wind_speed_1000hPa",
  "wind_speed_925hPa",
  "wind_speed_850hPa",
  "wind_speed_700hPa",
  "wind_speed_600hPa",
  "wind_direction_1000hPa",
  "wind_direction_925hPa",
  "wind_direction_850hPa",
  "wind_direction_700hPa",
  "wind_direction_600hPa",
].join(",");

// Simple cache to avoid hammering Open-Meteo
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const dz = await prisma.dropzone.findUnique({ where: { slug } });
  if (!dz) {
    return NextResponse.json({ error: "Dropzone not found" }, { status: 404 });
  }

  // Fetch winds (with cache)
  const cacheKey = `${dz.lat},${dz.lon}`;
  let layers;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    layers = cached.data as ReturnType<typeof parseOpenMeteoWinds>;
  } else {
    const url = `https://api.open-meteo.com/v1/gfs?latitude=${dz.lat}&longitude=${dz.lon}&hourly=${OPEN_METEO_PARAMS}&forecast_hours=24&wind_speed_unit=kmh`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wind data" },
        { status: 502 }
      );
    }
    const raw = await res.json();
    layers = parseOpenMeteoWinds(raw);
    cache.set(cacheKey, { data: layers, ts: Date.now() });
  }

  const config = buildDropzoneConfig(dz);
  const jumpRun = computeJumpRun(layers, config);

  return NextResponse.json({
    dropzone: {
      name: dz.name,
      slug: dz.slug,
      lat: dz.lat,
      lon: dz.lon,
    },
    spot: {
      headingDeg: jumpRun.headingDeg,
      headingMode: jumpRun.headingMode,
      offsetMiles: jumpRun.offsetMiles,
      groundSpeedKts: jumpRun.groundSpeedKts,
      separationSeconds: jumpRun.separationSeconds,
    },
    winds: layers,
    fetchedAt: Date.now(),
  });
}
