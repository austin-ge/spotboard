"use client";

import type { WindLayer } from "@/lib/winds/types";
import {
  getWindArrow,
  getWindCardinal,
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

export default function WindsTable({ layers }: WindsTableProps) {
  if (!layers) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">
        Loading wind data...
      </div>
    );
  }

  const groups = groupWindsByRange(layers);

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
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
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
            >
              <span className="w-16 text-xs text-gray-500 font-mono text-right">
                {altLabel}
              </span>

              <span className="text-lg leading-none" style={{ color }}>
                {getWindArrow(g.directionDeg)}
              </span>

              <span className="w-8 text-xs text-gray-400">
                {getWindCardinal(g.directionDeg)}
              </span>

              <div className="flex-1 flex items-center gap-2">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (g.speedKts / 40) * 100)}%`,
                    backgroundColor: color,
                    minWidth: g.speedKts > 0 ? "4px" : "0",
                  }}
                />
              </div>

              <span
                className="text-sm font-semibold tabular-nums w-12 text-right"
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
