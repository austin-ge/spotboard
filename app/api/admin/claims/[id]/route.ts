import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { action } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "action must be APPROVED or REJECTED" }, { status: 400 });
  }

  const claim = await prisma.dropzoneClaim.findUnique({
    where: { id },
    include: { user: true, dropzone: true },
  });

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (claim.status !== "PENDING") {
    return NextResponse.json({ error: "Claim already resolved" }, { status: 409 });
  }

  if (action === "APPROVED") {
    if (claim.claimType === "OPERATOR") {
      await prisma.$transaction([
        prisma.dropzoneClaim.update({
          where: { id },
          data: { status: "APPROVED", resolvedAt: new Date(), resolvedBy: session!.user.id },
        }),
        prisma.dropzone.update({
          where: { id: claim.dropzoneId },
          data: { ownerId: claim.userId },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: "OPERATOR" },
        }),
      ]);
    } else {
      // STAFF claim
      await prisma.$transaction([
        prisma.dropzoneClaim.update({
          where: { id },
          data: { status: "APPROVED", resolvedAt: new Date(), resolvedBy: session!.user.id },
        }),
        prisma.dropzoneStaff.create({
          data: { userId: claim.userId, dropzoneId: claim.dropzoneId },
        }),
      ]);
    }
  } else {
    await prisma.dropzoneClaim.update({
      where: { id },
      data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: session!.user.id },
    });
  }

  return NextResponse.json({ ok: true });
}
