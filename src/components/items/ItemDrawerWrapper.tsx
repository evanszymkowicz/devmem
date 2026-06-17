"use client";

import { useState } from "react";

import { ItemDrawerContext } from "./ItemDrawerContext";
import { ItemDrawer } from "./ItemDrawer";

export function ItemDrawerWrapper({ children }: { children: React.ReactNode }) {
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
      <ItemDrawer />
    </ItemDrawerContext.Provider>
  );
}
