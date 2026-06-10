"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Code,
  PanelLeftClose,
  Settings,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleCollectionFavorite } from "@/actions/collections";
import type { SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/icon-map";

interface SidebarProps {
  onClose: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string };
}

export function Sidebar({ onClose, itemTypes, collections, user }: SidebarProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const otherCollections = collections.filter((c) => !c.isFavorite);

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
            D
          </span>
          <span className="text-base tracking-tight">DevMemory</span>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* Scrollable sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Types */}
        <SectionHeader
          label="Types"
          open={typesOpen}
          onToggle={() => setTypesOpen((v) => !v)}
        />
        {typesOpen && (
          <ul className="mt-1 space-y-0.5">
            {itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon] ?? Code;
              return (
                <li key={type.id}>
                  <Link
                    href={`/items/${type.slug}`}
                    className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: type.color }}
                    />
                    <span className="flex-1 truncate">{type.name}</span>
                    {(type.slug === "files" || type.slug === "images") && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] font-medium text-muted-foreground">
                        PRO
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {type.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Collections */}
        <div className="mt-6">
          <SectionHeader
            label="Collections"
            open={collectionsOpen}
            onToggle={() => setCollectionsOpen((v) => !v)}
          />
          {collectionsOpen && (
            <>
              {favoriteCollections.length > 0 && (
                <>
                  <SubHeader label="Favorites" />
                  <ul className="mt-1 space-y-0.5">
                    {favoriteCollections.map((col) => (
                      <li key={col.id}>
                        <div className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <button
                            type="button"
                            aria-label="Remove from favorites"
                            onClick={() => toggleCollectionFavorite(col.id)}
                            className="shrink-0"
                          >
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                          </button>
                          <Link href={`/collections/${col.id}`} className="flex flex-1 items-center gap-2.5 truncate">
                            <span className="flex-1 truncate">{col.name}</span>
                            <span className="text-xs text-muted-foreground">{col.itemCount}</span>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {otherCollections.length > 0 && (
                <>
                  <SubHeader label="All Collections" />
                  <ul className="mt-1 space-y-0.5">
                    {otherCollections.map((col) => (
                      <li key={col.id}>
                        <div className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: col.dominantColor }}
                          />
                          <Link href={`/collections/${col.id}`} className="flex flex-1 items-center gap-2.5 truncate">
                            <span className="flex-1 truncate">{col.name}</span>
                            <span className="text-xs text-muted-foreground">{col.itemCount}</span>
                          </Link>
                          <button
                            type="button"
                            aria-label="Add to favorites"
                            onClick={() => toggleCollectionFavorite(col.id)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Star className="size-3.5 text-muted-foreground hover:fill-amber-400 hover:text-amber-400" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-3 px-2">
                <Link
                  href="/collections"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all collections →
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* User area */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span>{label}</span>
      <ChevronDown
        className={cn(
          "size-3.5 transition-transform",
          !open && "-rotate-90",
        )}
      />
    </button>
  );
}

function SubHeader({ label }: { label: string }) {
  return (
    <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {label}
    </p>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
      {initials}
    </div>
  );
}
