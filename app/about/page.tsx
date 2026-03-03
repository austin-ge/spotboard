import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Spotboard",
  description:
    "Spotboard is an open-source, multi-tenant skydiving winds and spotting platform.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f0f2f7]">
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          About Spotboard
        </h1>
        <p className="text-slate-400 mt-1.5 mb-10">
          Live winds &amp; spotting for skydiving dropzones
        </p>

        <div className="space-y-6">
          {/* What is Spotboard */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              What is Spotboard?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Spotboard is a multi-tenant platform that gives skydiving dropzones
              real-time wind forecasts, jump run calculations, and aircraft
              spotting tools — all in one place. It pulls winds aloft data from
              the GFS forecast model and computes exit points, offset distances,
              and green-light positions so jumpers and pilots can make better
              decisions.
            </p>
          </section>

          {/* How it works */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              How It Works
            </h2>
            <ul className="space-y-3 text-slate-600 leading-relaxed">
              <li>
                <span className="font-medium text-slate-800">Winds Aloft</span>{" "}
                — GFS forecast data from the Open-Meteo API at multiple pressure
                levels, mapped to altitudes relevant to skydiving.
              </li>
              <li>
                <span className="font-medium text-slate-800">Jump Run</span>{" "}
                — The aircraft heading is automatically calculated from upper
                winds (5,000–14,000 ft) so the plane flies into the prevailing
                wind.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  Offset &amp; Green Light
                </span>{" "}
                — Exit and opening points are computed by accounting for canopy
                drift, freefall drift, and ground speed.
              </li>
              <li>
                <span className="font-medium text-slate-800">
                  ADS-B Tracking
                </span>{" "}
                — Live aircraft positions via a local dump1090 receiver or the
                adsb.lol public API.
              </li>
            </ul>
          </section>

          {/* Tech */}
          <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Built With
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js",
                "TypeScript",
                "React",
                "PostgreSQL",
                "Prisma",
                "Mapbox GL",
                "Tailwind CSS",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            &larr; Back to directory
          </Link>
        </div>
      </div>
    </main>
  );
}
