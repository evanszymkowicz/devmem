import Link from "next/link";

// Shared layout for the auth pages (/sign-in, /register): a centered card on a
// plain background, with the DevMemory wordmark above it.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
          D
        </span>
        <span className="text-lg tracking-tight">DevMemory</span>
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
