"use client";

import type { WindLayer } from "@/lib/winds/types";
import {
  getWindSpeedColor,
  groupWindsByRange,
} from "@/lib/winds/display";

interface WindsTableProps {
  layers: WindLayer[] | null;
}

function formatAltitude(ft: number): string {
  if (ft === 0) return "SFC";
  if (ft >= 1000) return `${(ft / 1000).toFixed(0)}k`;
  return `${ft}`;
}

function WindArrow({ directionDeg, color }: { directionDeg: number; color: string }) {
  const rotation = directionDeg;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="flex-shrink-0"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M12 2 L12 22 M12 22 L7 17 M12 22 L17 17"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function WindsTable({ layers }: WindsTableProps) {
  if (!layers) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-600">Loading wind data...</p>
      </div>
    );
  }

  const groups = groupWindsByRange(layers);

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Winds Aloft
      </h3>

      <div className="space-y-0.5">
        {[...groups].reverse().map((g, i) => {
          const color = getWindSpeedColor(g.speedKts);
          const altLabel =
            g.lowFt === g.highFt
              ? formatAltitude(g.highFt)
              : `${formatAltitude(g.lowFt)}-${formatAltitude(g.highFt)}`;

          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors"
            >
              <span className="w-14 text-xs font-mono text-slate-500 text-right tabular-nums">
                {altLabel}
              </span>

              <WindArrow directionDeg={g.directionDeg} color={color} />

              <span className="w-8 text-xs font-mono text-slate-600 tabular-nums">
                {g.directionDeg}&deg;
              </span>

              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (g.speedKts / 40) * 100)}%`,
                    backgroundColor: color,
                    boxShadow: g.speedKts > 5 ? `0 0 8px ${color}50` : "none",
                    minWidth: g.speedKts > 0 ? "4px" : "0",
                  }}
                />
              </div>

              <span
                className="w-12 text-sm font-mono font-semibold tabular-nums text-right"
                style={{ color }}
              >
                {g.speedKts} kt
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
