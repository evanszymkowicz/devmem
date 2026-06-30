"use server";

import { requireUserId } from "@/lib/actions";
import { getSearchData as dbGetSearchData, type SearchData } from "@/lib/db/search";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSearchData(): Promise<ActionResult<SearchData>> {
  const gate = await requireUserId();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const data = await dbGetSearchData(gate.userId);
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to load search data" };
  }
}
