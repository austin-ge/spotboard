"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import ClaimBanner from "@/components/layout/ClaimBanner";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav
      className={`h-14 flex items-center px-5 gap-4 transition-colors ${
        isHome
          ? "bg-transparent absolute top-0 left-0 right-0 z-20"
          : "bg-[#0c1018]/90 backdrop-blur-sm border-b border-white/[0.06]"
      }`}
    >
      <Link href="/" className="font-bold text-lg tracking-tight text-white">
        Spotboard
      </Link>

      <Link
        href="/"
        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        Dropzones
      </Link>

      <div className="flex-1" />

      {session ? (
        <div className="flex items-center gap-3">
          <ClaimBanner />
          {(role === "OPERATOR" || role === "ADMIN") && (
            <Link
              href="/setup"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              + Create DZ
            </Link>
          )}
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
            >
              Admin
            </Link>
          )}
          <span className="text-sm text-slate-600 hidden sm:inline">
            {session.user?.name || session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
