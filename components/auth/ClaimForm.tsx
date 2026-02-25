"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Match {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
}

export default function ClaimForm({ matches }: { matches: Match[] }) {
  const router = useRouter();
  const { update } = useSession();
  const [selected, setSelected] = useState<string>(matches[0]?.id ?? "");
  const [claimType, setClaimType] = useState<"OPERATOR" | "STAFF">("OPERATOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ approved: boolean; role: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dropzoneId: selected, claimType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to submit claim");
      return;
    }

    setResult(data);

    if (data.approved) {
      // Refresh session to pick up new role
      await update();
      const match = matches.find((m) => m.id === selected);
      if (match) {
        router.push(`/dz/${match.slug}/settings`);
      } else {
        router.push("/");
      }
    }
  }

  if (result && !result.approved) {
    return (
      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Claim submitted for review</p>
        <p>An admin will review your claim. You&apos;ll be notified when it&apos;s approved.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-3 text-blue-600 hover:underline text-sm"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {matches.map((m) => (
        <label
          key={m.id}
          className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
            selected === m.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            name="dropzone"
            value={m.id}
            checked={selected === m.id}
            onChange={() => setSelected(m.id)}
            className="text-blue-600"
          />
          <span className="font-medium text-sm">{m.name}</span>
        </label>
      ))}

      <div>
        <label className="block text-sm font-medium mb-2">I am a...</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setClaimType("OPERATOR")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              claimType === "OPERATOR"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            DZ Owner
          </button>
          <button
            type="button"
            onClick={() => setClaimType("STAFF")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              claimType === "STAFF"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Staff
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {claimType === "OPERATOR"
            ? "Full control over this dropzone's board and settings."
            : "View access to the DZ dashboard."}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !selected}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Claim Dropzone"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Don&apos;t see your DZ?{" "}
        <a href="mailto:austin@spotboard.xyz" className="text-blue-600 hover:underline">
          Contact us
        </a>
      </p>
    </form>
  );
}
