import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug } });
  if (!dz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (dz.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    lat,
    lon,
    airportCode,
    exitAltitudeFt,
    openingAltitudeFt,
    holdingAreaAltitudeFt,
    patternAltitudeFt,
    jumpRunAirspeedKnots,
  } = body;

  const updated = await prisma.dropzone.update({
    where: { slug },
    data: {
      ...(name && { name }),
      ...(lat != null && { lat: parseFloat(lat) }),
      ...(lon != null && { lon: parseFloat(lon) }),
      ...(airportCode !== undefined && {
        airportCode: airportCode || null,
      }),
      ...(exitAltitudeFt != null && {
        exitAltitudeFt: parseInt(exitAltitudeFt),
      }),
      ...(openingAltitudeFt != null && {
        openingAltitudeFt: parseInt(openingAltitudeFt),
      }),
      ...(holdingAreaAltitudeFt != null && {
        holdingAreaAltitudeFt: parseInt(holdingAreaAltitudeFt),
      }),
      ...(patternAltitudeFt != null && {
        patternAltitudeFt: parseInt(patternAltitudeFt),
      }),
      ...(jumpRunAirspeedKnots != null && {
        jumpRunAirspeedKnots: parseInt(jumpRunAirspeedKnots),
      }),
    },
  });

  return NextResponse.json({ slug: updated.slug });
}
