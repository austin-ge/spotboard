"use client";

import type { JumpRunResult } from "@/lib/winds/types";

function headingLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

interface JumpRunCardProps {
  jumpRun: JumpRunResult | null;
}

export default function JumpRunCard({ jumpRun }: JumpRunCardProps) {
  if (!jumpRun) {
    return (
      <div className="py-8 text-center">
        <div className="text-5xl font-mono font-bold text-slate-800 tabular-nums tracking-tight">
          ---&deg;
        </div>
        <p className="text-xs text-slate-600 mt-3">Waiting for wind data</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Jump Run
      </h3>

      {/* Hero heading display */}
      <div className="text-center py-2">
        <div className="text-[3.5rem] leading-none font-mono font-bold text-[#76ff03] tabular-nums glow-accent tracking-tight">
          {jumpRun.headingDeg}&deg;
        </div>
        <div className="text-sm text-slate-400 mt-2.5 flex items-center justify-center gap-2">
          <span>Heading</span>
          <span className="text-slate-600">&middot;</span>
          <span>{headingLabel(jumpRun.headingDeg)}</span>
          {jumpRun.headingMode !== "AUTO" && (
            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700/80">
              {jumpRun.headingMode === "RUNWAY" ? "RWY" : "FXD"}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center rounded-lg bg-white/[0.03] border border-white/[0.04] py-3">
          <div className="text-lg font-mono font-semibold text-white tabular-nums">
            {jumpRun.offsetMiles > 0 ? "+" : ""}
            {jumpRun.offsetMiles.toFixed(1)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
            mi offset
          </div>
        </div>
        <div className="text-center rounded-lg bg-white/[0.03] border border-white/[0.04] py-3">
          <div className="text-lg font-mono font-semibold text-white tabular-nums">
            {jumpRun.groundSpeedKts}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
            kt ground
          </div>
        </div>
        <div className="text-center rounded-lg bg-white/[0.03] border border-white/[0.04] py-3">
          <div className="text-lg font-mono font-semibold text-white tabular-nums">
            {jumpRun.separationSeconds}s
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
            separation
          </div>
        </div>
      </div>
    </div>
  );
}
