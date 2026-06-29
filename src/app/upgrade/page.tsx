import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradePricing } from "@/components/upgrade/UpgradePricing";

export const metadata = {
  title: "Upgrade to Pro — DevMemory",
};

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  if (session.user.isPro) redirect("/settings#billing");

  const userId = session.user.id;

  const [itemTypes, collections, editorPreferences] = await Promise.all([
    getSystemItemTypes(userId),
    getSidebarCollections(userId),
    getEditorPreferences(userId),
  ]);

  const sidebarUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
    isPro: false,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={sidebarUser}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Upgrade to Pro
          </h1>
          <p className="mt-3 text-[1.05rem] text-muted-foreground">
            Unlock unlimited items, file uploads, AI features, and more.
          </p>
        </header>

        <UpgradePricing />
      </div>
    </DashboardShell>
  );
}
