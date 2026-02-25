// Pressure levels used in Open-Meteo GFS API
// Maps: 1000hPa ≈ 361ft, 925hPa ≈ 2,500ft, 850hPa ≈ 4,781ft, 700hPa ≈ 9,882ft, 600hPa ≈ 13,780ft
export const PRESSURE_LEVELS = [1000, 925, 850, 700, 600] as const;
export const PRESSURE_ALTITUDES_FT = [361, 2500, 4781, 9882, 13780] as const;

// Display altitudes: 0 to 14,000 ft in 1,000 ft increments
export const DISPLAY_ALTITUDES_FT = [
  0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
  12000, 13000, 14000,
] as const;

// Jump run calculation defaults
export const DEFAULT_JUMP_PROFILE: {
  exitAltitudeFt: number;
  openingAltitudeFt: number;
  holdingAreaAltitudeFt: number;
  patternAltitudeFt: number;
  jumpRunAirspeedKnots: number;
} = {
  exitAltitudeFt: 14000,
  openingAltitudeFt: 4000,
  holdingAreaAltitudeFt: 2500,
  patternAltitudeFt: 1000,
  jumpRunAirspeedKnots: 90,
};

// Canopy and freefall parameters
export const FREEFALL_TERMINAL_VELOCITY_MPH = 120;
export const CANOPY_DESCENT_RATE_MPH = 15;
export const CANOPY_FORWARD_SPEED_MPH = 25;

// Jump run geometry
export const JUMP_RUN_LENGTH_MILES = 0.8;
export const LIGHT_TO_DOOR_MILES = 0.1;
export const AIRPLANE_DRIFT_MILES = 0.0;
export const MAX_OFFSET_MILES = 4.0;

// Unit conversions
export const KTS_TO_MPH = 1.15078;
export const MPH_TO_KTS = 1 / KTS_TO_MPH;
export const MILES_TO_NM = 1 / 1.15078;
export const NM_TO_MILES = 1.15078;

// Ground speed → separation lookup (from original app)
export const SEPARATION_TABLE: [number, number][] = [
  [100, 6],
  [90, 7],
  [80, 8],
  [70, 10],
  [60, 12],
  [50, 15],
  [40, 18],
  [30, 22],
  [20, 30],
];

// Default configs for DropzoneConfig
import type { HeadingConfig, DriftParams, DropzoneConfig } from "./types";

export const DEFAULT_HEADING_CONFIG: HeadingConfig = {
  mode: "AUTO",
};

export const DEFAULT_DRIFT_PARAMS: DriftParams = {
  canopyForwardSpeedMph: CANOPY_FORWARD_SPEED_MPH,
  canopyDescentRateMph: CANOPY_DESCENT_RATE_MPH,
  freefallTerminalVelocityMph: FREEFALL_TERMINAL_VELOCITY_MPH,
  lightToDoorMiles: LIGHT_TO_DOOR_MILES,
  airplaneDriftMiles: AIRPLANE_DRIFT_MILES,
  maxOffsetMiles: MAX_OFFSET_MILES,
  jumpRunLengthMiles: JUMP_RUN_LENGTH_MILES,
};

export const DEFAULT_DROPZONE_CONFIG: DropzoneConfig = {
  profile: DEFAULT_JUMP_PROFILE,
  heading: DEFAULT_HEADING_CONFIG,
  drift: DEFAULT_DRIFT_PARAMS,
  separationTable: SEPARATION_TABLE,
};
