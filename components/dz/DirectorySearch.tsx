"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import DropzoneCard from "./DropzoneCard";

interface DZEntry {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string | null;
  hasAdsb?: boolean;
  hasAdsbCoverage?: boolean;
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
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-[16px] h-[16px] text-slate-600"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dropzones..."
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] pl-11 pr-20 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.07] transition-all font-light tracking-wide"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query ? (
            <span className="text-[11px] text-slate-600 tabular-nums font-mono">
              {filtered.length} found
            </span>
          ) : (
            <span className="text-[11px] text-slate-700 font-mono">
              {dropzones.length} DZs
            </span>
          )}
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && !query && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-amber-500/70"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.15em]">
              Favorites
            </h2>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* All Dropzones */}
      <div className="space-y-4">
        {!query && favorites.length > 0 && (
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <h2 className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.15em]">
              All Dropzones
            </h2>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] text-center py-14">
            <p className="text-sm text-slate-600">No dropzones match that search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  );
}
