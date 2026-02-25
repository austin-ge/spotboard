import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canEditDZ } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

const HEADING_MODES = ["AUTO", "RUNWAY", "FIXED"] as const;

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

  const allowed = await canEditDZ(session.user, dz.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Validate headingMode
  if (body.headingMode && !HEADING_MODES.includes(body.headingMode)) {
    return NextResponse.json({ error: "Invalid heading mode" }, { status: 400 });
  }

  // Validate separation table JSON
  if (body.separationTableJson != null) {
    if (!Array.isArray(body.separationTableJson)) {
      return NextResponse.json({ error: "Separation table must be an array" }, { status: 400 });
    }
    const valid = body.separationTableJson.every(
      (row: unknown) =>
        Array.isArray(row) &&
        row.length === 2 &&
        typeof row[0] === "number" &&
        typeof row[1] === "number"
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Each separation row must be [groundSpeedKts, seconds]" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.dropzone.update({
    where: { slug },
    data: {
      // Basic
      ...(body.name && { name: body.name }),
      ...(body.lat != null && { lat: parseFloat(body.lat) }),
      ...(body.lon != null && { lon: parseFloat(body.lon) }),
      ...(body.airportCode !== undefined && { airportCode: body.airportCode || null }),

      // Jump profile
      ...(body.exitAltitudeFt != null && { exitAltitudeFt: body.exitAltitudeFt }),
      ...(body.openingAltitudeFt != null && { openingAltitudeFt: body.openingAltitudeFt }),
      ...(body.holdingAreaAltitudeFt != null && { holdingAreaAltitudeFt: body.holdingAreaAltitudeFt }),
      ...(body.patternAltitudeFt != null && { patternAltitudeFt: body.patternAltitudeFt }),
      ...(body.jumpRunAirspeedKnots != null && { jumpRunAirspeedKnots: body.jumpRunAirspeedKnots }),

      // Heading
      ...(body.headingMode !== undefined && { headingMode: body.headingMode }),
      ...(body.fixedHeadingDeg !== undefined && { fixedHeadingDeg: body.fixedHeadingDeg }),
      ...(body.runwayHeading1Deg !== undefined && { runwayHeading1Deg: body.runwayHeading1Deg }),
      ...(body.runwayHeading2Deg !== undefined && { runwayHeading2Deg: body.runwayHeading2Deg }),

      // Drift
      ...(body.canopyForwardSpeedMph !== undefined && { canopyForwardSpeedMph: body.canopyForwardSpeedMph }),
      ...(body.canopyDescentRateMph !== undefined && { canopyDescentRateMph: body.canopyDescentRateMph }),
      ...(body.freefallTerminalVelocityMph !== undefined && { freefallTerminalVelocityMph: body.freefallTerminalVelocityMph }),
      ...(body.lightToDoorMiles !== undefined && { lightToDoorMiles: body.lightToDoorMiles }),
      ...(body.airplaneDriftMiles !== undefined && { airplaneDriftMiles: body.airplaneDriftMiles }),
      ...(body.maxOffsetMiles !== undefined && { maxOffsetMiles: body.maxOffsetMiles }),
      ...(body.jumpRunLengthMiles !== undefined && { jumpRunLengthMiles: body.jumpRunLengthMiles }),

      // Airplane
      ...(body.aircraftName !== undefined && { aircraftName: body.aircraftName || null }),
      ...(body.aircraftCruiseSpeedKts !== undefined && { aircraftCruiseSpeedKts: body.aircraftCruiseSpeedKts }),

      // Separation
      ...(body.separationTableJson !== undefined && { separationTableJson: body.separationTableJson }),
    },
  });

  return NextResponse.json({ slug: updated.slug });
}
