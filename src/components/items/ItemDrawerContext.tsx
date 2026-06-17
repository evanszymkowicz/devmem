"use client";

import { createContext, useContext } from "react";

interface ItemDrawerContextValue {
  activeItemId: string | null;
  openDrawer: (itemId: string) => void;
  closeDrawer: () => void;
}

export const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerWrapper");
  return ctx;
}
