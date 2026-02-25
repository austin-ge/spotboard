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
            className={`h-1 flex-1 rounded-full transition-colors ${
              (["info", "location", "review"] as Step[]).indexOf(step) >= i
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === "info" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Dropzone Info</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Skydive Chicago"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              URL Slug
            </label>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>spotboard.xyz/dz/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Airport Code <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={airportCode}
              onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
              placeholder="KENW"
              maxLength={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setStep("location")}
            disabled={!name || !slug}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {step === "location" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Location</h2>
          <p className="text-sm text-gray-500">
            Enter coordinates for your dropzone. You can find these on Google
            Maps by right-clicking your DZ.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="41.4535"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="-88.9400"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("info")}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep("review")}
              disabled={!lat || !lon}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Review</h2>
          <div className="rounded-md border border-gray-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">URL</span>
              <span className="font-mono text-xs">/dz/{slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Coordinates</span>
              <span className="font-mono text-xs">
                {lat}, {lon}
              </span>
            </div>
            {airportCode && (
              <div className="flex justify-between">
                <span className="text-gray-500">Airport</span>
                <span>{airportCode}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("location")}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Dropzone"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
