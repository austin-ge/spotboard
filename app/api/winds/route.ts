import { parseOpenMeteoWinds } from "@/lib/winds/parse";
import { NextRequest, NextResponse } from "next/server";

// Server-side cache: 15 min TTL
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon query params required" },
      { status: 400 }
    );
  }

  const cacheKey = `${lat},${lon}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const url = `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}&hourly=${OPEN_METEO_PARAMS}&forecast_hours=24&wind_speed_unit=kmh`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch wind data from Open-Meteo" },
      { status: 502 }
    );
  }

  const raw = await res.json();
  const layers = parseOpenMeteoWinds(raw);

  const data = {
    layers,
    fetchedAt: Date.now(),
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  };

  cache.set(cacheKey, { data, ts: Date.now() });

  return NextResponse.json(data);
}
