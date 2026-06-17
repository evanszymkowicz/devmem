# Item CRUD Architecture

A unified system for creating, reading, updating, and deleting all 7 item types. The key principle: **the actions file is type-agnostic; type-specific logic lives in components**.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # All mutations: create, update, delete, toggleFavorite, togglePinned
├── lib/
│   ├── db/
│   │   └── items.ts                # Read queries (already exists; extend with getItemsByType, getItemById)
│   └── validations/
│       └── items.ts                # Zod schemas for create/update, per contentType
├── app/
│   └── items/
│       └── [slug]/
│           └── page.tsx            # Dynamic route: resolves slug → ItemType, lists items, owns drawer state
└── components/
    └── items/
        ├── ItemDrawer.tsx          # Sheet wrapper — open/close, view/edit mode switching
        ├── ItemDrawerContent.tsx   # Read-only view; adapts by contentType (code block / markdown / link / file)
        ├── ItemForm.tsx            # Create/edit form shell; receives ItemType, renders the right field section
        ├── ItemFormFields/
        │   ├── TextFields.tsx      # content + language (Snippet, Prompt, Note, Command)
        │   ├── UrlFields.tsx       # url (Link)
        │   └── FileFields.tsx      # file upload (File, Image) — Pro only
        └── ItemTypePageHeader.tsx  # Page heading: type name, icon, color, item count, New Item button
```

---

## `/items/[slug]` Routing

The dynamic segment is the `ItemType.slug` (e.g., `snippets`, `prompts`).

**How it resolves:**

```
/items/snippets
  → page.tsx receives params.slug = "snippets"
  → queries ItemType where { slug: "snippets", userId: null }  (system type)
  → falls back to { slug: "snippets", userId: session.user.id } (custom type)
  → 404 if not found or not owned by the current user
  → fetches items where { userId, itemTypeId: type.id }
  → renders the list + mounts ItemDrawer
```

The page resolves the slug once; the resolved `ItemType` is passed as a prop to all child components — no per-component re-fetching.

**Drawer state lives in the page (`"use client"` wrapper or a client shell component):**

```typescript
type DrawerMode = "closed" | "view" | "create" | "edit";

const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
const [selectedItem, setSelectedItem] = useState<ItemWithType | null>(null);
```

Items never navigate to their own page — they always open in the drawer.

---

## Mutations: `src/actions/items.ts`

One file, all 7 types. The action does not branch on type — it accepts a validated payload and writes it.

```typescript
"use server";

// createItem — accepts any valid item payload; contentType is resolved server-side
// from the ItemType record, not trusted from the client.
export async function createItem(input: CreateItemInput): Promise<ActionResult<Item>>

// updateItem — partial update; only fields present in the payload are changed.
export async function updateItem(id: string, input: UpdateItemInput): Promise<ActionResult<Item>>

// deleteItem — cascades to ItemCollection rows via the schema constraint.
export async function deleteItem(id: string): Promise<ActionResult<void>>

// toggleItemFavorite / toggleItemPinned — atomic read-modify-write like the
// existing toggleCollectionFavorite pattern.
export async function toggleItemFavorite(id: string): Promise<ActionResult<void>>
export async function toggleItemPinned(id: string): Promise<ActionResult<void>>
```

**Every action:**
1. Reads the session (`await auth()`), asserts it exists.
2. Scopes all Prisma queries to `userId: session.user.id` — never uses a client-supplied userId.
3. Calls `revalidatePath("/items/[slug]")` and `revalidatePath("/dashboard")` on success.
4. Returns `{ success: true, data }` or `{ success: false, error: string }`.

**`contentType` is never supplied by the client.** On create, the action fetches the `ItemType` by the client-supplied `itemTypeId`, reads its `slug`, and derives `contentType` from a server-side mapping:

```typescript
const SLUG_TO_CONTENT_TYPE: Record<string, ContentType> = {
  snippets: "TEXT",
  prompts:  "TEXT",
  notes:    "TEXT",
  commands: "TEXT",
  links:    "URL",
  files:    "FILE",
  images:   "FILE",
};
```

---

## Validation: `src/lib/validations/items.ts`

Base schema shared by all types, plus a Zod discriminated union for the content-kind-specific fields.

```typescript
// Shared fields (all types)
const baseSchema = z.object({
  title:       z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  tags:        z.array(z.string()).max(20).optional(),
  itemTypeId:  z.string().cuid(),
});

