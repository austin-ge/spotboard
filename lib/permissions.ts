import { prisma } from "@/lib/db";

type SessionUser = {
  id: string;
  role: string;
};

export async function canEditDZ(user: SessionUser, dropzoneId: string): Promise<boolean> {
  // Admins can edit any DZ
  if (user.role === "ADMIN") return true;

  // Check if owner
  const dz = await prisma.dropzone.findUnique({
    where: { id: dropzoneId },
    select: { ownerId: true },
  });
  if (dz?.ownerId === user.id) return true;

  // Check if manager
  const manager = await prisma.dropzoneManager.findUnique({
    where: { userId_dropzoneId: { userId: user.id, dropzoneId } },
  });
  return !!manager;
}

export async function isManagerOf(userId: string, dropzoneId: string): Promise<boolean> {
  const record = await prisma.dropzoneManager.findUnique({
    where: { userId_dropzoneId: { userId, dropzoneId } },
  });
  return !!record;
}

export async function isOwnerOf(userId: string, dropzoneId: string): Promise<boolean> {
  const dz = await prisma.dropzone.findUnique({
    where: { id: dropzoneId },
    select: { ownerId: true },
  });
  return dz?.ownerId === userId;
}
