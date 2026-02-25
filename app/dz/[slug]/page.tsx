import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
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

  return (
    <DZPageClient
      name={dz.name}
      slug={dz.slug}
      lat={dz.lat}
      lon={dz.lon}
      exitAltitudeFt={dz.exitAltitudeFt}
      openingAltitudeFt={dz.openingAltitudeFt}
      holdingAreaAltitudeFt={dz.holdingAreaAltitudeFt}
      patternAltitudeFt={dz.patternAltitudeFt}
      jumpRunAirspeedKnots={dz.jumpRunAirspeedKnots}
    />
  );
}
