import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findDropzonesByEmailDomain } from "@/lib/domain";
import ClaimForm from "@/components/auth/ClaimForm";

export default async function ClaimPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const matches = await findDropzonesByEmailDomain(session.user.email);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Claim Your Dropzone</h1>
        <p className="text-sm text-gray-500 mb-6">
          We found dropzone(s) matching your email domain.
        </p>
        {matches.length > 0 ? (
          <ClaimForm matches={matches} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              No dropzones match your email domain.
            </p>
            <p className="text-sm text-gray-400">
              Don&apos;t see your DZ?{" "}
              <a href="mailto:austin@spotboard.xyz" className="text-blue-600 hover:underline">
                Contact us
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
