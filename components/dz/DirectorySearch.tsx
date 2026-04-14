"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import DropzoneCard from "./DropzoneCard";

interface DZEntry {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
}

const FAVORITES_KEY = "spotboard-favorites";

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(slugs: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...slugs]));
}

export default function DirectorySearch({
  dropzones,
}: {
  dropzones: DZEntry[];
}) {
  const [query, setQuery] = useState("");
  const [favSlugs, setFavSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavSlugs(loadFavorites());
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      saveFavorites(next);
      return next;
    });
  }, []);

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

  const favorites = useMemo(
    () => dropzones.filter((dz) => favSlugs.has(dz.slug)),
    [dropzones, favSlugs]
  );

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

      {/* Favorites */}
      {favorites.length > 0 && !query && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Favorites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((dz) => (
              <DropzoneCard
                key={dz.slug}
                {...dz}
                isFavorite
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {!query && favorites.length > 0 && (
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          All Dropzones
        </h2>
      )}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] text-center py-12">
          <p className="text-sm text-slate-400">No dropzones found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dz) => (
            <DropzoneCard
              key={dz.slug}
              {...dz}
              isFavorite={favSlugs.has(dz.slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
