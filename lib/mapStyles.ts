export const MAP_STYLES = {
  SATELLITE: {
    url: "mapbox://styles/mapbox/satellite-v9",
    label: "Satellite",
  },
  SATELLITE_STREETS: {
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    label: "Satellite + Streets",
  },
  OUTDOORS: {
    url: "mapbox://styles/mapbox/outdoors-v12",
    label: "Outdoors",
  },
  STREETS: {
    url: "mapbox://styles/mapbox/streets-v12",
    label: "Streets",
  },
  LIGHT: {
    url: "mapbox://styles/mapbox/light-v11",
    label: "Light",
  },
  DARK: {
    url: "mapbox://styles/mapbox/dark-v11",
    label: "Dark",
  },
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export function getMapStyleUrl(style?: string): string {
  const key = (style ?? "SATELLITE_STREETS") as MapStyleKey;
  return MAP_STYLES[key]?.url ?? MAP_STYLES.SATELLITE_STREETS.url;
}
