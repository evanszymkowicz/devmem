import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileData } from "@/lib/db/profile";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [profile, itemTypes, collections] = await Promise.all([
    getProfileData(userId),
    getSystemItemTypes(userId),
    getSidebarCollections(userId),
  ]);

  const sidebarUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={sidebarUser}
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account security and data
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {/* Change password — only for email/password accounts */}
          {profile.hasPassword && (
            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          )}

          {/* Danger zone */}
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
