import { RegisterForm } from "@/components/auth/RegisterForm";

// Custom registration page. Submits to POST /api/auth/register and redirects to
// /sign-in on success.
export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start building your developer knowledge hub
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
