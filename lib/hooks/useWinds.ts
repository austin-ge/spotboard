"use client";

import { useState, useEffect, useCallback } from "react";
import type { WindsData } from "@/lib/winds/types";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_PREFIX = "spotboard_winds_";

function getCached(lat: number, lon: number): WindsData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${lat},${lon}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as WindsData;
    if (Date.now() - data.fetchedAt > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data: WindsData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${data.lat},${data.lon}`,
      JSON.stringify(data)
    );
  } catch {
    // localStorage full — ignore
  }
}

export function useWinds(lat: number | null, lon: number | null) {
  const [winds, setWinds] = useState<WindsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWinds = useCallback(async () => {
    if (lat == null || lon == null) return;

    // Try cache first
    const cached = getCached(lat, lon);
    if (cached && !winds) {
      setWinds(cached);
      setLoading(false);
    }

    try {
      const res = await fetch(`/api/winds?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch winds");

      const data: WindsData = await res.json();
      setWinds(data);
      setCache(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Keep stale data if we have it
    } finally {
      setLoading(false);
    }
  }, [lat, lon, winds]);

  useEffect(() => {
    fetchWinds();
    const interval = setInterval(fetchWinds, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWinds]);

  return { winds, loading, error, refetch: fetchWinds };
}
