import { WindLayer } from "./types";
import { PRESSURE_LEVELS, PRESSURE_ALTITUDES_FT, DISPLAY_ALTITUDES_FT } from "./constants";

interface OpenMeteoHourly {
  time: string[];
  wind_speed_1000hPa?: number[];
  wind_speed_925hPa?: number[];
  wind_speed_850hPa?: number[];
  wind_speed_700hPa?: number[];
  wind_speed_600hPa?: number[];
  wind_direction_1000hPa?: number[];
  wind_direction_925hPa?: number[];
  wind_direction_850hPa?: number[];
  wind_direction_700hPa?: number[];
  wind_direction_600hPa?: number[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
}

function kphToKts(kph: number): number {
  return kph * 0.539957;
}

/**
 * Find the nearest time index in the Open-Meteo response
 */
function findNearestTimeIndex(times: string[]): number {
  const now = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }

  return bestIdx;
}

/**
 * Interpolate wind at a target altitude from pressure-level samples
 * using nearest-neighbor (same as original app)
 */
function interpolateWind(
  targetFt: number,
  pressureWinds: { altFt: number; speedKts: number; dirDeg: number }[]
): { speedKts: number; dirDeg: number } {
  if (pressureWinds.length === 0) return { speedKts: 0, dirDeg: 0 };

  // Find the closest pressure level altitude
  let closest = pressureWinds[0];
  let minDist = Math.abs(targetFt - closest.altFt);

  for (let i = 1; i < pressureWinds.length; i++) {
    const dist = Math.abs(targetFt - pressureWinds[i].altFt);
    if (dist < minDist) {
      minDist = dist;
      closest = pressureWinds[i];
    }
  }

  return { speedKts: closest.speedKts, dirDeg: closest.dirDeg };
}

/**
 * Parse Open-Meteo GFS response into WindLayer[] at display altitudes (0-14k ft)
 */
export function parseOpenMeteoWinds(data: OpenMeteoResponse): WindLayer[] {
  const { hourly } = data;
  const idx = findNearestTimeIndex(hourly.time);

  // Extract winds at each pressure level
  const pressureWinds = PRESSURE_LEVELS.map((level, i) => {
    const speedKey = `wind_speed_${level}hPa` as keyof OpenMeteoHourly;
    const dirKey = `wind_direction_${level}hPa` as keyof OpenMeteoHourly;

    const speeds = hourly[speedKey] as number[] | undefined;
    const dirs = hourly[dirKey] as number[] | undefined;

    return {
      altFt: PRESSURE_ALTITUDES_FT[i],
      speedKts: speeds?.[idx] ? kphToKts(speeds[idx]) : 0,
      dirDeg: dirs?.[idx] ?? 0,
    };
  });

  // Interpolate to display altitudes
  return DISPLAY_ALTITUDES_FT.map((altFt) => {
    const { speedKts, dirDeg } = interpolateWind(altFt, pressureWinds);
    return {
      altitudeFt: altFt,
      speedKts: Math.round(speedKts),
      directionDeg: Math.round(dirDeg),
    };
  });
}
