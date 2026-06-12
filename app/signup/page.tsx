import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/layout/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell title="Create account" subtitle="Live winds and spotting for your DZ.">
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
