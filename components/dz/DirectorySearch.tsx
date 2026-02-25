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
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dropzones..."
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none mb-4"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No dropzones found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((dz) => (
            <DropzoneCard key={dz.slug} {...dz} />
          ))}
        </div>
      )}
    </div>
  );
}
