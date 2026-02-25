import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { domains } = await req.json();

  if (!Array.isArray(domains) || !domains.every((d: unknown) => typeof d === "string")) {
    return NextResponse.json({ error: "domains must be an array of strings" }, { status: 400 });
  }

  const cleaned = domains.map((d: string) => d.toLowerCase().trim()).filter(Boolean);

  const dz = await prisma.dropzone.update({
    where: { id },
    data: { verifiedDomains: cleaned },
  });

  return NextResponse.json({ id: dz.id, verifiedDomains: dz.verifiedDomains });
}
