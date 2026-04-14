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
          : "bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <Link
        href="/"
        className={`font-bold text-lg tracking-tight ${
          isHome ? "text-white" : "text-slate-900"
        }`}
      >
        Spotboard
      </Link>

      <Link
        href="/"
        className={`text-sm transition-colors ${
          isHome
            ? "text-slate-500 hover:text-slate-300"
            : "text-gray-500 hover:text-gray-900"
        }`}
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
              className={`text-sm font-medium ${
                isHome
                  ? "text-emerald-400 hover:text-emerald-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              + Create DZ
            </Link>
          )}
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className={`text-sm font-medium ${
                isHome
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </Link>
          )}
          <span
            className={`text-sm ${
              isHome ? "text-slate-600" : "text-gray-400"
            }`}
          >
            {session.user?.name || session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`text-sm ${
              isHome
                ? "text-slate-600 hover:text-slate-400"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm ${
              isHome
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`text-sm font-medium ${
              isHome
                ? "text-emerald-400 hover:text-emerald-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
