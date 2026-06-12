"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created but could not sign in. Try logging in.");
      return;
    }

    // If there's an invite token, redirect to accept it
    if (inviteToken) {
      router.push(`/invite/${inviteToken}`);
      return;
    }

    // Check for domain-based DZ claim match
    try {
      const claimRes = await fetch("/api/claim/check", { method: "POST" });
      if (claimRes.ok) {
        const { matches } = await claimRes.json();
        if (matches && matches.length > 0) {
          router.push("/claim");
          return;
        }
      }
    } catch {
      // Claim check failed — not critical, continue
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="error-banner">{error}</div>}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span>or continue with</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: inviteToken ? `/invite/${inviteToken}` : "/",
            })
          }
          className="btn-ghost flex items-center justify-center gap-2"
        >
          Google
        </button>
        <button
          onClick={() =>
            signIn("github", {
              callbackUrl: inviteToken ? `/invite/${inviteToken}` : "/",
            })
          }
          className="btn-ghost flex items-center justify-center gap-2"
        >
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/login" className="link-accent font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}
