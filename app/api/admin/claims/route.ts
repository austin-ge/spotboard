import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const claims = await prisma.dropzoneClaim.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, email: true } },
      dropzone: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(claims);
}
