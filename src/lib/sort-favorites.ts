import type { ItemWithType } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";

export type SortField = "name" | "date" | "type";
export type SortDirection = "asc" | "desc";

export interface FavoriteSort {
  field: SortField;
  direction: SortDirection;
}

// Collections have no item type; they sort under a single constant label so a
// "type" sort degrades gracefully to a name tie-break for them.
const COLLECTION_TYPE_LABEL = "Collection";

// Sensible default direction per field: names/types A→Z, dates newest-first.
// Matches the server's default `updatedAt desc` order when field is "date".
export function defaultDirection(field: SortField): SortDirection {
  return field === "date" ? "desc" : "asc";
}

interface Sortable {
  name: string;
  date: Date;
  type: string;
}

function compareSortable(a: Sortable, b: Sortable, sort: FavoriteSort): number {
  let result: number;
  switch (sort.field) {
    case "name":
      result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      break;
    case "type":
      result = a.type.localeCompare(b.type, undefined, { sensitivity: "base" });
      // Tie-break by name so same-type rows stay alphabetical and stable.
      if (result === 0) {
        result = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      }
      break;
    case "date":
      result = a.date.getTime() - b.date.getTime();
      break;
  }
  return sort.direction === "asc" ? result : -result;
}

export function sortFavoriteItems(
  items: ItemWithType[],
  sort: FavoriteSort,
): ItemWithType[] {
  return [...items].sort((a, b) =>
    compareSortable(
      { name: a.title, date: a.updatedAt, type: a.itemType.name },
      { name: b.title, date: b.updatedAt, type: b.itemType.name },
      sort,
    ),
  );
}

export function sortFavoriteCollections(
  collections: FavoriteCollection[],
  sort: FavoriteSort,
): FavoriteCollection[] {
  return [...collections].sort((a, b) =>
    compareSortable(
      { name: a.name, date: a.updatedAt, type: COLLECTION_TYPE_LABEL },
      { name: b.name, date: b.updatedAt, type: COLLECTION_TYPE_LABEL },
      sort,
    ),
  );
}
