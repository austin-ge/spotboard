import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug: customSlug, lat, lon, airportCode } = body;

  if (!name || lat == null || lon == null) {
    return NextResponse.json(
      { error: "Name, latitude, and longitude are required" },
      { status: 400 }
    );
  }

  const slug = customSlug || generateSlug(name);

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  const existing = await prisma.dropzone.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A dropzone with this slug already exists" },
      { status: 409 }
    );
  }

  const dz = await prisma.dropzone.create({
    data: {
      name,
      slug,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      airportCode: airportCode || null,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ slug: dz.slug }, { status: 201 });
}

export async function GET() {
  const dropzones = await prisma.dropzone.findMany({
    where: { isPublic: true },
    select: {
      slug: true,
      name: true,
      lat: true,
      lon: true,
      airportCode: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(dropzones);
}
