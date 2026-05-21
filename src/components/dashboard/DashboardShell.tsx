"use client";

import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
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
        <TopBar
          desktopSidebarOpen={desktopOpen}
          onToggleSidebar={openSidebar}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
