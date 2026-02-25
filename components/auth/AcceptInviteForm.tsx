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
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="rounded-md border border-gray-200 p-4">
        <p className="text-sm">
          You&apos;ll be able to{" "}
          {role === "MANAGER"
            ? "edit all settings for"
            : "view the dashboard of"}{" "}
          <span className="font-medium">{dzName}</span>.
        </p>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Accepting..." : "Accept Invite"}
      </button>

      <button
        onClick={() => router.push("/")}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Decline
      </button>
    </div>
  );
}
