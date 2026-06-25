# Future Items

Low-priority improvements and UX polish notes that aren't worth a dedicated feature branch right now. Add here instead of letting them get lost.

---

## UX

- **Favorite toggle success toast** — Pin shows "Item pinned" / "Item unpinned" on success; Favorite is silent (star fills/unfills but no toast). Inconsistent. `use-item-favorite.ts` and `ItemDrawer.tsx → handleToggleFavorite` are the places to add it.
