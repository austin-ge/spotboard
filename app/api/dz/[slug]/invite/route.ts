import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug }, select: { id: true, ownerId: true } });
  if (!dz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = dz.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [managers, staff, invites] = await Promise.all([
    prisma.dropzoneManager.findMany({
      where: { dropzoneId: dz.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.dropzoneStaff.findMany({
      where: { dropzoneId: dz.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.dropzoneInvite.findMany({
      where: { dropzoneId: dz.id, used: false, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, role: true, token: true, createdAt: true, expiresAt: true },
    }),
  ]);

  return NextResponse.json({ managers, staff, invites });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const dz = await prisma.dropzone.findUnique({ where: { slug }, select: { id: true, ownerId: true } });
  if (!dz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = dz.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Only the DZ owner can invite team members" }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!["MANAGER", "STAFF"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // If email provided, check if user exists
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Immediately add them as manager/staff
      if (role === "MANAGER") {
        await prisma.dropzoneManager.upsert({
          where: { userId_dropzoneId: { userId: existingUser.id, dropzoneId: dz.id } },
          update: {},
          create: { userId: existingUser.id, dropzoneId: dz.id },
        });
      } else {
        await prisma.dropzoneStaff.upsert({
          where: { userId_dropzoneId: { userId: existingUser.id, dropzoneId: dz.id } },
          update: {},
          create: { userId: existingUser.id, dropzoneId: dz.id },
        });
      }

      // Also create invite record for tracking
      const invite = await prisma.dropzoneInvite.create({
        data: {
          dropzoneId: dz.id,
          email,
          role,
          used: true,
          usedBy: existingUser.id,
          expiresAt,
        },
      });

      return NextResponse.json({ added: true, invite });
    }
  }

  // User doesn't exist or no email — create invite with token
  const invite = await prisma.dropzoneInvite.create({
    data: {
      dropzoneId: dz.id,
      email: email || null,
      role,
      expiresAt,
    },
  });

  return NextResponse.json({
    added: false,
    invite,
    inviteUrl: `/invite/${invite.token}`,
  });
}
