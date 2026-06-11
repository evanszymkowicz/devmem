import { SignInForm } from "@/components/auth/SignInForm";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

// Custom sign-in page (replaces NextAuth's default). The proxy redirects
// unauthenticated /dashboard visitors here with a callbackUrl to return to.
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your DevMemory account
        </p>
      </div>
      <SignInForm callbackUrl={callbackUrl ?? "/dashboard"} />
    </div>
  );
}
