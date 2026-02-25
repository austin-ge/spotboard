"use client";

import { useState, useEffect } from "react";

interface StatusStripProps {
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
}

function timeAgo(ts: number, now: number): string {
  const mins = Math.floor((now - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function StatusStrip({
  fetchedAt,
  loading,
  error,
}: StatusStripProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fresh = fetchedAt && now - fetchedAt < 30 * 60 * 1000;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          error
            ? "bg-red-400"
            : loading
            ? "bg-yellow-400 animate-pulse"
            : fresh
            ? "bg-green-400"
            : "bg-gray-300"
        }`}
      />
      <span className="text-gray-500">
        {error
          ? "Wind data error"
          : loading
          ? "Fetching winds..."
          : fetchedAt
          ? `Winds updated ${timeAgo(fetchedAt, now)}`
          : "No wind data"}
      </span>
    </div>
  );
}
