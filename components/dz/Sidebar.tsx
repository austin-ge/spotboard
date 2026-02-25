"use client";

import type { WindLayer, JumpRunResult } from "@/lib/winds/types";
import StatusStrip from "./StatusStrip";
import JumpRunCard from "./JumpRunCard";
import WindsTable from "./WindsTable";

interface SidebarProps {
  dzName: string;
  lat: number;
  lon: number;
  layers: WindLayer[] | null;
  jumpRun: JumpRunResult | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
}

export default function Sidebar({
  dzName,
  lat,
  lon,
  layers,
  jumpRun,
  fetchedAt,
  loading,
  error,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-bold leading-tight">{dzName}</h1>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </p>
        <div className="mt-2">
          <StatusStrip fetchedAt={fetchedAt} loading={loading} error={error} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <JumpRunCard jumpRun={jumpRun} />
        <WindsTable layers={layers} />
      </div>
    </div>
  );
}
