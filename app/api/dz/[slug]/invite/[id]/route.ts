import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canEditDZ } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, id } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug }, select: { id: true } });
  if (!dz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canEditDZ(session.user, dz.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Try deleting from each table
  const [deletedManager, deletedStaff, deletedInvite] = await Promise.all([
    prisma.dropzoneManager.deleteMany({ where: { id, dropzoneId: dz.id } }),
    prisma.dropzoneStaff.deleteMany({ where: { id, dropzoneId: dz.id } }),
    prisma.dropzoneInvite.deleteMany({ where: { id, dropzoneId: dz.id } }),
  ]);

  if (deletedManager.count + deletedStaff.count + deletedInvite.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
