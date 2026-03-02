import { auth } from "@/auth";
import { NextResponse } from "next/server";

const BOOTSTRAP_EMAILS = ["austin@spotboard.xyz", "austin@skydivemidwest.com"];

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  if (session.user.role !== "ADMIN" && !BOOTSTRAP_EMAILS.includes(session.user.email ?? "")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
