"use client";

import { useEffect, useState } from "react";
import { FolderPlus, PanelLeft, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  // Desktop: collapsible inline aside (open by default).
  // Mobile (<md): drawer overlay via Sheet (closed by default).
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer when the viewport grows to md.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const openSidebar = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setDesktopOpen(true);
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar (collapsible) */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border md:block",
          "transition-[width] duration-200 ease-in-out",
          desktopOpen ? "w-64" : "w-0",
        )}
        aria-hidden={!desktopOpen}
      >
        <div
          className={cn(
            "h-full w-64 overflow-hidden",
            !desktopOpen && "pointer-events-none opacity-0",
          )}
        >
          <Sidebar onClose={() => setDesktopOpen(false)} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Browse item types and collections.
            </SheetDescription>
          </SheetHeader>
          <Sidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle sidebar"
            onClick={openSidebar}
            className={cn("md:inline-flex", desktopOpen && "md:hidden")}
          >
            <PanelLeft className="size-4" />
          </Button>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              aria-label="Search items"
              className="pl-9"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FolderPlus className="size-4" />
              <span className="hidden sm:inline">New Collection</span>
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New Item</span>
            </Button>
          </div>
        </header>

        {/* Main area (placeholder — built in Phase 3) */}
        <main className="flex flex-1 items-center justify-center overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
