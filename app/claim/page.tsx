import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findDropzonesByEmailDomain } from "@/lib/domain";
import ClaimForm from "@/components/auth/ClaimForm";
import AuthShell from "@/components/layout/AuthShell";

export default async function ClaimPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const matches = await findDropzonesByEmailDomain(session.user.email);

  return (
    <AuthShell
      title="Claim Your Dropzone"
      subtitle="We found dropzone(s) matching your email domain."
      maxWidth="max-w-md"
    >
      {matches.length > 0 ? (
        <ClaimForm matches={matches} />
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">
            No dropzones match your email domain.
          </p>
          <p className="text-sm text-slate-500">
            Don&apos;t see your DZ?{" "}
            <a href="mailto:austin@spotboard.xyz" className="link-accent">
              Contact us
            </a>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
