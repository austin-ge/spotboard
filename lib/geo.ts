const EARTH_RADIUS_METERS = 6371000;
const EARTH_RADIUS_MILES = 3958.8;

/**
 * Parse a latitude/longitude pair and validate geographic bounds.
 * Returns null if either value is missing, non-numeric, or out of range.
 */
export function parseLatLon(
  lat: unknown,
  lon: unknown
): { lat: number; lon: number } | null {
  const latNum = typeof lat === "number" ? lat : parseFloat(String(lat));
  const lonNum = typeof lon === "number" ? lon : parseFloat(String(lon));
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;
  return { lat: latNum, lon: lonNum };
}

/**
 * Calculate destination point given start, bearing, and distance in miles.
 * Uses haversine formula.
 */
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceMiles: number
): [number, number] {
  const d = distanceMiles / EARTH_RADIUS_MILES;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

/**
 * Distance between two points in meters (haversine)
 */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
