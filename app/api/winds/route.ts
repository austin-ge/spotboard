import { TTLCache } from "@/lib/cache";
import { parseLatLon } from "@/lib/geo";
import { parseOpenMeteoWinds } from "@/lib/winds/parse";
import { NextRequest, NextResponse } from "next/server";

// Server-side cache: 15 min TTL
const cache = new TTLCache<unknown>(15 * 60 * 1000);

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
  const coords = parseLatLon(searchParams.get("lat"), searchParams.get("lon"));

  if (!coords) {
    return NextResponse.json(
      { error: "Valid lat and lon query params required" },
      { status: 400 }
    );
  }

  const cacheKey = `${coords.lat},${coords.lon}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const url = `https://api.open-meteo.com/v1/gfs?latitude=${coords.lat}&longitude=${coords.lon}&hourly=${OPEN_METEO_PARAMS}&forecast_hours=24&wind_speed_unit=kmh`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    return NextResponse.json(
      { error: "Wind data provider timed out" },
      { status: 504 }
    );
  }
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
    lat: coords.lat,
    lon: coords.lon,
  };

  cache.set(cacheKey, data);

  return NextResponse.json(data);
}
