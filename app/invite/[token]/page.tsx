import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AcceptInviteForm from "@/components/auth/AcceptInviteForm";

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
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Invite</h1>
          <p className="text-gray-500">This invite link is not valid.</p>
        </div>
      </main>
    );
  }

  if (invite.used) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invite Already Used</h1>
          <p className="text-gray-500">This invite has already been accepted.</p>
        </div>
      </main>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invite Expired</h1>
          <p className="text-gray-500">This invite link has expired. Ask the DZ owner for a new one.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Join {invite.dropzone.name}</h1>
        <p className="text-sm text-gray-500 mb-6">
          You&apos;ve been invited as a <span className="font-medium">{invite.role === "MANAGER" ? "Manager" : "Staff member"}</span>.
        </p>
        <AcceptInviteForm
          token={token}
          dzName={invite.dropzone.name}
          dzSlug={invite.dropzone.slug}
          role={invite.role}
        />
      </div>
    </main>
  );
}
