import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SetupForm from "@/components/dz/SetupForm";
import AuthShell from "@/components/layout/AuthShell";

export default async function SetupPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "OPERATOR" && session.user.role !== "ADMIN") redirect("/");

  return (
    <AuthShell
      title="Create a Dropzone"
      subtitle="Set up your DZ board in a few steps."
      maxWidth="max-w-md"
    >
      <SetupForm />
    </AuthShell>
  );
}
