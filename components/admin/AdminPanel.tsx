"use client";

import { useEffect, useState } from "react";

type Tab = "dropzones" | "claims" | "users";

interface DZ {
  id: string;
  slug: string;
  name: string;
  verifiedDomains: string[];
  owner: { email: string };
}

interface Claim {
  id: string;
  claimType: string;
  status: string;
  emailDomain: string;
  createdAt: string;
  user: { name: string | null; email: string };
  dropzone: { name: string; slug: string };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("dropzones");

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(["dropzones", "claims", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "dropzones" && <DropzonesTab />}
      {tab === "claims" && <ClaimsTab />}
      {tab === "users" && <UsersTab />}
    </div>
  );
}

function DropzonesTab() {
  const [dzs, setDzs] = useState<DZ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dz")
      .then((r) => r.json())
      .then(setDzs)
      .finally(() => setLoading(false));
  }, []);

  async function updateDomains(id: string, domains: string[]) {
    await fetch(`/api/admin/dz/${id}/domains`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains }),
    });
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-2">
      {dzs.map((dz) => (
        <DropzoneRow key={dz.id} dz={dz} onUpdateDomains={updateDomains} />
      ))}
      {dzs.length === 0 && <p className="text-sm text-gray-400">No dropzones found.</p>}
    </div>
  );
}

function DropzoneRow({
  dz,
  onUpdateDomains,
}: {
  dz: DZ;
  onUpdateDomains: (id: string, domains: string[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [domainStr, setDomainStr] = useState(dz.verifiedDomains.join(", "));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const domains = domainStr
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    await onUpdateDomains(dz.id, domains);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-md border border-gray-200 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{dz.name}</p>
        <p className="text-xs text-gray-400">{dz.slug} &middot; {dz.owner.email}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={domainStr}
            onChange={(e) => setDomainStr(e.target.value)}
            placeholder="domain1.com, domain2.com"
            className="rounded-md border border-gray-300 px-2 py-1 text-xs w-48"
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {saving ? "..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {dz.verifiedDomains.length > 0 ? dz.verifiedDomains.join(", ") : "No domains"}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function ClaimsTab() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/claims")
      .then((r) => r.json())
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  async function resolve(id: string, action: "APPROVED" | "REJECTED") {
    await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setClaims((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-2">
      {claims.map((c) => (
        <div key={c.id} className="flex items-center gap-4 rounded-md border border-gray-200 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {c.user.name || c.user.email}{" "}
              <span className="text-xs text-gray-400 font-normal">
                wants {c.claimType} of {c.dropzone.name}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Domain: {c.emailDomain} &middot; {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => resolve(c.id, "APPROVED")}
              className="rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              Approve
            </button>
            <button
              onClick={() => resolve(c.id, "REJECTED")}
              className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
      {claims.length === 0 && <p className="text-sm text-gray-400">No pending claims.</p>}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-4 rounded-md border border-gray-200 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{u.name || u.email}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
          <select
            value={u.role}
            onChange={(e) => changeRole(u.id, e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="JUMPER">JUMPER</option>
            <option value="STAFF">STAFF</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      ))}
      {users.length === 0 && <p className="text-sm text-gray-400">No users found.</p>}
    </div>
  );
}
