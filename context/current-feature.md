# Current Feature: Collections & Settings

## Status

In Progress

## Goals

- Wire "New Collection" button to a modal dialog backed by a `createCollection` server action
- Multi-select collection picker in New Item dialog and Item Drawer edit mode so items can be added to collections on create/update
- `/collections` index page (grid of collection cards) and `/collections/[id]` detail page (collection header + item grid)
- Edit modal and delete confirmation on collection detail page; 3-dots dropdown on collection cards (Favorite, Edit, Delete)
- `/settings` route with "Change password" and "Danger zone" cards moved from `/profile`; "Settings" link in sidebar user menu

## TODOs

## Notes

Five closely related features shipped in a single branch.

### 1. Collection Create
- `src/lib/validations/collections.ts` — `createCollectionSchema`: name 1–100 chars required, description optional max 500 chars
- `src/lib/db/collections.ts` — `createCollection(userId, data)` using `prisma.collection.create`
- `src/actions/collections.ts` — `createCollection` server action: session guard, Zod parse, DB call, `revalidatePath("/dashboard")`
- `src/components/collections/NewCollectionDialog.tsx` — Dialog with name + description fields; calls server action; toast on result; `router.refresh()` on success
- `src/components/dashboard/DashboardShell.tsx` — add `newCollectionOpen` state + `openNewCollection` to `DashboardShellContext`; pass `onNewCollection` to `TopBar`; render `<NewCollectionDialog>`
- `src/components/dashboard/TopBar.tsx` — wire existing "New Collection" button to `onNewCollection` prop

### 2. Add Items To Collections
- `src/lib/validations/items.ts` — add `collectionIds: z.array(z.string()).optional()` to `createItemSchema` and `updateItemSchema`
- `src/lib/db/items.ts` — `createItem`: upsert `ItemCollection` join rows after item create; `updateItem`: atomically replace join rows (`deleteMany` + `createMany`) inside the existing `$transaction`
- `src/components/dashboard/DashboardShell.tsx` — pass `collections` prop through to `NewItemDialog`
- `src/components/items/NewItemDialog.tsx` — add multi-select collection picker (`Popover` + checkbox list)
- `src/components/items/ItemDrawerEditBody.tsx` — add same picker pre-populated from `item.collections`
- Use `Popover` + `Command` (shadcn cmdk) if installed; otherwise a scrollable checkbox list inside a `Popover`
- Follow existing `itemTypes` prop pattern — pass `collections: SidebarCollection[]` to avoid extra round-trips

### 3. Collections Page
- `src/proxy.ts` — add `/collections` and `/collections/:path*` to `isProtected` and `config.matcher`
- `src/lib/db/collections.ts` — `getCollections(userId)`: all collections, favorite-first then `createdAt` desc, `take: 200`, returns `CollectionWithTypes[]`
- `src/lib/db/collections.ts` — `getCollectionWithItems(userId, collectionId)`: single collection + items with type, 404-safe (returns `null`), items bounded `take: 200`; add `CollectionDetail` type
- `src/app/collections/page.tsx` — SSR page; `auth()` guard; `CollectionCard` grid; empty state
- `src/app/collections/[id]/page.tsx` — SSR page; `auth()` guard; `notFound()` if null; collection header + item grid; wrap in `DashboardShell`

### 4. Collection Edit / Delete
- Install shadcn `DropdownMenu` component (`npx shadcn@latest add dropdown-menu`)
- `src/lib/validations/collections.ts` — add `updateCollectionSchema`
- `src/lib/db/collections.ts` — `updateCollection(userId, collectionId, data)` scoped update; `deleteCollection(userId, collectionId)` using `deleteMany` for atomic ownership check (join rows cascade, items untouched)
- `src/actions/collections.ts` — `updateCollection` + `deleteCollection` server actions
- `src/components/collections/EditCollectionDialog.tsx` — controlled dialog; pre-fills name + description
- `src/components/collections/CollectionActionsDropdown.tsx` — 3-dots `DropdownMenu` with Favorite, Edit, Delete actions
- `src/components/dashboard/CollectionCard.tsx` — wire existing `<MoreHorizontal>` button to `CollectionActionsDropdown`
- `src/app/collections/[id]/page.tsx` — add action bar: Favorite, Edit, Delete; on delete redirect to `/collections`

### 5. Settings Page
- `src/proxy.ts` — add `/settings` to `isProtected` and `config.matcher`
- `src/app/settings/page.tsx` — SSR page; `auth()` guard; "Change password" + "Danger zone" cards moved from `/profile`
- `src/app/profile/page.tsx` — remove `ChangePasswordForm`, `DeleteAccountDialog`; keep Account info and Usage stats only
- `src/components/dashboard/Sidebar.tsx` — add "Settings" link above "Sign out" in `UserMenu` dropdown

### Architecture Notes
- No schema changes needed — existing `Collection`, `ItemCollection`, `Item` models support all five features
- Add `onNewCollection` prop through `DashboardShell` → `TopBar`, same pattern as `onNewItem`. Do NOT add a second context
- All server actions follow `{ success, data, error }` return pattern scoped to `session.user.id`

## History

- Security & Quality Audit
- Phase 1: Foundation Layout
- Phase 2: Sidebar
- Phase 3: Main Area
- Prisma 7 + Neon PostgreSQL setup
- Seed sample data
- Dashboard Collections (real data)
- Dashboard Items (real data)
- Stats & Sidebar (real data)
- Pro Badge in Sidebar
- Code Quality Quick Wins
- Auth Phase 1: NextAuth v5 + GitHub OAuth
- Auth Phase 2: Credentials provider + registration API
- Auth Phase 3: Auth UI (sign in, register, sign out)
- Email Verification on Register
- Email Verification Toggle
- Forgot Password (reset via email link)
- Rate Limiting for Auth
- Profile Page
- Fix GitHub OAuth Redirect
- Items List View
- Item List Three-Column Layout
- Vitest Unit Testing Setup
- Item Drawer
- Item Drawer Edit Mode
- Item Delete
- Item Create
- Code Editor (Monaco)
- Markdown Editor
- File Upload with Cloudflare R2
- File List View
