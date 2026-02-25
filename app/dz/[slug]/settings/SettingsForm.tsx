"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CANOPY_FORWARD_SPEED_MPH,
  CANOPY_DESCENT_RATE_MPH,
  FREEFALL_TERMINAL_VELOCITY_MPH,
  LIGHT_TO_DOOR_MILES,
  AIRPLANE_DRIFT_MILES,
  MAX_OFFSET_MILES,
  JUMP_RUN_LENGTH_MILES,
  SEPARATION_TABLE,
} from "@/lib/winds/constants";

type HeadingMode = "AUTO" | "RUNWAY" | "FIXED";

interface SettingsData {
  name: string;
  lat: number;
  lon: number;
  airportCode: string;
  exitAltitudeFt: number;
  openingAltitudeFt: number;
  holdingAreaAltitudeFt: number;
  patternAltitudeFt: number;
  jumpRunAirspeedKnots: number;
  headingMode: HeadingMode;
  fixedHeadingDeg: number | null;
  runwayHeading1Deg: number | null;
  runwayHeading2Deg: number | null;
  canopyForwardSpeedMph: number | null;
  canopyDescentRateMph: number | null;
  freefallTerminalVelocityMph: number | null;
  lightToDoorMiles: number | null;
  airplaneDriftMiles: number | null;
  maxOffsetMiles: number | null;
  jumpRunLengthMiles: number | null;
  aircraftName: string | null;
  aircraftCruiseSpeedKts: number | null;
  separationTableJson: [number, number][] | null;
}

interface SettingsFormProps {
  slug: string;
  isOwner: boolean;
  initialData: SettingsData;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold pt-4 pb-1 border-b border-gray-100 mb-3">
      {children}
    </h3>
  );
}

