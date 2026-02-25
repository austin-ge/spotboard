"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  slug: string;
  initialData: {
    name: string;
    lat: number;
    lon: number;
    airportCode: string;
    exitAltitudeFt: number;
    openingAltitudeFt: number;
    holdingAreaAltitudeFt: number;
    patternAltitudeFt: number;
    jumpRunAirspeedKnots: number;
  };
}

export default function SettingsForm({ slug, initialData }: SettingsFormProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: string | number) {
    setData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/dz/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to save");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={data.lat}
            onChange={(e) => update("lat", parseFloat(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={data.lon}
            onChange={(e) => update("lon", parseFloat(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Airport Code</label>
        <input
          type="text"
          value={data.airportCode}
          onChange={(e) => update("airportCode", e.target.value.toUpperCase())}
          maxLength={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <h3 className="text-sm font-semibold pt-2">Jump Profile</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Exit Alt (ft)
          </label>
          <input
            type="number"
            value={data.exitAltitudeFt}
            onChange={(e) =>
              update("exitAltitudeFt", parseInt(e.target.value) || 0)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Opening Alt (ft)
          </label>
          <input
            type="number"
            value={data.openingAltitudeFt}
            onChange={(e) =>
              update("openingAltitudeFt", parseInt(e.target.value) || 0)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Holding Area (ft)
          </label>
          <input
            type="number"
            value={data.holdingAreaAltitudeFt}
            onChange={(e) =>
              update("holdingAreaAltitudeFt", parseInt(e.target.value) || 0)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Pattern Alt (ft)
          </label>
          <input
            type="number"
            value={data.patternAltitudeFt}
            onChange={(e) =>
              update("patternAltitudeFt", parseInt(e.target.value) || 0)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Jump Run Airspeed (kts)
        </label>
        <input
          type="number"
          value={data.jumpRunAirspeedKnots}
          onChange={(e) =>
            update("jumpRunAirspeedKnots", parseInt(e.target.value) || 0)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}
