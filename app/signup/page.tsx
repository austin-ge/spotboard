import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}