export default function SettingsForm({ slug, isOwner, initialData }: SettingsFormProps) {
  const router = useRouter();
  const [data, setData] = useState<SettingsData>(initialData);
  const [useCustomSep, setUseCustomSep] = useState(initialData.separationTableJson != null);
  const [sepTable, setSepTable] = useState<[number, number][]>(
    initialData.separationTableJson ?? [...SEPARATION_TABLE]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsData>(field: K, value: SettingsData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function updateNum(field: keyof SettingsData, raw: string): void {
    const v = raw === "" ? null : parseFloat(raw);
    update(field, v as SettingsData[keyof SettingsData]);
    setSaved(false);
  }

  function updateInt(field: keyof SettingsData, raw: string): void {
    const v = raw === "" ? null : parseInt(raw, 10);
    update(field, v as SettingsData[keyof SettingsData]);
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...data,
      separationTableJson: useCustomSep ? sepTable : null,
    };

    const res = await fetch(`/api/dz/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* 1. Basic Info */}
        <SectionHeader>Basic Info</SectionHeader>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={data.lat}
              onChange={(e) => update("lat", parseFloat(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={data.lon}
              onChange={(e) => update("lon", parseFloat(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Airport Code</label>
          <input
            type="text"
            value={data.airportCode}
            onChange={(e) => update("airportCode", e.target.value.toUpperCase())}
            maxLength={4}
            className={inputClass}
          />
        </div>

        {/* 2. Heading Mode */}
        <SectionHeader>Heading Mode</SectionHeader>

        <div className="flex gap-2">
          {(["AUTO", "RUNWAY", "FIXED"] as HeadingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update("headingMode", mode)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                data.headingMode === mode
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {mode === "AUTO" ? "Auto (Wind)" : mode === "RUNWAY" ? "Runway" : "Fixed"}
            </button>
          ))}
        </div>

        {data.headingMode === "RUNWAY" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Runway Heading 1 (°)</label>
              <input
                type="number"
                min={0}
                max={360}
                value={data.runwayHeading1Deg ?? ""}
                onChange={(e) => updateInt("runwayHeading1Deg", e.target.value)}
                placeholder="e.g. 90"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Runway Heading 2 (°)</label>
              <input
                type="number"
                min={0}
                max={360}
                value={data.runwayHeading2Deg ?? ""}
                onChange={(e) => updateInt("runwayHeading2Deg", e.target.value)}
                placeholder="e.g. 270"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {data.headingMode === "FIXED" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fixed Heading (°)</label>
            <input
              type="number"
              min={0}
              max={360}
              value={data.fixedHeadingDeg ?? ""}
              onChange={(e) => updateInt("fixedHeadingDeg", e.target.value)}
              placeholder="e.g. 180"
              className={inputClass}
            />
          </div>
        )}

        <p className="text-xs text-gray-400">
          {data.headingMode === "AUTO" && "Heading calculated from speed-weighted wind average at 5k–14k ft."}
          {data.headingMode === "RUNWAY" && "Picks whichever runway heading is most into the wind."}
          {data.headingMode === "FIXED" && "Uses this exact heading regardless of wind direction."}
        </p>

        {/* 3. Jump Profile */}
        <SectionHeader>Jump Profile</SectionHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Exit Alt (ft)</label>
            <input
              type="number"
              value={data.exitAltitudeFt}
              onChange={(e) => update("exitAltitudeFt", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Opening Alt (ft)</label>
            <input
              type="number"
              value={data.openingAltitudeFt}
              onChange={(e) => update("openingAltitudeFt", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Holding Area (ft)</label>
            <input
              type="number"
              value={data.holdingAreaAltitudeFt}
              onChange={(e) => update("holdingAreaAltitudeFt", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pattern Alt (ft)</label>
            <input
              type="number"
              value={data.patternAltitudeFt}
              onChange={(e) => update("patternAltitudeFt", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Jump Run Airspeed (kts)</label>
          <input
            type="number"
            value={data.jumpRunAirspeedKnots}
            onChange={(e) => update("jumpRunAirspeedKnots", parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>

        {/* 4. Drift Parameters */}
        <SectionHeader>Drift Parameters</SectionHeader>
        <p className="text-xs text-gray-400 -mt-2 mb-2">
          Leave blank to use defaults (shown as placeholders).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Canopy Forward Speed (mph)</label>
            <input
              type="number"
              step="any"
              value={data.canopyForwardSpeedMph ?? ""}
              onChange={(e) => updateNum("canopyForwardSpeedMph", e.target.value)}
              placeholder={String(CANOPY_FORWARD_SPEED_MPH)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Canopy Descent Rate (mph)</label>
            <input
              type="number"
              step="any"
              value={data.canopyDescentRateMph ?? ""}
              onChange={(e) => updateNum("canopyDescentRateMph", e.target.value)}
              placeholder={String(CANOPY_DESCENT_RATE_MPH)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Freefall Terminal Vel (mph)</label>
            <input
              type="number"
              step="any"
              value={data.freefallTerminalVelocityMph ?? ""}
              onChange={(e) => updateNum("freefallTerminalVelocityMph", e.target.value)}
              placeholder={String(FREEFALL_TERMINAL_VELOCITY_MPH)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Light-to-Door (mi)</label>
            <input
              type="number"
              step="any"
              value={data.lightToDoorMiles ?? ""}
              onChange={(e) => updateNum("lightToDoorMiles", e.target.value)}
              placeholder={String(LIGHT_TO_DOOR_MILES)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Airplane Drift (mi)</label>
            <input
              type="number"
              step="any"
              value={data.airplaneDriftMiles ?? ""}
              onChange={(e) => updateNum("airplaneDriftMiles", e.target.value)}
              placeholder={String(AIRPLANE_DRIFT_MILES)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Offset (mi)</label>
            <input
              type="number"
              step="any"
              value={data.maxOffsetMiles ?? ""}
              onChange={(e) => updateNum("maxOffsetMiles", e.target.value)}
              placeholder={String(MAX_OFFSET_MILES)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Jump Run Length (mi)</label>
          <input
            type="number"
            step="any"
            value={data.jumpRunLengthMiles ?? ""}
            onChange={(e) => updateNum("jumpRunLengthMiles", e.target.value)}
            placeholder={String(JUMP_RUN_LENGTH_MILES)}
            className={inputClass}
          />
        </div>

        {/* 5. Airplane */}
        <SectionHeader>Airplane</SectionHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Aircraft Name</label>
            <input
              type="text"
              value={data.aircraftName ?? ""}
              onChange={(e) => update("aircraftName", e.target.value || null)}
              placeholder="e.g. Cessna 182"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cruise Speed (kts)</label>
            <input
              type="number"
              value={data.aircraftCruiseSpeedKts ?? ""}
              onChange={(e) => updateInt("aircraftCruiseSpeedKts", e.target.value)}
              placeholder="e.g. 120"
              className={inputClass}
            />
          </div>
        </div>

        {/* 6. Separation Table */}
        <SectionHeader>Separation Table</SectionHeader>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useCustomSep}
            onChange={(e) => {
              setUseCustomSep(e.target.checked);
              if (!e.target.checked) setSepTable([...SEPARATION_TABLE]);
              setSaved(false);
            }}
            className="rounded border-gray-300"
          />
          Use custom separation table
        </label>

        {useCustomSep && (
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-gray-500 font-medium px-1">
              <span>Ground Speed (kts)</span>
              <span>Separation (sec)</span>
              <span className="w-7" />
            </div>
            {sepTable.map(([speed, secs], i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="number"
                  value={speed}
                  onChange={(e) => {
                    const next = [...sepTable] as [number, number][];
                    next[i] = [parseInt(e.target.value) || 0, secs];
                    setSepTable(next);
                    setSaved(false);
                  }}
                  className={inputClass}
                />
                <input
                  type="number"
                  value={secs}
                  onChange={(e) => {
                    const next = [...sepTable] as [number, number][];
                    next[i] = [speed, parseInt(e.target.value) || 0];
                    setSepTable(next);
                    setSaved(false);
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSepTable((t) => t.filter((_, j) => j !== i));
                    setSaved(false);
                  }}
                  className="text-red-400 hover:text-red-600 text-sm w-7"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setSepTable((t) => [...t, [0, 0]]);
                setSaved(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add row
            </button>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </form>

      {/* 7. Team Management (owner only) */}
      {isOwner && <TeamSection slug={slug} />}
    </div>
  );
}

// --- Team Management Section (owner/admin only) ---

interface TeamMember {
  id: string;
  user: { id: string; name: string | null; email: string };
}

interface PendingInvite {
  id: string;
  email: string | null;
  role: string;
  token: string;
  expiresAt: string;
}

function TeamSection({ slug }: { slug: string }) {
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MANAGER" | "STAFF">("MANAGER");
  const [inviteError, setInviteError] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const loadTeam = useCallback(async () => {
    const res = await fetch(`/api/dz/${slug}/invite`);
    if (res.ok) {
      const data = await res.json();
      setManagers(data.managers);
      setStaff(data.staff);
      setInvites(data.invites);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInviteLink("");
    setInviteSending(true);

    const res = await fetch(`/api/dz/${slug}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });

    const data = await res.json();
    setInviteSending(false);

    if (!res.ok) {
      setInviteError(data.error || "Failed to send invite");
      return;
    }

    if (data.added) {
      setInviteEmail("");
      loadTeam();
    } else if (data.inviteUrl) {
      setInviteLink(window.location.origin + data.inviteUrl);
      setInviteEmail("");
      loadTeam();
    }
  }

  async function removeMember(id: string) {
    await fetch(`/api/dz/${slug}/invite/${id}`, { method: "DELETE" });
    loadTeam();
  }

  if (loading) return null;

  return (
    <div>
      <SectionHeader>Team</SectionHeader>

      {/* Current managers */}
      {managers.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Managers</p>
          {managers.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm">
                {m.user.name || m.user.email}{" "}
                <span className="text-xs text-gray-400">{m.user.email}</span>
              </span>
              <button
                onClick={() => removeMember(m.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Current staff */}
      {staff.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Staff</p>
          {staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm">
                {s.user.name || s.user.email}{" "}
                <span className="text-xs text-gray-400">{s.user.email}</span>
              </span>
              <button
                onClick={() => removeMember(s.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Pending Invites</p>
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm">
                {inv.email || "Open link"}{" "}
                <span className="text-xs text-gray-400">({inv.role})</span>
              </span>
              <button
                onClick={() => removeMember(inv.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invite form */}
      <form onSubmit={handleInvite} className="mt-3 space-y-2">
        {inviteError && (
          <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">{inviteError}</div>
        )}
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "MANAGER" | "STAFF")}
            className="rounded-md border border-gray-300 px-2 py-2 text-sm"
          >
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
          </select>
          <button
            type="submit"
            disabled={inviteSending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {inviteSending ? "..." : "Add"}
          </button>
        </div>
      </form>

      {/* Invite link */}
      {inviteLink && (
        <div className="mt-2 rounded-md bg-green-50 p-3">
          <p className="text-xs text-green-700 mb-1">
            User not found — share this invite link:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 rounded border border-green-200 bg-white px-2 py-1 text-xs font-mono"
            />
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              className="text-xs text-green-700 hover:text-green-800 font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
