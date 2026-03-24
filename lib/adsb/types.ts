/** Single aircraft position from readsb */
export interface AircraftPosition {
  /** ICAO 24-bit hex code (lowercase) */
  hex: string;
  /** Tail number (from our DB, not ADS-B) */
  tailNumber?: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Barometric altitude in feet */
  altitudeFt: number | null;
  /** Ground speed in knots */
  groundSpeedKts: number | null;
  /** True track heading in degrees */
  trackDeg: number | null;
  /** Vertical rate in ft/min */
  verticalRateFpm: number | null;
  /** Squawk code */
  squawk: string | null;
  /** Whether this is a registered DZ jump plane */
  isJumpPlane: boolean;
  /** Seconds since last message from this aircraft */
  seenSec: number;
}

/** Response from /api/adsb/[slug] */
export interface AircraftData {
  aircraft: AircraftPosition[];
  fetchedAt: number;
  /** Number of total aircraft seen by aggregator (before filtering) */
  totalSeen: number;
}

/** Raw aircraft entry from readsb aircraft.json */
export interface ReadsbAircraft {
  hex: string;
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | string;
  gs?: number;
  track?: number;
  baro_rate?: number;
  squawk?: string;
  seen?: number;
  seen_pos?: number;
  rssi?: number;
  [key: string]: unknown;
}

/** Raw readsb aircraft.json response */
export interface ReadsbResponse {
  now: number;
  messages: number;
  aircraft: ReadsbAircraft[];
}
