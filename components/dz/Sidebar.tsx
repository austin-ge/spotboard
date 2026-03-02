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
    <div className="h-full flex flex-col bg-[#0c1018] text-slate-200 relative">
      {/* Ambient gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1520] to-[#0c1018] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {dzName}
          </h1>
          {showSettings && (
            <Link
              href={`/dz/${slug}/settings`}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[18px] h-[18px]"
              >
                <path
                  fillRule="evenodd"
                  d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          )}
        </div>
        <p className="text-[11px] font-mono text-slate-600 mt-1 tracking-wide">
          {Math.abs(lat).toFixed(4)}&deg;{lat >= 0 ? "N" : "S"},{" "}
          {Math.abs(lon).toFixed(4)}&deg;{lon >= 0 ? "E" : "W"}
        </p>
        <div className="mt-2.5">
          <StatusStrip fetchedAt={fetchedAt} loading={loading} error={error} />
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent mx-4" />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto panel-scroll px-6 py-5 space-y-6">
        <JumpRunCard jumpRun={jumpRun} />
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
        <WindsTable layers={layers} />
      </div>
    </div>
  );
}
