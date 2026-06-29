"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { SearchCommand } from "@/components/dashboard/SearchCommand";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { EditorPreferencesProvider } from "@/components/editor/EditorPreferencesProvider";
import { cn } from "@/lib/utils";
import type { SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import type { EditorPreferences } from "@/lib/editor-preferences";

interface DashboardShellContextValue {
  openNewItem: (slug?: string) => void;
  openNewCollection: () => void;
}

export const DashboardShellContext = createContext<DashboardShellContextValue>({
  openNewItem: () => {},
  openNewCollection: () => {},
});

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null; isPro: boolean };
  editorPreferences: EditorPreferences;
}

// Sidebar data is fetched in the server page and passed as props because this
// component needs "use client" for open/close state, preventing direct DB access.
export function DashboardShell({ children, itemTypes, collections, user, editorPreferences }: DashboardShellProps) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItemDefaultType, setNewItemDefaultType] = useState<string | undefined>();
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function openNewItem(slug?: string) {
    setNewItemDefaultType(slug);
    setNewItemOpen(true);
  }

  function openNewCollection() {
    setNewCollectionOpen(true);
  }

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

  const sidebarProps = { itemTypes, collections, user };

  return (
    <DashboardShellContext.Provider value={{ openNewItem, openNewCollection }}>
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
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
          <Sidebar onClose={() => setDesktopOpen(false)} {...sidebarProps} />
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
          <Sidebar onClose={() => setMobileOpen(false)} {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          desktopSidebarOpen={desktopOpen}
          onToggleSidebar={openSidebar}
          onNewItem={() => openNewItem()}
          onNewCollection={openNewCollection}
          onOpenSearch={() => setSearchOpen(true)}
          isPro={user.isPro}
        />

        <main id="main-content" className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <NewItemDialog
        open={newItemOpen}
        onOpenChange={setNewItemOpen}
        itemTypes={itemTypes}
        collections={collections}
        defaultTypeSlug={newItemDefaultType}
        isPro={user.isPro}
      />

      <NewCollectionDialog
        open={newCollectionOpen}
        onOpenChange={setNewCollectionOpen}
      />

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        collections={collections}
      />
    </div>
    </EditorPreferencesProvider>
    </DashboardShellContext.Provider>
  );
}
