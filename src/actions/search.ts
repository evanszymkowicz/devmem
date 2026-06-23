"use server";

import { auth } from "@/auth";
import { getSearchData as dbGetSearchData, type SearchData } from "@/lib/db/search";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSearchData(): Promise<ActionResult<SearchData>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const data = await dbGetSearchData(session.user.id);
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to load search data" };
  }
}
