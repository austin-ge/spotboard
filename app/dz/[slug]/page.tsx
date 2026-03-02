import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { canEditDZ } from "@/lib/permissions";
import { buildDropzoneConfig } from "@/lib/winds/config";
import { parseMapZones } from "@/lib/mapZones";
import DZPageClient from "./DZPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: dz ? `${dz.name} — Spotboard` : "Dropzone — Spotboard",
    description: dz
      ? `Live winds and jump run for ${dz.name}`
      : "Skydiving dropzone board",
  };
}

export default async function DZPage({ params }: Props) {
  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug } });
  if (!dz) notFound();

  const config = buildDropzoneConfig(dz);
  const mapZones = parseMapZones(dz.mapZonesJson);

  const session = await auth();
  const showSettings = session?.user
    ? await canEditDZ(session.user, dz.id)
    : false;

  return (
    <DZPageClient
      name={dz.name}
      slug={dz.slug}
      lat={dz.lat}
      lon={dz.lon}
      config={config}
      showSettings={showSettings}
      mapZones={mapZones}
      mapStyle={dz.mapStyle}
    />
  );
}
