"use client";

import { useState } from "react";

import type { SidebarCollection } from "@/lib/db/collections";
import { ItemDrawerContext } from "./ItemDrawerContext";
import { ItemDrawer } from "./ItemDrawer";

interface ItemDrawerWrapperProps {
  children: React.ReactNode;
  collections?: SidebarCollection[];
}

export function ItemDrawerWrapper({ children, collections = [] }: ItemDrawerWrapperProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  return (
    <ItemDrawerContext.Provider
      value={{
        activeItemId,
        openDrawer: setActiveItemId,
        closeDrawer: () => setActiveItemId(null),
      }}
    >
      {children}
      <ItemDrawer collections={collections} />
    </ItemDrawerContext.Provider>
  );
}
