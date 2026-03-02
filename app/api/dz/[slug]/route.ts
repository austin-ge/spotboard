import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canEditDZ } from "@/lib/permissions";
import { MAX_ZONES } from "@/lib/mapZones";
import { NextRequest, NextResponse } from "next/server";

const HEADING_MODES = ["AUTO", "RUNWAY", "FIXED"] as const;
const MAP_STYLES = ["SATELLITE", "SATELLITE_STREETS", "OUTDOORS", "STREETS", "LIGHT", "DARK"] as const;

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

  // Validate mapStyle
  if (body.mapStyle && !MAP_STYLES.includes(body.mapStyle)) {
    return NextResponse.json({ error: "Invalid map style" }, { status: 400 });
  }

  // Validate map zones JSON
  if (body.mapZonesJson != null) {
    if (!Array.isArray(body.mapZonesJson)) {
      return NextResponse.json({ error: "Map zones must be an array" }, { status: 400 });
    }
    if (body.mapZonesJson.length > MAX_ZONES) {
      return NextResponse.json({ error: `Maximum ${MAX_ZONES} zones allowed` }, { status: 400 });
    }
    const validZones = body.mapZonesJson.every(
      (z: unknown) =>
        z != null &&
        typeof z === "object" &&
        typeof (z as Record<string, unknown>).id === "string" &&
        typeof (z as Record<string, unknown>).label === "string" &&
        typeof (z as Record<string, unknown>).color === "string" &&
        (z as Record<string, unknown>).geometry != null &&
        typeof (z as Record<string, unknown>).geometry === "object" &&
        ((z as Record<string, unknown>).geometry as Record<string, unknown>).type === "Polygon" &&
        Array.isArray(((z as Record<string, unknown>).geometry as Record<string, unknown>).coordinates)
    );
    if (!validZones) {
      return NextResponse.json(
        { error: "Each zone must have id, label, color, and Polygon geometry" },
        { status: 400 }
      );
    }
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

  try {
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

        // Map style
        ...(body.mapStyle !== undefined && { mapStyle: body.mapStyle }),

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

        // Map zones
        ...(body.mapZonesJson !== undefined && { mapZonesJson: body.mapZonesJson }),
      },
    });

    return NextResponse.json({ slug: updated.slug });
  } catch (err) {
    console.error("Failed to update dropzone:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to update: ${message}` }, { status: 500 });
  }
}
