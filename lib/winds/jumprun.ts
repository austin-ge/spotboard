import { WindLayer, JumpProfile, JumpRunResult } from "./types";
import {
  KTS_TO_MPH,
  CANOPY_FORWARD_SPEED_MPH,
  CANOPY_DESCENT_RATE_MPH,
  FREEFALL_TERMINAL_VELOCITY_MPH,
  LIGHT_TO_DOOR_MILES,
  AIRPLANE_DRIFT_MILES,
  MAX_OFFSET_MILES,
  SEPARATION_TABLE,
} from "./constants";

/**
 * Get wind at a specific altitude by nearest-neighbor lookup
 */
function windAt(layers: WindLayer[], altFt: number): WindLayer {
  let best = layers[0];
  let minDist = Math.abs(altFt - best.altitudeFt);
  for (const l of layers) {
    const dist = Math.abs(altFt - l.altitudeFt);
    if (dist < minDist) {
      minDist = dist;
      best = l;
    }
  }
  return best;
}

/**
 * Calculate jump run heading using speed-weighted vector average of winds at 5k-14k ft.
 * Returns heading INTO the wind (aircraft heading).
 */
export function calculateHeading(layers: WindLayer[]): number {
  let uSum = 0;
  let vSum = 0;
  let weightSum = 0;

  for (const layer of layers) {
    if (layer.altitudeFt < 5000 || layer.altitudeFt > 14000) continue;
    const speedMph = layer.speedKts * KTS_TO_MPH;
    const dirRad = (layer.directionDeg * Math.PI) / 180;

    // Wind FROM direction → u/v components
    uSum += speedMph * Math.sin(dirRad) * speedMph;
    vSum += speedMph * Math.cos(dirRad) * speedMph;
    weightSum += speedMph;
  }

  if (weightSum === 0) return 0;

  // Average wind direction (wind is coming FROM)
  const avgDir = (Math.atan2(uSum / weightSum, vSum / weightSum) * 180) / Math.PI;

  // Aircraft heading INTO the wind (opposite direction)
  const heading = (avgDir + 360) % 360;
  return Math.round(heading);
}

/**
 * Calculate offset in miles from DZ center.
 * Positive = upwind. Based on original computeOffsetMiles.
 */
export function calculateOffset(
  layers: WindLayer[],
  headingDeg: number,
  profile: JumpProfile
): number {
  const headingRad = (headingDeg * Math.PI) / 180;

  // 1. Canopy drift: opening alt → holding area alt
  // Layer-by-layer wind integration
  let canopyDriftMiles = 0;
  const canopyAltRange = profile.openingAltitudeFt - profile.holdingAreaAltitudeFt;
  const canopyTimeMins = canopyAltRange / (CANOPY_DESCENT_RATE_MPH * 5280 / 60);

  for (const layer of layers) {
    if (
      layer.altitudeFt < profile.holdingAreaAltitudeFt ||
      layer.altitudeFt > profile.openingAltitudeFt
    )
      continue;

    const windSpeedMph = layer.speedKts * KTS_TO_MPH;
    const windDirRad = (layer.directionDeg * Math.PI) / 180;

    // Wind component along jump run heading (positive = headwind)
    const component =
      windSpeedMph *
      Math.cos(windDirRad - headingRad);

    // Time spent in this layer (proportional)
    const layerFraction = 1000 / canopyAltRange;
    const layerTimeHrs = (canopyTimeMins * layerFraction) / 60;

    canopyDriftMiles += component * layerTimeHrs;
  }

  // 2. Opening point offset — canopy flies upwind at forward speed
  const openingTimeHrs =
    (profile.openingAltitudeFt - profile.holdingAreaAltitudeFt) /
    (CANOPY_DESCENT_RATE_MPH * 5280) * 60 / 60;
  const openingOffsetMiles = CANOPY_FORWARD_SPEED_MPH * openingTimeHrs;

  // 3. Freefall drift: exit alt → opening alt
  const freefallAltRange = profile.exitAltitudeFt - profile.openingAltitudeFt;
  const freefallTimeHrs = freefallAltRange / (FREEFALL_TERMINAL_VELOCITY_MPH * 5280) * 60 / 60;

  let freefallDriftMiles = 0;
  for (const layer of layers) {
    if (
      layer.altitudeFt < profile.openingAltitudeFt ||
      layer.altitudeFt > profile.exitAltitudeFt
    )
      continue;

    const windSpeedMph = layer.speedKts * KTS_TO_MPH;
    const windDirRad = (layer.directionDeg * Math.PI) / 180;
    const component = windSpeedMph * Math.cos(windDirRad - headingRad);
    const layerFraction = 1000 / freefallAltRange;
    freefallDriftMiles += component * layerFraction * freefallTimeHrs;
  }

  // 4. Total offset
  const totalOffset =
    canopyDriftMiles + openingOffsetMiles + freefallDriftMiles +
    LIGHT_TO_DOOR_MILES + AIRPLANE_DRIFT_MILES;

  // Clamp
  return Math.max(-MAX_OFFSET_MILES, Math.min(MAX_OFFSET_MILES, totalOffset));
}

/**
 * Calculate ground speed (knots) based on wind component along heading + airspeed
 */
export function calculateGroundSpeed(
  layers: WindLayer[],
  headingDeg: number,
  airspeedKts: number
): number {
  // Use winds at typical jump run altitude (~12k ft)
  const wind = windAt(layers, 12000);
  const headingRad = (headingDeg * Math.PI) / 180;
  const windDirRad = (wind.directionDeg * Math.PI) / 180;

  // Headwind component (positive = headwind, reduces ground speed)
  const headwindKts = wind.speedKts * Math.cos(windDirRad - headingRad);

  // Ground speed = airspeed - headwind
  return Math.max(0, Math.round(airspeedKts - headwindKts));
}

/**
 * Look up exit separation time from ground speed
 */
export function calculateSeparation(groundSpeedKts: number): number {
  for (const [speed, seconds] of SEPARATION_TABLE) {
    if (groundSpeedKts >= speed) return seconds;
  }
  return SEPARATION_TABLE[SEPARATION_TABLE.length - 1][1];
}

/**
 * Compute full jump run from wind data and profile
 */
export function computeJumpRun(
  layers: WindLayer[],
  profile: JumpProfile
): JumpRunResult {
  const headingDeg = calculateHeading(layers);
  const offsetMiles = calculateOffset(layers, headingDeg, profile);
  const groundSpeedKts = calculateGroundSpeed(
    layers,
    headingDeg,
    profile.jumpRunAirspeedKnots
  );
  const separationSeconds = calculateSeparation(groundSpeedKts);

  return {
    headingDeg,
    offsetMiles: Math.round(offsetMiles * 100) / 100,
    groundSpeedKts,
    separationSeconds,
  };
}
