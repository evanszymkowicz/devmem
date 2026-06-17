# Item Types

Every saved piece of knowledge in DevMemory is an **Item**. Each item has a **type** that determines its shape, color, icon, and which fields are used. There are 7 built-in system types; users can create custom types (Pro, post-launch).

---

## System Types

### Snippet

| Property | Value |
|---|---|
| **Display name** | Snippets |
| **Slug** | `snippets` |
| **Route** | `/items/snippets` |
| **Icon** | `Code` (Lucide) |
| **Color** | `#3b82f6` (blue) |
| **Plan** | Free |

**Purpose:** Reusable code blocks — hooks, utilities, patterns, boilerplate. The most common type for developers saving and retrieving code across projects.

**Key fields used:**
- `content` — the code body (TEXT)
- `language` — programming language for syntax highlighting (e.g. `typescript`, `bash`, `dockerfile`)
- `title`, `description`, `tags`

---

### Prompt

| Property | Value |
|---|---|
| **Display name** | Prompts |
| **Slug** | `prompts` |
| **Route** | `/items/prompts` |
| **Icon** | `Sparkles` (Lucide) |
| **Color** | `#8b5cf6` (purple) |
| **Plan** | Free |

**Purpose:** AI prompt templates for use with LLMs. Often contain placeholder variables (e.g. `{{diff}}`, `{{code}}`). Targets AI-first developers who maintain prompt libraries.

**Key fields used:**
- `content` — the prompt body with optional template variables (TEXT)
- `title`, `description`, `tags`

---

### Note

| Property | Value |
|---|---|
| **Display name** | Notes |
| **Slug** | `notes` |
| **Route** | `/items/notes` |
| **Icon** | `StickyNote` (Lucide) |
| **Color** | `#fde047` (yellow) |
| **Plan** | Free |

**Purpose:** Free-form markdown notes — documentation, explanations, architecture decisions, course material. Rendered with a markdown editor.

**Key fields used:**
- `content` — markdown body (TEXT)
- `title`, `description`, `tags`

---

### Command

| Property | Value |
|---|---|
| **Display name** | Commands |
| **Slug** | `commands` |
| **Route** | `/items/commands` |
| **Icon** | `Terminal` (Lucide) |
| **Color** | `#f97316` (orange) |
| **Plan** | Free |

**Purpose:** Shell commands, CLI invocations, scripts, or multi-step terminal sequences. Replaces `.txt` files and shell history for saving useful commands.

**Key fields used:**
- `content` — the command string(s) (TEXT)
- `language` — shell flavor for syntax highlighting (e.g. `bash`)
- `title`, `description`, `tags`

---

### Link

| Property | Value |
|---|---|
| **Display name** | Links |
| **Slug** | `links` |
| **Route** | `/items/links` |
| **Icon** | `Link` (Lucide) |
| **Color** | `#10b981` (emerald) |
| **Plan** | Free |

**Purpose:** Bookmarks to external URLs — documentation, tools, articles, references. Replaces scattered browser bookmarks.

**Key fields used:**
- `url` — the external URL (URL content type)
- `title`, `description`, `tags`

---

### File

| Property | Value |
|---|---|
| **Display name** | Files |
| **Slug** | `files` |
| **Route** | `/items/files` |
| **Icon** | `File` (Lucide) |
| **Color** | `#6b7280` (gray) |
| **Plan** | Pro |

**Purpose:** Arbitrary file uploads — PDFs, context files, templates, documents. Files are stored in Cloudflare R2 via signed upload URLs.

**Key fields used:**
- `fileUrl` — Cloudflare R2 URL after upload (FILE content type)
- `fileName` — original filename
- `fileSize` — size in bytes
- `title`, `description`, `tags`

---

### Image

| Property | Value |
|---|---|
| **Display name** | Images |
| **Slug** | `images` |
| **Route** | `/items/images` |
| **Icon** | `Image` (Lucide) |
| **Color** | `#ec4899` (pink) |
| **Plan** | Pro |

**Purpose:** Image uploads — screenshots, diagrams, design references, mockups. Same R2-backed upload flow as Files, rendered inline.

**Key fields used:**
- `fileUrl` — Cloudflare R2 URL after upload (FILE content type)
- `fileName` — original filename
- `fileSize` — size in bytes
- `title`, `description`, `tags`

---

## Summary Tables

### Classification by content kind

| Kind | Types | `contentType` enum | Key field |
|---|---|---|---|
| Text | Snippet, Prompt, Note, Command | `TEXT` | `content` |
| URL | Link | `URL` | `url` |
| File upload | File, Image | `FILE` | `fileUrl`, `fileName`, `fileSize` |

### UX display order

The sidebar and type lists use a fixed canonical order (not alphabetical):

```
snippets → prompts → commands → notes → files → images → links
```

Source: `SYSTEM_TYPE_ORDER` in [src/lib/db/items.ts](../src/lib/db/items.ts).

### Shared properties (all types)

Every item has these fields regardless of type:

- `id`, `title`, `description`
- `isFavorite`, `isPinned`
- `tags` (many-to-many)
- `collections` (many-to-many via `ItemCollection`)
- `createdAt`, `updatedAt`
- `userId` (owner)
- `itemTypeId` (foreign key to `ItemType`)

### Display differences

| Type | Sidebar badge | Syntax highlighting | Inline render |
|---|---|---|---|
| Snippet | — | Yes (`language` field) | Code block |
| Prompt | — | No | Plain text / markdown |
| Note | — | No | Markdown rendered |
| Command | — | Yes (`language` field) | Code block |
| Link | — | No | Clickable URL |
| File | PRO | No | Download link |
| Image | PRO | No | Inline image |

File and Image show a **PRO** badge in the sidebar (see [src/components/sidebar/Sidebar.tsx](../src/components/sidebar/Sidebar.tsx)).

---

## Data sources

- Type definitions and seed: [prisma/seed.ts](../prisma/seed.ts)
- Prisma schema: [prisma/schema.prisma](../prisma/schema.prisma)
- Icon map: [src/lib/icon-map.ts](../src/lib/icon-map.ts)
- UX order + DB queries: [src/lib/db/items.ts](../src/lib/db/items.ts)
- Project spec: [context/project-overview.md](../context/project-overview.md) §3.1
