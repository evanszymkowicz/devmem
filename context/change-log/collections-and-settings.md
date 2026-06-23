# Collections & Settings

## What Changed

Five closely related features shipped on a single branch:

- **Collection create** via a New Collection dialog + `createCollection` action
- **Add items to collections**: a multi-select picker on item create and in the
  drawer edit mode, with join rows synced and filtered to user-owned collections
- **`/collections` index** and **`/collections/[id]` detail** pages
- **Collection edit/delete**: a card 3-dots dropdown + a detail-page action bar
- **`/settings` page** with the change-password and danger-zone cards moved out of
  `/profile`

No schema changes were needed — the existing `Collection`, `ItemCollection`, and
`Item` models already supported all of it.

### 1. Collection Create

- **`src/lib/validations/collections.ts`** (new) — `createCollectionSchema` (name
  1–100 chars required, description optional ≤500) and `updateCollectionSchema`
  (same shape, all optional).
- **`src/lib/db/collections.ts`** — `createCollection(userId, data)`. Also
  refactored `getDashboardCollections`/`getCollections` to share a single
  `getCollectionsWithTypes(userId, take)` helper (DRY).
- **`src/actions/collections.ts`** — `createCollection` server action (session
  guard, Zod parse, `revalidatePath`). `toggleCollectionFavorite` now also
  revalidates `/collections`.
- **`src/components/collections/NewCollectionDialog.tsx`** (new) — name +
  description form; toast on result; `router.refresh()` on success.
- **`src/components/dashboard/DashboardShell.tsx`** — extended the single
  `DashboardShellContext` with `openNewCollection`; renders `<NewCollectionDialog>`;
  passes `onNewCollection` to `TopBar` and `collections` to `NewItemDialog`.
- **`src/components/dashboard/TopBar.tsx`** — wired the existing "New Collection"
  button to `onNewCollection`.

### 2. Add Items To Collections

- **`src/lib/validations/items.ts`** — added `collectionIds: z.array(z.string()).optional()`
  to `createItemSchema` and `updateItemSchema`.
- **`src/lib/db/items.ts`** — `createItem` attaches join rows via nested create;
  `updateItem` atomically replaces them (`deleteMany` + `createMany`) inside the
  existing `$transaction`. Both go through `ownedCollectionIds()`, which filters the
  requested ids to collections the user owns before any write (prevents join-table
  IDOR).
- **`src/components/collections/CollectionPicker.tsx`** (new) — shared `Popover` +
  scrollable checkbox list, used by both the create dialog and the drawer.
- **`src/components/items/NewItemDialog.tsx`** — added the picker + `collectionIds`
  form state.
- **`src/components/items/ItemDrawerEditBody.tsx`** + **`item-drawer-types.ts`** +
  **`ItemDrawer.tsx`** + **`ItemDrawerWrapper.tsx`** — `EditState.collectionIds`
  pre-populated from `item.collections`; `collections` threaded
  `ItemDrawerWrapper → ItemDrawer → ItemDrawerEditBody`; ids sent in the
  `updateItem` payload.

### 3. Collections Page

- **`src/proxy.ts`** — added `/collections` (and `/settings`) to `isProtected` and
  `config.matcher`.
- **`src/lib/db/collections.ts`** — `getCollections(userId)` (favorite-first then
  `createdAt` desc, `take: 200`) and `getCollectionWithItems(userId, collectionId)`
  (single collection + items with type, 404-safe `null`, items `take: 200`); added
  `CollectionDetail` type.
- **`src/app/collections/page.tsx`** (new) — SSR `auth()` guard, `CollectionCard`
  grid, empty state.
- **`src/app/collections/[id]/page.tsx`** (new) — SSR guard, `notFound()` if null,
  header + item grid (`FileListRow` for files, `ItemCard` otherwise), wrapped in
  `DashboardShell` + `ItemDrawerWrapper`.

### 4. Collection Edit / Delete

- **`src/components/ui/dropdown-menu.tsx`** (new) — primitive built on the project's
  `radix-ui` umbrella (matching `dialog.tsx`).
- **`src/lib/db/collections.ts`** — `updateCollection` / `deleteCollection` using
  `updateMany` / `deleteMany` for atomic ownership checks (join rows cascade, items
  untouched).
- **`src/actions/collections.ts`** — `updateCollection` + `deleteCollection`
  actions.
- **`src/components/collections/EditCollectionDialog.tsx`** (new) — pre-fills name +
  description; saves via `updateCollection`.
- **`src/components/collections/CollectionActionsDropdown.tsx`** (new) — 3-dots menu
  (Favorite / Edit / Delete with an `AlertDialog` confirm) wired into
  **`CollectionCard.tsx`**.
- **`src/components/collections/CollectionDetailActions.tsx`** (new) — detail-page
  action bar (Favorite / Edit / Delete); redirects to `/collections` on delete.

### 5. Settings Page

- **`src/app/settings/page.tsx`** (new) — SSR guard; change-password (email accounts
  only) + danger-zone cards.
- **`src/app/profile/page.tsx`** — removed those cards + their imports; keeps Account
  info and Usage stats only.
- **`src/components/dashboard/Sidebar.tsx`** — added a "Settings" link above "Sign
  out" in the `UserMenu` dropdown.

## Key Decisions

- **One context, not two** — `onNewCollection` rides the existing
  `DashboardShellContext` alongside `onNewItem` rather than adding a second context.
- **Ownership on related writes** — `ownedCollectionIds()` filters client-supplied
  `collectionIds` to owned rows before writing join rows; scoping only the parent
  item is not enough (join-table IDOR). This became a new entry in the coding
  standards and the code-scanner memory.
- **Atomic ownership** — `updateMany`/`deleteMany` scoped to `userId` instead of
  read-then-write, avoiding a TOCTOU window.
- **Reused sidebar data** — dialogs/pickers receive the already-loaded
  `SidebarCollection[]` rather than issuing extra DB round-trips.

## Known Limitations / Deferred

- The collection picker is fed by `getSidebarCollections` (`take: 50`), so a user
  with >50 collections won't see ones beyond the limit as checkboxes. No data loss:
  existing memberships to unlisted collections survive a save because they pass the
  ownership filter unchanged.
- `EditCollectionDialog` trips the pre-existing `react-hooks/set-state-in-effect`
  lint rule (same established pattern as `NewItemDialog`/`ItemDrawer`); lint baseline
  is already red on `main`. Not a regression.

## Tests

- 90/90 unit tests passing; `npm run build` clean.
- Browser-verified: create/edit/delete collections, add/remove items via picker on
  create and edit, `/collections` + detail pages (including 404 on bad id and empty
  state), card dropdown not triggering navigation, delete keeping items intact, and
  the `/profile` → `/settings` card move.
