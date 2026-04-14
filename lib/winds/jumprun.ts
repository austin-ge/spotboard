import type { WindLayer, JumpRunResult, DropzoneConfig, DriftParams, HeadingConfig } from "./types";
import { KTS_TO_MPH } from "./constants";
import { DEFAULT_DROPZONE_CONFIG } from "./constants";

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
 * Smallest signed angle difference (−180 to +180)
 */
function angleDiff(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return d;
}

/**
 * Calculate jump run heading using speed-weighted vector average of winds at 5k-14k ft.
 * Returns heading INTO the wind (aircraft heading).
 */
export function calculateAutoHeading(layers: WindLayer[]): number {
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
 * Pick which runway heading is most into the wind.
 */
export function calculateRunwayHeading(
  layers: WindLayer[],
  rwy1Deg: number,
  rwy2Deg: number
): number {
  const autoHeading = calculateAutoHeading(layers);
  const diff1 = Math.abs(angleDiff(autoHeading, rwy1Deg));
  const diff2 = Math.abs(angleDiff(autoHeading, rwy2Deg));
  return diff1 <= diff2 ? rwy1Deg : rwy2Deg;
}

/**
 * Dispatch heading calculation based on mode.
 */
export function resolveHeading(
  layers: WindLayer[],
  config: HeadingConfig
): number {
  switch (config.mode) {
    case "RUNWAY":
      if (config.runwayHeading1Deg != null && config.runwayHeading2Deg != null) {
        return calculateRunwayHeading(layers, config.runwayHeading1Deg, config.runwayHeading2Deg);
      }
      return calculateAutoHeading(layers);
    case "FIXED":
      if (config.fixedHeadingDeg != null) {
        return config.fixedHeadingDeg;
      }
      return calculateAutoHeading(layers);
    case "AUTO":
    default:
      return calculateAutoHeading(layers);
  }
}

/**
 * Calculate offset in miles from DZ center.
 * Positive = upwind. Based on original computeOffsetMiles.
 */
export function calculateOffset(
  layers: WindLayer[],
  headingDeg: number,
  profile: DropzoneConfig["profile"],
  drift: DriftParams
): number {
  const headingRad = (headingDeg * Math.PI) / 180;

  // 1. Canopy drift: opening alt → holding area alt
  //    Net drift = wind pushes canopy downwind, canopy flies upwind at forward speed.
  //    Positive component = headwind (pushes jumper back from DZ along jump run).
  //    Canopy forward speed opposes wind, reducing net drift.
  let canopyDriftMiles = 0;
  const canopyAltRange = profile.openingAltitudeFt - profile.holdingAreaAltitudeFt;
  const canopyTimeMins = canopyAltRange / (drift.canopyDescentRateMph * 5280 / 60);

  for (const layer of layers) {
    if (
      layer.altitudeFt < profile.holdingAreaAltitudeFt ||
      layer.altitudeFt > profile.openingAltitudeFt
    )
      continue;

    const windSpeedMph = layer.speedKts * KTS_TO_MPH;
    const windDirRad = (layer.directionDeg * Math.PI) / 180;
    const windComponent = windSpeedMph * Math.cos(windDirRad - headingRad);
    // Net drift: wind pushes jumper, canopy forward speed pulls them back
    const netComponent = windComponent - drift.canopyForwardSpeedMph;
    const layerFraction = 1000 / canopyAltRange;
    const layerTimeHrs = (canopyTimeMins * layerFraction) / 60;
    canopyDriftMiles += netComponent * layerTimeHrs;
  }

  // 2. Freefall drift: exit alt → opening alt
  const freefallAltRange = profile.exitAltitudeFt - profile.openingAltitudeFt;
  const freefallTimeHrs = freefallAltRange / (drift.freefallTerminalVelocityMph * 5280) * 60 / 60;

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

  // 3. Total offset
  const totalOffset =
    canopyDriftMiles + freefallDriftMiles +
    drift.lightToDoorMiles + drift.airplaneDriftMiles;

  return Math.max(-drift.maxOffsetMiles, Math.min(drift.maxOffsetMiles, totalOffset));
}

/**
 * Calculate ground speed (knots) based on wind component along heading + airspeed
 */
export function calculateGroundSpeed(
  layers: WindLayer[],
  headingDeg: number,
  airspeedKts: number
): number {
  const wind = windAt(layers, 12000);
  const headingRad = (headingDeg * Math.PI) / 180;
  const windDirRad = (wind.directionDeg * Math.PI) / 180;
  const headwindKts = wind.speedKts * Math.cos(windDirRad - headingRad);
  return Math.max(0, Math.round(airspeedKts - headwindKts));
}

/**
 * Look up exit separation time from ground speed using a separation table
 */
export function calculateSeparation(
  groundSpeedKts: number,
  table: [number, number][]
): number {
  for (const [speed, seconds] of table) {
    if (groundSpeedKts >= speed) return seconds;
  }
  return table[table.length - 1][1];
}

/**
 * Compute full jump run from wind data and dropzone config
 */
export function computeJumpRun(
  layers: WindLayer[],
  config: DropzoneConfig = DEFAULT_DROPZONE_CONFIG
): JumpRunResult {
  const headingDeg = resolveHeading(layers, config.heading);
  const offsetMiles = calculateOffset(layers, headingDeg, config.profile, config.drift);
  const groundSpeedKts = calculateGroundSpeed(
    layers,
    headingDeg,
    config.profile.jumpRunAirspeedKnots
  );
  const separationSeconds = calculateSeparation(groundSpeedKts, config.separationTable);

  return {
    headingDeg,
    headingMode: config.heading.mode,
    offsetMiles: Math.round(offsetMiles * 100) / 100,
    groundSpeedKts,
    separationSeconds,
  };
}
