import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const dzs = await prisma.dropzone.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      verifiedDomains: true,
      owner: { select: { email: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(dzs);
}
