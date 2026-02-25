export interface WindLayer {
  altitudeFt: number;
  speedKts: number;
  directionDeg: number; // meteorological: direction wind is coming FROM
}

export interface JumpProfile {
  exitAltitudeFt: number;
  openingAltitudeFt: number;
  holdingAreaAltitudeFt: number;
  patternAltitudeFt: number;
  jumpRunAirspeedKnots: number;
}

export type HeadingMode = "AUTO" | "RUNWAY" | "FIXED";

export interface HeadingConfig {
  mode: HeadingMode;
  fixedHeadingDeg?: number;
  runwayHeading1Deg?: number;
  runwayHeading2Deg?: number;
}

export interface DriftParams {
  canopyForwardSpeedMph: number;
  canopyDescentRateMph: number;
  freefallTerminalVelocityMph: number;
  lightToDoorMiles: number;
  airplaneDriftMiles: number;
  maxOffsetMiles: number;
  jumpRunLengthMiles: number;
}

export interface DropzoneConfig {
  profile: JumpProfile;
  heading: HeadingConfig;
  drift: DriftParams;
  aircraftName?: string;
  aircraftCruiseSpeedKts?: number;
  separationTable: [number, number][];
}

export interface JumpRunResult {
  headingDeg: number; // aircraft heading INTO the wind
  headingMode: HeadingMode;
  offsetMiles: number; // positive = upwind of DZ
  groundSpeedKts: number;
  separationSeconds: number;
}

export interface WindsData {
  layers: WindLayer[];
  fetchedAt: number; // unix timestamp ms
  lat: number;
  lon: number;
}
