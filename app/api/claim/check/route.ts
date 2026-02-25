import { auth } from "@/auth";
import { findDropzonesByEmailDomain } from "@/lib/domain";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ matches: [] });
  }

  const matches = await findDropzonesByEmailDomain(session.user.email);
  return NextResponse.json({ matches });
}
