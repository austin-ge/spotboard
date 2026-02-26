"use client";

import Link from "next/link";
import type { WindLayer, JumpRunResult } from "@/lib/winds/types";
import StatusStrip from "./StatusStrip";
import JumpRunCard from "./JumpRunCard";
import WindsTable from "./WindsTable";

interface SidebarProps {
  dzName: string;
  slug: string;
  lat: number;
  lon: number;
  layers: WindLayer[] | null;
  jumpRun: JumpRunResult | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
  showSettings: boolean;
}

export default function Sidebar({
  dzName,
  slug,
  lat,
  lon,
  layers,
  jumpRun,
  fetchedAt,
  loading,
  error,
  showSettings,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold leading-tight">{dzName}</h1>
          {showSettings && (
            <Link
              href={`/dz/${slug}/settings`}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
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
