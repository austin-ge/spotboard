export interface MapZone {
  id: string;
  label: string;
  color: string;
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

export type MapZonesData = MapZone[];

export const ZONE_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
] as const;

export const MAX_ZONES = 20;

export function parseMapZones(json: unknown): MapZonesData {
  if (!json || !Array.isArray(json)) return [];

  return json.filter(
    (z): z is MapZone =>
      z != null &&
      typeof z === "object" &&
      typeof z.id === "string" &&
      typeof z.label === "string" &&
      typeof z.color === "string" &&
      z.geometry != null &&
      z.geometry.type === "Polygon" &&
      Array.isArray(z.geometry.coordinates)
  );
}
