"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Code,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  PanelLeftClose,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  mockCollections,
  mockItemTypeCounts,
  mockItemTypes,
  mockUser,
} from "@/lib/mock-data";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File: FileIcon,
  Image: ImageIcon,
  Link: LinkIcon,
};

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const recentCollections = mockCollections.filter((c) => !c.isFavorite);

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
            {mockItemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon] ?? Code;
              const count = mockItemTypeCounts[type.id] ?? 0;
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
                    <span className="text-xs text-muted-foreground">
                      {count}
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
                        <Link
                          href={`/collections/${col.id}`}
                          className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                          <span className="flex-1 truncate">{col.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {col.itemCount}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {recentCollections.length > 0 && (
                <>
                  <SubHeader label="All Collections" />
                  <ul className="mt-1 space-y-0.5">
                    {recentCollections.map((col) => (
                      <li key={col.id}>
                        <Link
                          href={`/collections/${col.id}`}
                          className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: collectionAccent(col.itemTypeIds[0]) }}
                          />
                          <span className="flex-1 truncate">{col.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {col.itemCount}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* User area */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <Avatar name={mockUser.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{mockUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {mockUser.email}
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

function collectionAccent(typeId: string | undefined): string {
  if (!typeId) return "#6b7280";
  const type = mockItemTypes.find((t) => t.id === typeId);
  return type?.color ?? "#6b7280";
}
