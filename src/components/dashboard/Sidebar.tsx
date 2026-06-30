"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  Code,
  Lock,
  LogOut,
  PanelLeftClose,
  Settings,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toggleCollectionFavorite } from "@/actions/collections";
import type { SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ICON_MAP } from "@/lib/icon-map";

interface SidebarProps {
  onClose: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null };
}

export function Sidebar({ onClose, itemTypes, collections, user }: SidebarProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const pathname = usePathname();

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
          <BrandLogo size="sm" />
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
              const isActive = pathname === `/items/${type.slug}`;
              return (
                <li key={type.id}>
                  <Link
                    href={`/items/${type.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/90",
                    )}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: type.color }}
                    />
                    <span className="flex-1 truncate">{type.name}</span>
                    {(type.slug === "files" || type.slug === "images") && (
                      <Lock className="size-3 shrink-0 text-sidebar-foreground/40" aria-label="Pro feature" />
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
                            className="shrink-0 rounded p-1 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
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
                            className="shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="block py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        <UserMenu user={user} />
      </div>
    </div>
  );
}

function UserMenu({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open && (
        // Dropdown opens upward, anchored to the bottom user row.
        <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-md border border-sidebar-border bg-popover p-1 shadow-md">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/sign-in" })}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
        {/* Avatar/icon navigates to the profile page. */}
        <Link
          href="/profile"
          aria-label="View profile"
          className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserAvatar name={user.name} image={user.image} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          {user.email && (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </Button>
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
      className="flex w-full items-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
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
