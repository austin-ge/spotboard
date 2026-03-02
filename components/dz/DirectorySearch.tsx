"use client";

import { useState, useMemo } from "react";
import DropzoneCard from "./DropzoneCard";

interface DZEntry {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
}

export default function DirectorySearch({
  dropzones,
}: {
  dropzones: DZEntry[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return dropzones;
    const q = query.toLowerCase();
    return dropzones.filter(
      (dz) =>
        dz.name.toLowerCase().includes(q) ||
        dz.slug.includes(q) ||
        dz.airportCode?.toLowerCase().includes(q)
    );
  }, [dropzones, query]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or airport code..."
          className="w-full rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] pl-11 pr-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] transition-all"
        />
        {query && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 tabular-nums">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] text-center py-12">
          <p className="text-sm text-slate-400">No dropzones found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dz) => (
            <DropzoneCard key={dz.slug} {...dz} />
          ))}
        </div>
      )}
    </div>
  );
}
