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

export interface JumpRunResult {
  headingDeg: number; // aircraft heading INTO the wind
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
