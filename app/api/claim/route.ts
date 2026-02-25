import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { extractEmailDomain, isFreemailDomain } from "@/lib/domain";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dropzoneId, claimType } = await req.json();

  if (!dropzoneId || !["OPERATOR", "STAFF"].includes(claimType)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const domain = extractEmailDomain(session.user.email);
  if (!domain || isFreemailDomain(domain)) {
    return NextResponse.json({ error: "Cannot claim with a freemail address" }, { status: 400 });
  }

  const dz = await prisma.dropzone.findUnique({
    where: { id: dropzoneId },
    select: { id: true, ownerId: true, verifiedDomains: true, owner: { select: { email: true } } },
  });

  if (!dz) {
    return NextResponse.json({ error: "Dropzone not found" }, { status: 404 });
  }

  if (!dz.verifiedDomains.includes(domain)) {
    return NextResponse.json({ error: "Your email domain does not match this dropzone" }, { status: 403 });
  }

  // Check existing claim
  const existingClaim = await prisma.dropzoneClaim.findUnique({
    where: { userId_dropzoneId: { userId: session.user.id, dropzoneId } },
  });
  if (existingClaim) {
    return NextResponse.json({ error: "You already have a claim for this dropzone", status: existingClaim.status }, { status: 409 });
  }

  const isSystemOwned = dz.owner.email === "system@spotboard.xyz";

  if (claimType === "STAFF") {
    // Auto-approve staff claims
    await prisma.$transaction([
      prisma.dropzoneClaim.create({
        data: {
          userId: session.user.id,
          dropzoneId,
          claimType: "STAFF",
          status: "APPROVED",
          emailDomain: domain,
          resolvedAt: new Date(),
          resolvedBy: "system",
        },
      }),
      prisma.dropzoneStaff.create({
        data: { userId: session.user.id, dropzoneId },
      }),
    ]);
    return NextResponse.json({ approved: true, role: "STAFF" });
  }

  // OPERATOR claim
  if (isSystemOwned) {
    // Auto-approve: transfer ownership
    await prisma.$transaction([
      prisma.dropzoneClaim.create({
        data: {
          userId: session.user.id,
          dropzoneId,
          claimType: "OPERATOR",
          status: "APPROVED",
          emailDomain: domain,
          resolvedAt: new Date(),
          resolvedBy: "system",
        },
      }),
      prisma.dropzone.update({
        where: { id: dropzoneId },
        data: { ownerId: session.user.id },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "OPERATOR" },
      }),
    ]);
    return NextResponse.json({ approved: true, role: "OPERATOR" });
  }

  // Real owner — pending claim
  await prisma.dropzoneClaim.create({
    data: {
      userId: session.user.id,
      dropzoneId,
      claimType: "OPERATOR",
      status: "PENDING",
      emailDomain: domain,
    },
  });
  return NextResponse.json({ approved: false, role: session.user.role });
}
