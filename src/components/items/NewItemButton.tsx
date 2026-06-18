"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";

interface NewItemButtonProps {
  typeSlug: string;
  label: string;
}

export function NewItemButton({ typeSlug, label }: NewItemButtonProps) {
  const { openNewItem } = useDashboardShell();
  return (
    <Button size="sm" onClick={() => openNewItem(typeSlug)}>
      <Plus className="size-4" />
      {label}
    </Button>
  );
}
