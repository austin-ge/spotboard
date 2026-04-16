"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { JumpRunResult } from "@/lib/winds/types";
import type { MapZonesData } from "@/lib/mapZones";
import type { AircraftPosition } from "@/lib/adsb/types";
import { destinationPoint } from "@/lib/geo";
import { JUMP_RUN_LENGTH_MILES } from "@/lib/winds/constants";
import { getMapStyleUrl } from "@/lib/mapStyles";

// Top-down plane silhouettes — nose points up (north/0°) so icon-rotate matches track heading
const JUMP_PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 64 64"><path d="M 0 -28 C -4.5 -28 -6 -23 -6 -16 L -6 -4 L -29 3 L -29 8 L -6 6 L -6 16 L -14 21 L -14 23 L 0 20 L 14 23 L 14 21 L 6 16 L 6 6 L 29 8 L 29 3 L 6 -4 L 6 -16 C 6 -23 4.5 -28 0 -28 Z" fill="white"/></svg>`;

const TRAFFIC_PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 64 64"><path d="M 0 -25 L -2.2 -22 L -2.2 -4 L -25 4 L -25 8 L -2.2 5.5 L -2.2 15 L -9 19.5 L -9 21 L 0 18.5 L 9 21 L 9 19.5 L 2.2 15 L 2.2 5.5 L 25 8 L 25 4 L 2.2 -4 L 2.2 -22 Z" fill="white"/></svg>`;

async function addPlaneImage(map: mapboxgl.Map, name: string, svg: string): Promise<void> {
  if (map.hasImage(name)) return;
  const size = 128;
  const img = new window.Image(size, size);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`failed to load ${name} SVG`));
  });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  if (!map.hasImage(name)) {
    map.addImage(name, imageData, { sdf: true, pixelRatio: 2 });
  }
}

function polygonCentroid(coords: [number, number][]): [number, number] {
  if (!coords || coords.length === 0) return [0, 0];
  let lngSum = 0;
  let latSum = 0;
  // Exclude the closing coordinate (same as first)
  const n = coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]
    ? coords.length - 1
    : coords.length;
  if (n === 0) return [0, 0];
  for (let i = 0; i < n; i++) {
    lngSum += coords[i][0];
    latSum += coords[i][1];
  }
  return [lngSum / n, latSum / n];
}

interface MapViewProps {
  lat: number;
  lon: number;
  jumpRun: JumpRunResult | null;
  jumpRunLengthMiles?: number;
  mapZones?: MapZonesData;
  mapStyle?: string;
  aircraft?: AircraftPosition[];
}

