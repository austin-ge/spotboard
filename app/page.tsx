import Link from "next/link";
import { prisma } from "@/lib/db";
import DirectorySearch from "@/components/dz/DirectorySearch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dropzones = await prisma.dropzone.findMany({
    where: { isPublic: true },
    select: {
      slug: true,
      name: true,
      lat: true,
      lon: true,
      airportCode: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#f0f2f7]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Spotboard
        </h1>
        <p className="text-slate-400 mt-1.5">
          Live winds &amp; spotting for{" "}
          <span className="text-slate-600 font-medium">
            {dropzones.length}
          </span>{" "}
          dropzones
        </p>
      </div>

      {/* Directory */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {dropzones.length > 0 ? (
          <DirectorySearch dropzones={dropzones} />
        ) : (
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] text-center py-16 px-8">
            <p className="text-slate-400 mb-5">No dropzones yet.</p>
            <Link
              href="/setup"
              className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-[0_2px_8px_rgba(79,70,229,0.3)]"
            >
              Create the first one
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
