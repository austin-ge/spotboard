import type { Dropzone } from "@prisma/client";
import type { DropzoneConfig } from "./types";
import {
  DEFAULT_JUMP_PROFILE,
  DEFAULT_HEADING_CONFIG,
  DEFAULT_DRIFT_PARAMS,
  SEPARATION_TABLE,
} from "./constants";

/**
 * Build a fully-resolved DropzoneConfig from a Prisma Dropzone record.
 * Nullable DB fields fall back to defaults.
 */
export function buildDropzoneConfig(dz: Dropzone): DropzoneConfig {
  return {
    profile: {
      exitAltitudeFt: dz.exitAltitudeFt ?? DEFAULT_JUMP_PROFILE.exitAltitudeFt,
      openingAltitudeFt: dz.openingAltitudeFt ?? DEFAULT_JUMP_PROFILE.openingAltitudeFt,
      holdingAreaAltitudeFt: dz.holdingAreaAltitudeFt ?? DEFAULT_JUMP_PROFILE.holdingAreaAltitudeFt,
      patternAltitudeFt: dz.patternAltitudeFt ?? DEFAULT_JUMP_PROFILE.patternAltitudeFt,
      jumpRunAirspeedKnots: dz.jumpRunAirspeedKnots ?? DEFAULT_JUMP_PROFILE.jumpRunAirspeedKnots,
    },
    heading: {
      mode: dz.headingMode ?? DEFAULT_HEADING_CONFIG.mode,
      fixedHeadingDeg: dz.fixedHeadingDeg ?? undefined,
      runwayHeading1Deg: dz.runwayHeading1Deg ?? undefined,
      runwayHeading2Deg: dz.runwayHeading2Deg ?? undefined,
    },
    drift: {
      canopyForwardSpeedMph: dz.canopyForwardSpeedMph ?? DEFAULT_DRIFT_PARAMS.canopyForwardSpeedMph,
      canopyDescentRateMph: dz.canopyDescentRateMph ?? DEFAULT_DRIFT_PARAMS.canopyDescentRateMph,
      freefallTerminalVelocityMph: dz.freefallTerminalVelocityMph ?? DEFAULT_DRIFT_PARAMS.freefallTerminalVelocityMph,
      lightToDoorMiles: dz.lightToDoorMiles ?? DEFAULT_DRIFT_PARAMS.lightToDoorMiles,
      airplaneDriftMiles: dz.airplaneDriftMiles ?? DEFAULT_DRIFT_PARAMS.airplaneDriftMiles,
      maxOffsetMiles: dz.maxOffsetMiles ?? DEFAULT_DRIFT_PARAMS.maxOffsetMiles,
      jumpRunLengthMiles: dz.jumpRunLengthMiles ?? DEFAULT_DRIFT_PARAMS.jumpRunLengthMiles,
    },
    aircraftName: dz.aircraftName ?? undefined,
    aircraftCruiseSpeedKts: dz.aircraftCruiseSpeedKts ?? undefined,
    separationTable: parseSeparationTable(dz.separationTableJson) ?? SEPARATION_TABLE,
  };
}

function parseSeparationTable(json: unknown): [number, number][] | null {
  if (!json || !Array.isArray(json)) return null;
  const valid = json.every(
    (row) => Array.isArray(row) && row.length === 2 && typeof row[0] === "number" && typeof row[1] === "number"
  );
  return valid ? (json as [number, number][]) : null;
}
