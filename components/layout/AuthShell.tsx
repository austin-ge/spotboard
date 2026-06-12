import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Centered dark shell for auth/onboarding pages — same atmospheric
 * backdrop as the homepage so the instrument-panel theme never breaks.
 */
export default function AuthShell({
  title,
  subtitle,
  maxWidth = "max-w-sm",
  children,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080c14] p-8">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14] via-[#0d1424] to-[#111a2e]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#0f1b3d]/40 via-transparent to-transparent" />

      <div className={`relative z-10 w-full ${maxWidth}`}>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 led-glow" style={{ color: "#34d399" }} />
        </div>
        {subtitle ? (
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
        ) : (
          <div className="mb-6" />
        )}
        <div className="panel-card p-6">{children}</div>
      </div>
    </main>
  );
}
