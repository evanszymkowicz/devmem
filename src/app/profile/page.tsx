import Link from "next/link";

// Placeholder profile page. The sidebar avatar links here (per the Phase 3 spec);
// a full profile/settings experience is out of scope for this phase.
export default function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-muted-foreground">
        Profile settings are coming soon.
      </p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-foreground hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
