"use client";

import { useState } from "react";
import { useWinds } from "@/lib/hooks/useWinds";
import { useJumpRun } from "@/lib/hooks/useJumpRun";
import Sidebar from "@/components/dz/Sidebar";
import MapView from "@/components/map/MapView";
import MobileToggle from "@/components/dz/MobileToggle";
import type { DropzoneConfig } from "@/lib/winds/types";
import type { MapZonesData } from "@/lib/mapZones";

interface DZPageClientProps {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  config: DropzoneConfig;
  showSettings: boolean;
  mapZones: MapZonesData;
  mapStyle: string;
}

export default function DZPageClient({
  name,
  slug,
  lat,
  lon,
  config,
  showSettings,
  mapZones,
  mapStyle,
}: DZPageClientProps) {
  const [showMap, setShowMap] = useState(false);
  const { winds, loading, error } = useWinds(lat, lon);
  const jumpRun = useJumpRun(winds?.layers ?? null, config);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar — hidden on mobile when map shown */}
      <div
        className={`w-full md:w-96 md:flex-shrink-0 md:block ${
          showMap ? "hidden" : "block"
        }`}
      >
        <Sidebar
          dzName={name}
          slug={slug}
          lat={lat}
          lon={lon}
          layers={winds?.layers ?? null}
          jumpRun={jumpRun}
          fetchedAt={winds?.fetchedAt ?? null}
          loading={loading}
          error={error}
          showSettings={showSettings}
        />
      </div>

      {/* Map — hidden on mobile when sidebar shown */}
      <div
        className={`flex-1 md:block ${showMap ? "block" : "hidden md:block"}`}
      >
        <MapView
          lat={lat}
          lon={lon}
          jumpRun={jumpRun}
          jumpRunLengthMiles={config.drift.jumpRunLengthMiles}
          mapZones={mapZones}
          mapStyle={mapStyle}
        />
      </div>

      {/* Mobile toggle */}
      <MobileToggle
        showMap={showMap}
        onToggle={() => setShowMap((v) => !v)}
      />
    </div>
  );
}
