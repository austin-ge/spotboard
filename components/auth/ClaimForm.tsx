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
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
        <p className="font-medium mb-1">Claim submitted for review</p>
        <p>An admin will review your claim. You&apos;ll be notified when it&apos;s approved.</p>
        <button
          onClick={() => router.push("/")}
          className="link-accent mt-3 text-sm font-medium"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="error-banner">{error}</div>}

      {matches.map((m) => (
        <label
          key={m.id}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            selected === m.id
              ? "border-emerald-400/50 bg-emerald-400/10"
              : "border-white/[0.08] hover:bg-white/[0.04]"
          }`}
        >
          <input
            type="radio"
            name="dropzone"
            value={m.id}
            checked={selected === m.id}
            onChange={() => setSelected(m.id)}
            className="accent-emerald-400"
          />
          <span className="font-medium text-sm text-slate-200">{m.name}</span>
        </label>
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setClaimType("OPERATOR")}
            className={`seg-btn flex-1 ${claimType === "OPERATOR" ? "seg-btn-active" : ""}`}
          >
            DZ Owner
          </button>
          <button
            type="button"
            onClick={() => setClaimType("STAFF")}
            className={`seg-btn flex-1 ${claimType === "STAFF" ? "seg-btn-active" : ""}`}
          >
            Staff
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {claimType === "OPERATOR"
            ? "Full control over this dropzone's board and settings."
            : "View access to the DZ dashboard."}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !selected}
        className="btn-primary w-full"
      >
        {loading ? "Submitting..." : "Claim Dropzone"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t see your DZ?{" "}
        <a href="mailto:austin@spotboard.xyz" className="link-accent">
          Contact us
        </a>
      </p>
    </form>
  );
}
