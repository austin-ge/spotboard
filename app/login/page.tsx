import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/layout/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Welcome back to the flight deck.">
      <LoginForm />
    </AuthShell>
  );
}
