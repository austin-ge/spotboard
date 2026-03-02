import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminPanel from "@/components/admin/AdminPanel";

const BOOTSTRAP_EMAILS = ["austin@spotboard.xyz", "austin@skydivemidwest.com"];

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "ADMIN" && !BOOTSTRAP_EMAILS.includes(session.user.email ?? "")) {
    redirect("/");
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <AdminPanel />
    </main>
  );
}
