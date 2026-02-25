import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const VALID_ROLES = ["JUMPER", "STAFF", "OPERATOR", "ADMIN"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { role } = await req.json();

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
