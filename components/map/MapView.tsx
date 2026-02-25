"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { JumpRunResult } from "@/lib/winds/types";
import { destinationPoint } from "@/lib/geo";
import { JUMP_RUN_LENGTH_MILES } from "@/lib/winds/constants";

interface MapViewProps {
  lat: number;
  lon: number;
  jumpRun: JumpRunResult | null;
  jumpRunLengthMiles?: number;
}

export default function MapView({ lat, lon, jumpRun, jumpRunLengthMiles }: MapViewProps) {
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
      style: "mapbox://styles/mapbox/satellite-streets-v12",
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

    map.on("load", () => {
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
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon]);

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
