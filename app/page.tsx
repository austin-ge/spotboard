import Link from "next/link";
import { prisma } from "@/lib/db";
import DirectorySearch from "@/components/dz/DirectorySearch";

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
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Spotboard</h1>
          <p className="text-gray-500">
            Community skydiving winds &amp; spotting tool.
          </p>
        </div>

        {dropzones.length > 0 ? (
          <DirectorySearch dropzones={dropzones} />
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-4">No dropzones yet.</p>
            <Link
              href="/setup"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create the first one
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
