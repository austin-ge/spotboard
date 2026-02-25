import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DZPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug } });
  if (!dz) notFound();

  return (
    <div className="flex h-screen">
      <div className="w-96 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-1">{dz.name}</h1>
        <p className="text-sm text-gray-500 mb-6">{dz.lat.toFixed(4)}, {dz.lon.toFixed(4)}</p>
        <p className="text-sm text-gray-400">Winds data coming soon...</p>
      </div>
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Map (Mapbox token required)</p>
      </div>
    </div>
  );
}
