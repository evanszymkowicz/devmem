"use client";

import Link from "next/link";
import { Code, FolderOpen, Star } from "lucide-react";

import { ICON_MAP } from "@/lib/icon-map";
import { formatDateShort } from "@/lib/format-date";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import type { ItemWithType } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";

interface FavoritesViewProps {
  items: ItemWithType[];
  collections: FavoriteCollection[];
}

export function FavoritesView({ items, collections }: FavoritesViewProps) {
  if (items.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
          <Star className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">
          No favorites yet. Star an item or collection to find it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-mono">
      {items.length > 0 && (
        <Section title="Items" count={items.length}>
          {items.map((item) => (
            <ItemFavoriteRow key={item.id} item={item} />
          ))}
        </Section>
      )}

      {collections.length > 0 && (
        <Section title="Collections" count={collections.length}>
          {collections.map((col) => (
            <CollectionFavoriteRow key={col.id} collection={col} />
          ))}
        </Section>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

function Section({ title, count, children }: SectionProps) {
  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          {count}
        </span>
      </h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

const ROW_CLASS =
  "group flex w-full cursor-pointer items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50";

interface RowContentProps {
  icon: React.ReactNode;
  title: string;
  badge: string;
  date: Date;
}

function RowContent({ icon, title, badge, date }: RowContentProps) {
  return (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {badge}
      </span>
      <time className="w-12 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {formatDateShort(date)}
      </time>
    </>
  );
}

function ItemFavoriteRow({ item }: { item: ItemWithType }) {
  const { openDrawer } = useItemDrawer();
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const color = item.itemType.color;

  return (
    <button type="button" className={ROW_CLASS} onClick={() => openDrawer(item.id)}>
      <RowContent
        icon={
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            <Icon className="size-3.5" />
          </span>
        }
        title={item.title}
        badge={item.itemType.name}
        date={item.updatedAt}
      />
    </button>
  );
}

function CollectionFavoriteRow({ collection }: { collection: FavoriteCollection }) {
  const color = collection.dominantColor;

  return (
    <Link href={`/collections/${collection.id}`} className={ROW_CLASS}>
      <RowContent
        icon={
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            <FolderOpen className="size-3.5" />
          </span>
        }
        title={collection.name}
        badge="Collection"
        date={collection.updatedAt}
      />
    </Link>
  );
}
