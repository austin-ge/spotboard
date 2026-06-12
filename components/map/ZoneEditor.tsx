"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type { MapZone, MapZonesData } from "@/lib/mapZones";
import { ZONE_COLORS, MAX_ZONES } from "@/lib/mapZones";

interface ZoneEditorProps {
  lat: number;
  lon: number;
  zones: MapZonesData;
  onChange: (zones: MapZonesData) => void;
}

export default function ZoneEditor({ lat, lon, zones, onChange }: ZoneEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const zonesRef = useRef<MapZonesData>(zones);
  const [localZones, setLocalZones] = useState<MapZonesData>(zones);

  // Keep ref in sync
  useEffect(() => {
    zonesRef.current = localZones;
  }, [localZones]);

  const syncFromDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;

    const fc = draw.getAll();
    const updated = zonesRef.current.map((z) => {
      const feature = fc.features.find((f) => f.id === z.id);
      if (feature && feature.geometry.type === "Polygon") {
        return { ...z, geometry: feature.geometry as MapZone["geometry"] };
      }
      return z;
    });

    zonesRef.current = updated;
    setLocalZones(updated);
    onChange(updated);
  }, [onChange]);

  // Initialize map + draw
  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lon, lat],
      zoom: 15,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.addControl(draw, "top-right");

    map.on("load", () => {
      // Load existing zones into draw
      for (const zone of zones) {
        draw.add({
          id: zone.id,
          type: "Feature",
          properties: {},
          geometry: zone.geometry,
        });
      }
    });

    map.on("draw.create", (e: { features: Array<{ id: string; geometry: MapZone["geometry"] }> }) => {
      const newZones: MapZone[] = [];
      for (const feature of e.features) {
        if (feature.geometry.type === "Polygon" && zonesRef.current.length + newZones.length < MAX_ZONES) {
          newZones.push({
            id: String(feature.id),
            label: "New Zone",
            color: ZONE_COLORS[(zonesRef.current.length + newZones.length) % ZONE_COLORS.length],
            geometry: feature.geometry,
          });
        }
      }
      if (newZones.length > 0) {
        const updated = [...zonesRef.current, ...newZones];
        zonesRef.current = updated;
        setLocalZones(updated);
        onChange(updated);
      }
    });

    map.on("draw.update", () => {
      syncFromDraw();
    });

    map.on("draw.delete", (e: { features: Array<{ id: string }> }) => {
      const deletedIds = new Set(e.features.map((f) => String(f.id)));
      const updated = zonesRef.current.filter((z) => !deletedIds.has(z.id));
      zonesRef.current = updated;
      setLocalZones(updated);
      onChange(updated);
    });

    mapRef.current = map;
    drawRef.current = draw;

    return () => {
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [lat, lon]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateLabel(id: string, label: string) {
    const updated = localZones.map((z) => (z.id === id ? { ...z, label } : z));
    zonesRef.current = updated;
    setLocalZones(updated);
    onChange(updated);
  }

  function cycleColor(id: string) {
    const updated = localZones.map((z) => {
      if (z.id !== id) return z;
      const idx = ZONE_COLORS.indexOf(z.color as typeof ZONE_COLORS[number]);
      const next = ZONE_COLORS[(idx + 1) % ZONE_COLORS.length];
      return { ...z, color: next };
    });
    zonesRef.current = updated;
    setLocalZones(updated);
    onChange(updated);
  }

  function deleteZone(id: string) {
    drawRef.current?.delete(id);
    const updated = localZones.filter((z) => z.id !== id);
    zonesRef.current = updated;
    setLocalZones(updated);
    onChange(updated);
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div>
      {!token ? (
        <div className="w-full h-64 flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-slate-500 text-sm rounded-lg">
          Set NEXT_PUBLIC_MAPBOX_TOKEN to enable map
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-80 rounded-md overflow-hidden" />
      )}

      {localZones.length > 0 && (
        <div className="mt-3 space-y-2">
          {localZones.map((zone) => (
            <div key={zone.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => cycleColor(zone.id)}
                className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: zone.color }}
                title="Click to change color"
              />
              <input
                type="text"
                value={zone.label}
                onChange={(e) => updateLabel(zone.id, e.target.value)}
                className="input-dark flex-1 px-2 py-1"
                placeholder="Zone label"
              />
              <button
                type="button"
                onClick={() => deleteZone(zone.id)}
                className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 mt-2">
        Use the polygon tool to draw landing areas. Click a color swatch to cycle colors. Max {MAX_ZONES} zones.
      </p>
    </div>
  );
}
