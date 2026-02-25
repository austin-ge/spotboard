import { WindLayer } from "./types";

/**
 * 8-way cardinal direction arrow character
 */
export function getWindArrow(dirDeg: number): string {
  // Wind direction is where it's coming FROM
  // Arrow points in the direction wind is GOING (opposite)
  const goingDeg = (dirDeg + 180) % 360;
  const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
  const idx = Math.round(goingDeg / 45) % 8;
  return arrows[idx];
}

/**
 * Cardinal direction label (N, NE, E, etc.)
 */
export function getWindCardinal(dirDeg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(dirDeg / 45) % 8;
  return dirs[idx];
}

/**
 * Wind speed severity class
 */
export function getWindSpeedClass(
  speedKts: number
): "calm" | "light" | "moderate" | "strong" {
  if (speedKts < 5) return "calm";
  if (speedKts < 15) return "light";
  if (speedKts <= 25) return "moderate";
  return "strong";
}

/**
 * Color for wind speed
 */
export function getWindSpeedColor(speedKts: number): string {
  const cls = getWindSpeedClass(speedKts);
  switch (cls) {
    case "calm":
      return "#9ca3af"; // gray
    case "light":
      return "#22c55e"; // green
    case "moderate":
      return "#eab308"; // yellow
    case "strong":
      return "#ef4444"; // red
  }
}

/**
 * Group consecutive wind layers with identical speed + direction into ranges
 * e.g., "3,000 - 5,000 ft" instead of three separate rows
 */
export function groupWindsByRange(
  layers: WindLayer[]
): {
  lowFt: number;
  highFt: number;
  speedKts: number;
  directionDeg: number;
}[] {
  if (layers.length === 0) return [];

  const sorted = [...layers].sort((a, b) => a.altitudeFt - b.altitudeFt);
  const groups: {
    lowFt: number;
    highFt: number;
    speedKts: number;
    directionDeg: number;
  }[] = [];

  let current = {
    lowFt: sorted[0].altitudeFt,
    highFt: sorted[0].altitudeFt,
    speedKts: sorted[0].speedKts,
    directionDeg: sorted[0].directionDeg,
  };

  for (let i = 1; i < sorted.length; i++) {
    const layer = sorted[i];
    if (
      layer.speedKts === current.speedKts &&
      layer.directionDeg === current.directionDeg
    ) {
      current.highFt = layer.altitudeFt;
    } else {
      groups.push({ ...current });
      current = {
        lowFt: layer.altitudeFt,
        highFt: layer.altitudeFt,
        speedKts: layer.speedKts,
        directionDeg: layer.directionDeg,
      };
    }
  }

  groups.push(current);
  return groups;
}
