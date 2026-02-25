import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SetupForm from "@/components/dz/SetupForm";

export default async function SetupPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "OPERATOR" && session.user.role !== "ADMIN") redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Create a Dropzone</h1>
        <p className="text-sm text-gray-500 mb-6">
          Set up your DZ board in a few steps.
        </p>
        <SetupForm />
      </div>
    </main>
  );
}
