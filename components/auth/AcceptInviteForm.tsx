"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  token: string;
  dzName: string;
  dzSlug: string;
  role: string;
}

export default function AcceptInviteForm({ token, dzName, dzSlug, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setError("");
    setLoading(true);

    const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to accept invite");
      return;
    }

    router.push(`/dz/${dzSlug}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <div className="error-banner">{error}</div>}

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <p className="text-sm text-slate-300">
          You&apos;ll be able to{" "}
          {role === "MANAGER"
            ? "edit all settings for"
            : "view the dashboard of"}{" "}
          <span className="font-medium text-white">{dzName}</span>.
        </p>
      </div>

      <button onClick={handleAccept} disabled={loading} className="btn-primary w-full">
        {loading ? "Accepting..." : "Accept Invite"}
      </button>

      <button onClick={() => router.push("/")} className="btn-ghost w-full">
        Decline
      </button>
    </div>
  );
}
