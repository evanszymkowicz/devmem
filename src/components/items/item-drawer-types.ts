import type { ItemDetail } from "@/lib/db/items";

export interface EditState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  collectionIds: string[];
}

export function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.map((t) => t.name).join(", "),
    collectionIds: item.collections.map((ic) => ic.collection.id),
  };
}
