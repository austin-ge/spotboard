"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="error-banner">{error}</div>}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span>or continue with</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="link-accent font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}
