import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AcceptInviteForm from "@/components/auth/AcceptInviteForm";
import AuthShell from "@/components/layout/AuthShell";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/signup?invite=${token}`);
  }

  const invite = await prisma.dropzoneInvite.findUnique({
    where: { token },
    include: { dropzone: { select: { name: true, slug: true } } },
  });

  if (!invite) {
    return (
      <AuthShell title="Invalid Invite">
        <p className="text-slate-400 text-sm">This invite link is not valid.</p>
      </AuthShell>
    );
  }

  if (invite.used) {
    return (
      <AuthShell title="Invite Already Used">
        <p className="text-slate-400 text-sm">This invite has already been accepted.</p>
      </AuthShell>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <AuthShell title="Invite Expired">
        <p className="text-slate-400 text-sm">
          This invite link has expired. Ask the DZ owner for a new one.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Join ${invite.dropzone.name}`}
      subtitle={
        <>
          You&apos;ve been invited as a{" "}
          <span className="font-medium text-slate-300">
            {invite.role === "MANAGER" ? "Manager" : "Staff member"}
          </span>
          .
        </>
      }
      maxWidth="max-w-md"
    >
      <AcceptInviteForm
        token={token}
        dzName={invite.dropzone.name}
        dzSlug={invite.dropzone.slug}
        role={invite.role}
      />
    </AuthShell>
  );
}
