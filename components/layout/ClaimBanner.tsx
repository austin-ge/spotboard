"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClaimBanner() {
  const [hasMatch, setHasMatch] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/claim/check", { method: "POST" });
        if (res.ok) {
          const { matches } = await res.json();
          if (matches?.length > 0) setHasMatch(true);
        }
      } catch {
        // Silently ignore
      }
    }
    check();
  }, []);

  if (!hasMatch) return null;

  return (
    <Link
      href="/claim"
      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
    >
      Claim your DZ
    </Link>
  );
}