export default function MapView({ lat, lon, jumpRun, jumpRunLengthMiles, mapZones, mapStyle, aircraft }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(mapStyle),
      center: [lon, lat],
      zoom: 14,
    });

    // DZ center marker
    const el = document.createElement("div");
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#ef4444";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";
    new mapboxgl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);

    map.on("load", async () => {
      // Load custom plane icons (SDF so we can color them via paint properties)
      await Promise.all([
        addPlaneImage(map, "plane-jump", JUMP_PLANE_SVG),
        addPlaneImage(map, "plane-traffic", TRAFFIC_PLANE_SVG),
      ]).catch((err) => console.warn("plane icon load failed", err));

      // Map zones (landing areas, POIs) — rendered below jump run
      map.addSource("map-zones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("map-zone-labels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "map-zones-fill",
        type: "fill",
        source: "map-zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "map-zones-outline",
        type: "line",
        source: "map-zones",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "map-zone-labels",
        type: "symbol",
        source: "map-zone-labels",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 13,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        },
      });

      // Jump run line source
      map.addSource("jump-run", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Glow layer
      map.addLayer({
        id: "jump-run-glow",
        type: "line",
        source: "jump-run",
        paint: {
          "line-color": "#76ff03",
          "line-width": 8,
          "line-opacity": 0.3,
          "line-blur": 4,
        },
      });

      // Main line
      map.addLayer({
        id: "jump-run-line",
        type: "line",
        source: "jump-run",
        paint: {
          "line-color": "#76ff03",
          "line-width": 3,
          "line-opacity": 0.9,
        },
      });

      // Arrow at end
      map.addSource("jump-run-arrow", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "jump-run-arrow",
        type: "symbol",
        source: "jump-run-arrow",
        layout: {
          "icon-image": "airport",
          "icon-size": 1.5,
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
        },
        paint: {
          "icon-color": "#76ff03",
        },
      });

      // Aircraft tracking layer
      map.addSource("aircraft", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("aircraft-labels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Projected track vector (jump planes only) — drawn under icons
      map.addSource("aircraft-tracks", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "aircraft-tracks",
        type: "line",
        source: "aircraft-tracks",
        paint: {
          "line-color": "#00e5ff",
          "line-width": 1.5,
          "line-opacity": 0.55,
          "line-dasharray": [2, 2],
        },
      });

      // Aircraft icons — distinct silhouettes for jump planes vs traffic
      map.addLayer({
        id: "aircraft-icons",
        type: "symbol",
        source: "aircraft",
        layout: {
          "icon-image": [
            "case",
            ["get", "isJumpPlane"],
            "plane-jump",
            "plane-traffic",
          ],
          "icon-size": ["case", ["get", "isJumpPlane"], 0.7, 0.4],
          "icon-rotate": ["get", "track"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
        },
        paint: {
          // Jump planes = bright cyan with glow, other traffic = dim gray
          "icon-color": [
            "case",
            ["get", "isJumpPlane"],
            "#00e5ff",
            "#9e9e9e",
          ],
          "icon-halo-color": [
            "case",
            ["get", "isJumpPlane"],
            "rgba(0, 229, 255, 0.65)",
            "rgba(0, 0, 0, 0)",
          ],
          "icon-halo-width": ["case", ["get", "isJumpPlane"], 1.5, 0],
          "icon-halo-blur": ["case", ["get", "isJumpPlane"], 2, 0],
          "icon-opacity": [
            "case",
            ["get", "isJumpPlane"],
            1.0,
            0.55,
          ],
        },
      });

      // Aircraft altitude/tail labels
      map.addLayer({
        id: "aircraft-labels",
        type: "symbol",
        source: "aircraft-labels",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.8],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": [
            "case",
            ["get", "isJumpPlane"],
            "#00e5ff",
            "#bdbdbd",
          ],
          "text-halo-color": "#000000",
          "text-halo-width": 1.2,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon, mapStyle]);

  // Update jump run line
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !jumpRun) return;

    function updateLine() {
      const source = map!.getSource("jump-run") as mapboxgl.GeoJSONSource;
      const arrowSource = map!.getSource(
        "jump-run-arrow"
      ) as mapboxgl.GeoJSONSource;
      if (!source) return;

      const heading = jumpRun!.headingDeg;

      // Spot = green light point, upwind of DZ by offsetMiles
      // Aircraft flies INTO the wind (heading), so spot is upwind of DZ
      const [spotLat, spotLon] = destinationPoint(
        lat,
        lon,
        heading,
        jumpRun!.offsetMiles
      );

      // Line starts at spot, extends along the aircraft's direction of travel
      const lineLength = jumpRunLengthMiles ?? JUMP_RUN_LENGTH_MILES;
      const [endLat, endLon] = destinationPoint(
        spotLat,
        spotLon,
        heading,
        lineLength
      );

      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [spotLon, spotLat],
            [endLon, endLat],
          ],
        },
      });

      // Plane icon at the end of the run, oriented along the heading
      if (arrowSource) {
        arrowSource.setData({
          type: "Feature",
          properties: { bearing: heading },
          geometry: {
            type: "Point",
            coordinates: [endLon, endLat],
          },
        });
      }
    }

    if (map.isStyleLoaded()) {
      updateLine();
    } else {
      map.on("load", updateLine);
    }
  }, [jumpRun, lat, lon]);

  // Update map zones
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function updateZones() {
      const zonesSource = map!.getSource("map-zones") as mapboxgl.GeoJSONSource;
      const labelsSource = map!.getSource("map-zone-labels") as mapboxgl.GeoJSONSource;
      if (!zonesSource || !labelsSource) return;

      const zones = mapZones ?? [];

      zonesSource.setData({
        type: "FeatureCollection",
        features: zones.map((z) => ({
          type: "Feature" as const,
          properties: { color: z.color },
          geometry: z.geometry,
        })),
      });

      labelsSource.setData({
        type: "FeatureCollection",
        features: zones.map((z) => {
          const ring = z.geometry.coordinates[0];
          const [lng, lat] = ring ? polygonCentroid(ring) : [0, 0];
          return {
            type: "Feature" as const,
            properties: { label: z.label },
            geometry: { type: "Point" as const, coordinates: [lng, lat] },
          };
        }),
      });
    }

    if (map.isStyleLoaded()) {
      updateZones();
    } else {
      map.on("load", updateZones);
    }
  }, [mapZones]);

  // Update aircraft positions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function updateAircraft() {
      const acSource = map!.getSource("aircraft") as mapboxgl.GeoJSONSource;
      const labelSource = map!.getSource("aircraft-labels") as mapboxgl.GeoJSONSource;
      const trackSource = map!.getSource("aircraft-tracks") as mapboxgl.GeoJSONSource;
      if (!acSource || !labelSource) return;

      const positions = aircraft ?? [];

      acSource.setData({
        type: "FeatureCollection",
        features: positions.map((ac) => ({
          type: "Feature" as const,
          properties: {
            isJumpPlane: ac.isJumpPlane,
            track: ac.trackDeg ?? 0,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [ac.lon, ac.lat],
          },
        })),
      });

      labelSource.setData({
        type: "FeatureCollection",
        features: positions.map((ac) => {
          const alt = ac.altitudeFt != null ? `${Math.round(ac.altitudeFt / 100)}` : "";
          const label = ac.tailNumber
            ? `${ac.tailNumber} ${alt}`
            : ac.isJumpPlane
              ? `${ac.hex.toUpperCase()} ${alt}`
              : alt;

          return {
            type: "Feature" as const,
            properties: { label: label.trim(), isJumpPlane: ac.isJumpPlane },
            geometry: {
              type: "Point" as const,
              coordinates: [ac.lon, ac.lat],
            },
          };
        }),
      });

      // Projected track vector — 60 seconds ahead, jump planes only
      if (trackSource) {
        const NM_TO_MILES = 1.15078;
        const trackFeatures = positions
          .filter(
            (ac) =>
              ac.isJumpPlane &&
              ac.trackDeg != null &&
              ac.groundSpeedKts != null &&
              ac.groundSpeedKts > 20
          )
          .map((ac) => {
            // groundspeed (kts = nm/hr) * (1 min / 60 min) = nm, then to miles
            const distMiles = (ac.groundSpeedKts! / 60) * NM_TO_MILES;
            const [endLat, endLon] = destinationPoint(
              ac.lat,
              ac.lon,
              ac.trackDeg!,
              distMiles
            );
            return {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "LineString" as const,
                coordinates: [
                  [ac.lon, ac.lat],
                  [endLon, endLat],
                ],
              },
            };
          });
        trackSource.setData({
          type: "FeatureCollection",
          features: trackFeatures,
        });
      }
    }

    if (map.isStyleLoaded()) {
      updateAircraft();
    } else {
      map.on("load", updateAircraft);
    }
  }, [aircraft]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Set NEXT_PUBLIC_MAPBOX_TOKEN to enable map
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
