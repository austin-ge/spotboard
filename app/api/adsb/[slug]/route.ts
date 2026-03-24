import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
  AircraftData,
  AircraftPosition,
  ReadsbResponse,
} from "@/lib/adsb/types";

const READSB_URL = process.env.READSB_URL ?? "http://localhost:8078";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Look up DZ and its registered jump planes
  const dz = await prisma.dropzone.findUnique({
    where: { slug },
    select: {
      id: true,
      lat: true,
      lon: true,
      jumpPlanes: { select: { hexCode: true, tailNumber: true } },
    },
  });

  if (!dz) {
    return NextResponse.json({ error: "Dropzone not found" }, { status: 404 });
  }

  // Fetch aircraft.json from readsb aggregator
  let readsbData: ReadsbResponse;
  try {
    const res = await fetch(`${READSB_URL}/data/aircraft.json`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "ADS-B aggregator unavailable" },
        { status: 502 }
      );
    }
    readsbData = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to ADS-B aggregator" },
      { status: 502 }
    );
  }

  // Build hex → tailNumber lookup from registered planes
  const jumpPlaneMap = new Map(
    dz.jumpPlanes.map((p) => [p.hexCode.toLowerCase(), p.tailNumber])
  );

  // Filter to aircraft with valid positions
  const aircraft: AircraftPosition[] = readsbData.aircraft
    .filter((ac) => ac.lat != null && ac.lon != null)
    .map((ac) => {
      const hex = ac.hex.toLowerCase();
      const isJumpPlane = jumpPlaneMap.has(hex);

      return {
        hex,
        tailNumber: jumpPlaneMap.get(hex) ?? undefined,
        lat: ac.lat!,
        lon: ac.lon!,
        altitudeFt:
          typeof ac.alt_baro === "number" ? ac.alt_baro : null,
        groundSpeedKts: ac.gs ?? null,
        trackDeg: ac.track ?? null,
        verticalRateFpm: ac.baro_rate ?? null,
        squawk: ac.squawk ?? null,
        isJumpPlane,
        seenSec: ac.seen ?? 0,
      };
    })
    // Only include: registered jump planes + nearby aircraft within ~30nm
    .filter((ac) => {
      if (ac.isJumpPlane) return true;
      // Simple bounding box filter (~30nm ≈ 0.5°)
      const dlat = Math.abs(ac.lat - dz.lat);
      const dlon = Math.abs(ac.lon - dz.lon);
      return dlat < 0.5 && dlon < 0.5;
    });

  const data: AircraftData = {
    aircraft,
    fetchedAt: Date.now(),
    totalSeen: readsbData.aircraft.length,
  };

  return NextResponse.json(data);
}
