"use client";

import { useState } from "react";
import { useWinds } from "@/lib/hooks/useWinds";
import { useJumpRun } from "@/lib/hooks/useJumpRun";
import Sidebar from "@/components/dz/Sidebar";
import MapView from "@/components/map/MapView";
import MobileToggle from "@/components/dz/MobileToggle";

interface DZPageClientProps {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  exitAltitudeFt: number;
  openingAltitudeFt: number;
  holdingAreaAltitudeFt: number;
  patternAltitudeFt: number;
  jumpRunAirspeedKnots: number;
}

export default function DZPageClient({
  name,
  lat,
  lon,
  exitAltitudeFt,
  openingAltitudeFt,
  holdingAreaAltitudeFt,
  patternAltitudeFt,
  jumpRunAirspeedKnots,
}: DZPageClientProps) {
  const [showMap, setShowMap] = useState(false);
  const { winds, loading, error } = useWinds(lat, lon);
  const jumpRun = useJumpRun(winds?.layers ?? null, {
    exitAltitudeFt,
    openingAltitudeFt,
    holdingAreaAltitudeFt,
    patternAltitudeFt,
    jumpRunAirspeedKnots,
  });

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
          lat={lat}
          lon={lon}
          layers={winds?.layers ?? null}
          jumpRun={jumpRun}
          fetchedAt={winds?.fetchedAt ?? null}
          loading={loading}
          error={error}
        />
      </div>

      {/* Map — hidden on mobile when sidebar shown */}
      <div
        className={`flex-1 md:block ${showMap ? "block" : "hidden md:block"}`}
      >
        <MapView lat={lat} lon={lon} jumpRun={jumpRun} />
      </div>

      {/* Mobile toggle */}
      <MobileToggle
        showMap={showMap}
        onToggle={() => setShowMap((v) => !v)}
      />
    </div>
  );
}
