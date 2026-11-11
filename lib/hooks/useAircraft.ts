"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AircraftData } from "@/lib/adsb/types";

const POLL_INTERVAL = 3000; // 3 seconds
/** Feed/last-success older than this means positions are not live */
export const STALE_AFTER_SEC = 30;

export function useAircraft(slug: string, enabled: boolean = true) {
  const [data, setData] = useState<AircraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
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
      setLastSuccessAt(Date.now());
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
      // Intentional: reset state when polling is switched off
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Tick so staleness is re-evaluated even when requests keep failing
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const sinceSuccessSec =
    lastSuccessAt === null ? null : Math.round((now - lastSuccessAt) / 1000);
  const feedAgeSec = data?.feedAgeSec ?? null;
  // Not live if: requests are failing, the feed snapshot is old, or we have
  // not heard from the server for a while.
  const stale =
    enabled &&
    !loading &&
    (error !== null ||
      (feedAgeSec !== null && feedAgeSec + (sinceSuccessSec ?? 0) > STALE_AFTER_SEC) ||
      (sinceSuccessSec !== null && sinceSuccessSec > STALE_AFTER_SEC));
  const ageSec =
    feedAgeSec !== null && sinceSuccessSec !== null
      ? feedAgeSec + sinceSuccessSec
      : sinceSuccessSec;

  return { data, loading, error, stale, ageSec, refetch: fetchAircraft };
}
