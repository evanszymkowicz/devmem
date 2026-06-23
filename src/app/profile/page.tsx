import { Code } from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileData } from "@/lib/db/profile";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICON_MAP } from "@/lib/icon-map";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [profile, itemTypes, collections, editorPreferences] =
    await Promise.all([
      getProfileData(userId),
      getSystemItemTypes(userId),
      getSidebarCollections(userId),
      getEditorPreferences(userId),
    ]);

  const sidebarUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  const memberSince = profile.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={sidebarUser}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your account details and usage stats
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {/* Account info */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={profile.name ?? profile.email}
                  image={profile.image}
                  className="size-16 text-xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-medium">
                    {profile.name ?? "—"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-2xl font-semibold">{profile.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total items</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-2xl font-semibold">
                    {profile.totalCollections}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total collections
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {profile.itemsByType.map((t) => {
                  const Icon = ICON_MAP[t.icon] ?? Code;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5"
                    >
                      <Icon
                        className="size-4 shrink-0"
                        style={{ color: t.color }}
                      />
                      <span className="flex-1 text-sm">{t.name}</span>
                      <span className="text-sm font-medium tabular-nums">
                        {t.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
