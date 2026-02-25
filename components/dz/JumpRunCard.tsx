"use client";

import type { JumpRunResult } from "@/lib/winds/types";

interface JumpRunCardProps {
  jumpRun: JumpRunResult | null;
}

function headingLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function JumpRunCard({ jumpRun }: JumpRunCardProps) {
  if (!jumpRun) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">Waiting for wind data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Jump Run
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {jumpRun.headingDeg}°
          </div>
          <div className="text-xs text-gray-500">
            Heading ({headingLabel(jumpRun.headingDeg)})
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {jumpRun.offsetMiles > 0 ? "+" : ""}
            {jumpRun.offsetMiles.toFixed(1)} mi
          </div>
          <div className="text-xs text-gray-500">Offset</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {jumpRun.groundSpeedKts} kt
          </div>
          <div className="text-xs text-gray-500">Ground Speed</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {jumpRun.separationSeconds}s
          </div>
          <div className="text-xs text-gray-500">Separation</div>
        </div>
      </div>
    </div>
  );
}
