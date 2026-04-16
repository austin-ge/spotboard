"use client";

import type { AircraftPosition } from "@/lib/adsb/types";

interface JumpPlanesCardProps {
  aircraft: AircraftPosition[] | undefined;
}

function formatAlt(ft: number | null): string {
  if (ft == null) return "—";
  return `${Math.round(ft).toLocaleString()}`;
}

function formatSpeed(kts: number | null): string {
  if (kts == null) return "—";
  return `${Math.round(kts)}`;
}

function formatVRate(fpm: number | null): string | null {
  if (fpm == null || Math.abs(fpm) < 50) return null;
  const sign = fpm > 0 ? "↑" : "↓";
  return `${sign} ${Math.abs(Math.round(fpm)).toLocaleString()}`;
}

export default function JumpPlanesCard({ aircraft }: JumpPlanesCardProps) {
  const jumpPlanes = (aircraft ?? []).filter((ac) => ac.isJumpPlane);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Jump Planes
        </h3>
        {jumpPlanes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
            <span className="text-[10px] font-mono text-slate-500 tabular-nums">
              {jumpPlanes.length} airborne
            </span>
          </div>
        )}
      </div>

      {jumpPlanes.length === 0 ? (
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] py-4 text-center">
          <p className="text-[11px] text-slate-600">No jump planes airborne</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jumpPlanes.map((ac) => {
            const vRate = formatVRate(ac.verticalRateFpm);
            const label = ac.tailNumber ?? ac.hex.toUpperCase();
            return (
              <div
                key={ac.hex}
                className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-[#00e5ff] tracking-wide">
                    {label}
                  </span>
                  {vRate && (
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      {vRate} fpm
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-base font-semibold text-white tabular-nums">
                      {formatAlt(ac.altitudeFt)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      ft
                    </span>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-base font-semibold text-white tabular-nums">
                      {formatSpeed(ac.groundSpeedKts)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      kt
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
