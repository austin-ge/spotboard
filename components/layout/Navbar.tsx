"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ClaimBanner from "@/components/layout/ClaimBanner";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <nav className="h-14 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center px-4 gap-4">
      <Link href="/" className="font-bold text-lg tracking-tight">
        Spotboard
      </Link>

      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Create DZ
            </Link>
          )}
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Admin
            </Link>
          )}
          <span className="text-sm text-gray-400">
            {session.user?.name || session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
