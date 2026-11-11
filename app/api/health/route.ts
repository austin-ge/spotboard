import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe used by the container HEALTHCHECK. */
export async function GET() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db timeout")), 3000)
      ),
    ]);
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
