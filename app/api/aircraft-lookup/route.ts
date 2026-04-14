import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const reg = req.nextUrl.searchParams.get("reg")?.trim().toUpperCase();

  if (!reg) {
    return NextResponse.json(
      { error: "Missing reg parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(reg)}`,
      { cache: "force-cache" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Aircraft not found" },
        { status: 404 }
      );
    }

    const data = await res.json();
    const aircraft = data?.response?.aircraft;

    if (!aircraft?.mode_s) {
      return NextResponse.json(
        { error: "Aircraft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hexCode: aircraft.mode_s.toLowerCase(),
      registration: aircraft.registration,
      type: aircraft.icao_type || aircraft.type || null,
      owner: aircraft.registered_owner || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Lookup service unavailable" },
      { status: 502 }
    );
  }
}