// TEXT types
const textSchema = baseSchema.extend({
  content:  z.string().min(1),
  language: z.string().max(50).optional(),
});

// URL types
const urlSchema = baseSchema.extend({
  url: z.string().url(),
});

// FILE types — file upload is handled separately via R2 signed URLs;
// the action receives the resulting fileUrl, fileName, fileSize.
const fileSchema = baseSchema.extend({
  fileUrl:  z.string().url(),
  fileName: z.string().max(255),
  fileSize: z.number().int().positive(),
});

export const createItemSchema = z.discriminatedUnion("kind", [
  textSchema.extend({ kind: z.literal("TEXT") }),
  urlSchema.extend({ kind: z.literal("URL") }),
  fileSchema.extend({ kind: z.literal("FILE") }),
]);
```

The `kind` field is added by the form before submission and is derived from the `ItemType` — the user never picks it directly.

---

## Data Fetching: `src/lib/db/items.ts`

Extend the existing file with two new functions:

```typescript
// Called by the /items/[slug] page to list all items of a given type.
// Bounded by MAX_ITEMS_PER_PAGE; supports cursor-based pagination later.
export async function getItemsByType(
  userId: string,
  itemTypeId: string,
  limit = 50,
): Promise<ItemWithType[]>

// Called when opening an item in the drawer (if only partial data was fetched
// in the list view — e.g., content is omitted from list queries for performance).
export async function getItemById(
  userId: string,
  itemId: string,
): Promise<ItemWithType | null>
```

The limit constant goes in `src/lib/db/limits.ts` alongside existing constants.

---

## Component Responsibilities

### `ItemDrawer`
- Thin wrapper around shadcn `Sheet`
- Receives `mode`, `item`, `itemType`, and callbacks (`onClose`, `onEdit`, `onDelete`)
- Switches between `ItemDrawerContent` (view mode) and `ItemForm` (create/edit mode)
- Does not fetch data — receives everything as props

### `ItemDrawerContent`
- Read-only view of a single item
- Action row: Favorite, Pin, Copy, Edit, Delete buttons
- Delegates content rendering by `item.contentType`:
  - `TEXT` → syntax-highlighted code block (Snippet, Command) or rendered markdown (Note) or plain text (Prompt)
  - `URL` → clickable link with the URL displayed
  - `FILE` → download link (File) or inline `<img>` (Image)
- Shows tags, collection memberships, created/updated dates
- Does not know about item type names — reads `item.itemType.icon` and `item.itemType.color` from the data

### `ItemForm`
- Receives `ItemType` (determines which field section to render) and optionally an existing `Item` (edit mode)
- Renders shared fields (title, description, tags) always
- Renders exactly one of `TextFields`, `UrlFields`, or `FileFields` based on `itemType.slug`'s content kind
- Calls `createItem` or `updateItem` server action on submit
- Closes the drawer and triggers `router.refresh()` on success

### `TextFields` / `UrlFields` / `FileFields`
- Isolated field groups; each knows only about its own fields
- `TextFields` renders a `<textarea>` for content and an optional language selector
- `UrlFields` renders a URL input
- `FileFields` handles the R2 signed-URL upload flow; sets `fileUrl`, `fileName`, `fileSize` on the parent form state after upload completes

---

## Where Type-Specific Logic Lives

| Concern | Location |
|---|---|
| Which fields to show in the form | `ItemForm` (switches on `itemType.slug`) |
| How to render content in the drawer | `ItemDrawerContent` (switches on `item.contentType`) |
| What `contentType` an item will have | `items.ts` action (server-side mapping from slug) |
| Icon and color | Derived from `item.itemType` at render time via `ICON_MAP` |
| Pro gating (File, Image) | `ItemForm` / `FileFields` (checks `session.user.isPro`) |
| Syntax language options | `TextFields` (local constant list) |

The action and DB layer never branch on item type. All branching is in the component layer.

---

## Sources

- [prisma/schema.prisma](../prisma/schema.prisma) — Item and ItemType models
- [src/lib/db/items.ts](../src/lib/db/items.ts) — existing read queries
- [src/actions/collections.ts](../src/actions/collections.ts) — action pattern to follow
- [src/components/dashboard/ItemRow.tsx](../src/components/dashboard/ItemRow.tsx) — existing type-adaptive component
- [docs/item-types.md](./item-types.md) — type reference (icons, colors, slugs, content kinds)
- [context/project-overview.md](../context/project-overview.md) — drawer UX spec, coding standards
