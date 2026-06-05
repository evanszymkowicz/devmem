import { Folder, Package, Star, StarOff } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardStats } from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devmemory.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function StatsCards() {
  const userId = await getDemoUserId();
  const stats = userId
    ? await getDashboardStats(userId)
    : { totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 };

  const cards = [
    { label: "Items", value: stats.totalItems, Icon: Package },
    { label: "Collections", value: stats.totalCollections, Icon: Folder },
    { label: "Favorite Items", value: stats.favoriteItems, Icon: Star },
    { label: "Favorite Collections", value: stats.favoriteCollections, Icon: StarOff },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map(({ label, value, Icon }) => (
        <Card key={label} size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Icon className="size-3.5" />
              {label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
