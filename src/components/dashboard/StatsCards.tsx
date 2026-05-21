import { Folder, Package, Star, StarOff } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockCollections, mockItems } from "@/lib/mock-data";

export function StatsCards() {
  const totalItems = mockItems.length;
  const totalCollections = mockCollections.length;
  const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
  const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

  const stats = [
    { label: "Items", value: totalItems, Icon: Package },
    { label: "Collections", value: totalCollections, Icon: Folder },
    { label: "Favorite Items", value: favoriteItems, Icon: Star },
    {
      label: "Favorite Collections",
      value: favoriteCollections,
      Icon: StarOff,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(({ label, value, Icon }) => (
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
