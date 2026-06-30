"use client";

import Link from "next/link";
import { FolderPlus, PanelLeft, Plus, Search, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  desktopSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewItem: () => void;
  onNewCollection: () => void;
  onOpenSearch: () => void;
  isPro?: boolean;
}

export function TopBar({ desktopSidebarOpen, onToggleSidebar, onNewItem, onNewCollection, onOpenSearch, isPro }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle sidebar"
        onClick={onToggleSidebar}
        className={cn("md:inline-flex", desktopSidebarOpen && "md:hidden")}
      >
        <PanelLeft className="size-4" />
      </Button>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search items and collections"
        className="relative flex h-9 w-full max-w-md items-center rounded-md border border-input bg-transparent pr-3 pl-9 text-left text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <span>Search items and collections...</span>
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {!isPro && (
          <Button variant="ghost" size="sm" aria-label="Upgrade to Pro" asChild>
            <Link href="/upgrade">
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Upgrade</span>
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Favorites" asChild>
          <Link href="/favorites">
            <Star className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" aria-label="New Collection" onClick={onNewCollection}>
          <FolderPlus className="size-4" />
          <span className="hidden sm:inline">New Collection</span>
        </Button>
        <Button size="sm" aria-label="New Item" onClick={onNewItem}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
