"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/slug";

type Step = "info" | "location" | "review";

export default function SetupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [airportCode, setAirportCode] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  function handleNameChange(val: string) {
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/dz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        airportCode: airportCode || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create dropzone");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/dz/${data.slug}`);
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex gap-2">
        {(["info", "location", "review"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              (["info", "location", "review"] as Step[]).indexOf(step) >= i
                ? "bg-emerald-400"
                : "bg-white/[0.08]"
            }`}
          />
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {step === "info" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Dropzone Info</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Skydive Chicago"
              className="input-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              URL Slug
            </label>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span className="font-mono text-xs">spotboard.xyz/dz/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input-dark flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Airport Code <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              value={airportCode}
              onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
              placeholder="KENW"
              maxLength={4}
              className="input-dark font-mono"
            />
          </div>
          <button
            onClick={() => setStep("location")}
            disabled={!name || !slug}
            className="btn-primary w-full"
          >
            Next
          </button>
        </div>
      )}

      {step === "location" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Location</h2>
          <p className="text-sm text-slate-500">
            Enter coordinates for your dropzone. You can find these on Google
            Maps by right-clicking your DZ.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="41.4535"
                className="input-dark font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="-88.9400"
                className="input-dark font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("info")} className="btn-ghost flex-1">
              Back
            </button>
            <button
              onClick={() => setStep("review")}
              disabled={!lat || !lon}
              className="btn-primary flex-1"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Review</h2>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-200">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">URL</span>
              <span className="font-mono text-xs text-slate-300">/dz/{slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Coordinates</span>
              <span className="font-mono text-xs text-slate-300 tabular-nums">
                {lat}, {lon}
              </span>
            </div>
            {airportCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">Airport</span>
                <span className="font-mono text-slate-200">{airportCode}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("location")} className="btn-ghost flex-1">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Creating..." : "Create Dropzone"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
