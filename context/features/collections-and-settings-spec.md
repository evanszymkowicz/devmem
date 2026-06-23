# Collections & Settings Spec

Five closely related features shipped in a single branch.

---

## 1. Collection Create

Wire the existing "New Collection" button in `TopBar` to a modal dialog with a `createCollection` server action.

### Files

- `src/lib/validations/collections.ts` — `createCollectionSchema`: name 1–100 chars required, description optional max 500 chars
- `src/lib/db/collections.ts` — `createCollection(userId, data)` using `prisma.collection.create`
- `src/actions/collections.ts` — `createCollection` server action: session guard, Zod parse, DB call, `revalidatePath("/dashboard")`
- `src/components/collections/NewCollectionDialog.tsx` — Dialog with name + description fields; calls server action; toast on result; `router.refresh()` on success
- `src/components/dashboard/DashboardShell.tsx` — add `newCollectionOpen` state + `openNewCollection` to `DashboardShellContext`; pass `onNewCollection` to `TopBar`; render `<NewCollectionDialog>`
- `src/components/dashboard/TopBar.tsx` — wire existing "New Collection" button to `onNewCollection` prop

---

## 2. Add Items To Collections

Multi-select collection picker in the New Item dialog and Item Drawer edit mode. Collections synced on create/update.

### Files

- `src/lib/validations/items.ts` — add `collectionIds: z.array(z.string()).optional()` to `createItemSchema` and `updateItemSchema`
- `src/lib/db/items.ts` — `createItem`: upsert `ItemCollection` join rows after item create; `updateItem`: atomically replace join rows (`deleteMany` + `createMany`) inside the existing `$transaction`
- `src/components/dashboard/DashboardShell.tsx` — pass `collections` prop through to `NewItemDialog` (no extra DB fetch; reuse what's already loaded)
- `src/components/items/NewItemDialog.tsx` — add multi-select collection picker (`Popover` + checkbox list); selected IDs in form state
- `src/components/items/ItemDrawerEditBody.tsx` — add same picker pre-populated from `item.collections` (already in `ItemDetail`); IDs sent in `updateItem` payload

### Notes

- Use `Popover` + `Command` (shadcn cmdk) for a searchable list if both are installed; otherwise a simple scrollable checkbox list inside a `Popover` is fine.
- `DashboardShell` already passes `itemTypes` down to `NewItemDialog` — follow the same pattern: pass a `collections: SidebarCollection[]` prop so dialogs can build pickers without an extra round-trip.

---

## 3. Collections Page

`/collections` index and `/collections/[id]` detail pages.

### Files

- `src/proxy.ts` — add `/collections` and `/collections/:path*` to `isProtected` and `config.matcher`
- `src/lib/db/collections.ts` — `getCollections(userId)`: all collections, favorite-first then `createdAt` desc, `take: 200`, returns `CollectionWithTypes[]`
- `src/lib/db/collections.ts` — `getCollectionWithItems(userId, collectionId)`: single collection + items with type, 404-safe (returns `null`), items bounded `take: 200`; add `CollectionDetail` type
- `src/app/collections/page.tsx` — SSR page; `auth()` guard; `CollectionCard` grid; empty state
- `src/app/collections/[id]/page.tsx` — SSR page; `auth()` guard; `notFound()` if null; collection header + item grid (`ItemCard` / `FileListRow` branching on type slug); wrap in `DashboardShell`

---

## 4. Collection Edit / Delete

Edit modal and delete confirmation on the detail page; 3-dots dropdown on collection cards.

### Files

- Install shadcn `DropdownMenu` component (`npx shadcn@latest add dropdown-menu`)
- `src/lib/validations/collections.ts` — add `updateCollectionSchema` (same shape as create, fields optional)
- `src/lib/db/collections.ts` — `updateCollection(userId, collectionId, data)` scoped update; `deleteCollection(userId, collectionId)` using `deleteMany` for atomic ownership check (join rows cascade, items untouched)
- `src/actions/collections.ts` — `updateCollection` + `deleteCollection` server actions; session guard; `revalidatePath`
- `src/components/collections/EditCollectionDialog.tsx` — controlled dialog; pre-fills name + description; saves via `updateCollection`; toast on result
- `src/components/collections/CollectionActionsDropdown.tsx` — 3-dots `DropdownMenu` with Favorite (reuses `toggleCollectionFavorite`), Edit (opens `EditCollectionDialog`), Delete (opens `AlertDialog` confirm)
- `src/components/dashboard/CollectionCard.tsx` — wire existing `<MoreHorizontal>` button to `CollectionActionsDropdown`
- `src/app/collections/[id]/page.tsx` — add action bar: Favorite icon, Edit button (opens `EditCollectionDialog`), Delete button (opens `AlertDialog`); on delete success redirect to `/collections`

### Notes

- `ItemCollection` is a join table — deleting a collection only removes join rows, not items.
- Use `deleteMany` for atomic ownership check in `deleteCollection`.

---

## 5. Settings Page

`/settings` route (protected); link in user menu; account-action cards moved from `/profile`.

### Files

- `src/proxy.ts` — add `/settings` to `isProtected` and `config.matcher`
- `src/app/settings/page.tsx` — SSR page; `auth()` guard; "Change password" card (email accounts only) + "Danger zone" card; both moved from `/profile`
- `src/app/profile/page.tsx` — remove `ChangePasswordForm`, `DeleteAccountDialog`, and their imports; keep Account info and Usage stats only
- `src/components/dashboard/Sidebar.tsx` — add "Settings" link above "Sign out" in `UserMenu` dropdown (`href="/settings"`)

---

## Architecture Notes

### No schema changes needed
The existing `Collection`, `ItemCollection`, and `Item` models already support all five features.

### State / data flow
- `TopBar` already has `onNewItem` prop wired through `DashboardShell`. Add an `onNewCollection` prop through the same path. Do **not** add a second context — keep the single `DashboardShellContext`.
- Sidebar `UserMenu` dropdown currently has "Sign out". Add "Settings" above it linking to `/settings`.

### Server action pattern
All server actions follow the `{ success, data, error }` return pattern and scope Prisma queries to `session.user.id`.
