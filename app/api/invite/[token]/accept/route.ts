import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const invite = await prisma.dropzoneInvite.findUnique({
    where: { token },
    include: { dropzone: { select: { id: true, slug: true, name: true } } },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (invite.used) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 410 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  // If invite is email-targeted, verify the user's email matches
  if (invite.email && invite.email !== session.user.email) {
    return NextResponse.json({ error: "This invite was sent to a different email address" }, { status: 403 });
  }

  // Add user as manager or staff
  if (invite.role === "MANAGER") {
    await prisma.dropzoneManager.upsert({
      where: { userId_dropzoneId: { userId: session.user.id, dropzoneId: invite.dropzoneId } },
      update: {},
      create: { userId: session.user.id, dropzoneId: invite.dropzoneId },
    });
  } else {
    await prisma.dropzoneStaff.upsert({
      where: { userId_dropzoneId: { userId: session.user.id, dropzoneId: invite.dropzoneId } },
      update: {},
      create: { userId: session.user.id, dropzoneId: invite.dropzoneId },
    });
  }

  // Mark invite as used
  await prisma.dropzoneInvite.update({
    where: { token },
    data: { used: true, usedBy: session.user.id },
  });

  return NextResponse.json({
    ok: true,
    role: invite.role,
    dropzone: invite.dropzone,
  });
}
