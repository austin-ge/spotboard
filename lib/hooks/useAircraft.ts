"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AircraftData } from "@/lib/adsb/types";

const POLL_INTERVAL = 3000; // 3 seconds

export function useAircraft(slug: string, enabled: boolean = true) {
  const [data, setData] = useState<AircraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAircraft = useCallback(async () => {
    if (!enabled) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/adsb/${slug}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        if (res.status === 502) {
          setError("ADS-B aggregator offline");
        } else {
          setError("Failed to fetch aircraft");
        }
        return;
      }

      const json: AircraftData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [slug, enabled]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    fetchAircraft();
    const interval = setInterval(fetchAircraft, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchAircraft, enabled]);

  return { data, loading, error, refetch: fetchAircraft };
}
