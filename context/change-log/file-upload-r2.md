# File Upload with Cloudflare R2

## What Changed

Added file and image upload support using Cloudflare R2 with a presigned URL pattern. Next.js never handles file bytes on upload — the server issues a signed PUT URL and the browser uploads directly to R2. A download proxy route streams files back through the server to avoid browser CORS issues and enforce auth on downloads. File items are cleaned up from R2 when deleted from the DB.

## New Files

- **`src/lib/r2.ts`** — R2 client (lazy singleton, fail-loud env guards), `getPresignedUploadUrl` (issues a signed PUT URL with `signableHeaders: new Set(["content-type"])` so R2 enforces MIME type end-to-end), `deleteFromR2` (DeleteObjectCommand), `getR2Object` (GetObjectCommand for download proxy).
- **`src/lib/files.ts`** — Single source of truth for all file constraints: `IMAGE_MIME_TYPES` / `FILE_MIME_TYPES` Sets, `MAX_IMAGE_SIZE` (5 MB) / `MAX_FILE_SIZE` (10 MB), `IMAGE_ACCEPT` / `FILE_ACCEPT` strings for `<input accept>`, `IMAGE_EXTENSIONS` / `FILE_EXTENSIONS` for error messages, `IMAGE_HINT` / `FILE_HINT` for the drop zone, `validateFile` (client-side pre-check), `formatFileSize` (bytes → human-readable).
- **`src/components/ui/file-upload.tsx`** — Drag-and-drop upload widget. Two-step flow: `POST /api/upload` → get signed URL → XHR PUT to R2 (XHR used over fetch for `upload.onprogress`). States: idle (drop zone), uploading (progress bar), done (file info card + image preview), error (inline message). On completion fires `onUploadComplete({ key, fileName, fileSize })`.
- **`src/app/api/upload/route.ts`** — Issues presigned PUT URLs. Accepts JSON `{ typeSlug, fileName, contentType, fileSize }` (never file bytes). Validates auth, type slug, MIME type, and size server-side, then generates a scoped R2 key (`users/{userId}/{uuid}{ext}`) and returns `{ uploadUrl, key }`.
- **`src/app/api/download/[id]/route.ts`** — Download proxy. Auth + ownership check via DB lookup, then streams `GetObjectCommand` response to the browser with `Content-Disposition: attachment` and the original filename. Intentional exception to the "no proxying" rule — avoids CORS and enforces auth on downloads.
- **`src/lib/files.test.ts`** — 33 unit tests covering `validateFile` (all valid MIME types for images and files, invalid MIME rejection, exact boundary at max size passes, 1 byte over fails with correct error message) and `formatFileSize` (bytes, KB, MB, fractional, boundary between units).
- **`context/features/file-item-spec.md`** — Feature spec (reference doc, not runtime code).
- **`.env.example`** — Added R2 env var entries (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).

## Modified Files

- **`src/components/items/NewItemDialog.tsx`** — Added `FileUpload` for file/image types. Form state extended with `fileKey`, `fileName`, `fileSize`. Submit button disabled until upload completes (`form.fileKey` non-empty). `uploadKey` counter forces `FileUpload` remount on type change or dialog reopen. Passes `fileUrl: form.fileKey` to `createItem`.
- **`src/components/items/ItemDrawer.tsx`** — File/image items: Copy button replaced with Download button (`<a href="/api/download/{id}" download={fileName}>`). Body shows image preview (`<img src="/api/download/{id}">`) for images, and a file-info card (filename + `formatFileSize`) for both. Imports `formatFileSize` from `@/lib/files`.
- **`src/actions/items.ts`** — `deleteItem` now fetches `fileUrl` before DB delete (`getItemFileUrl`), deletes the DB row, then soft-deletes from R2 (`.catch()` logs failure without blocking — DB delete already committed at that point).
- **`src/lib/db/items.ts`** — `createItem` writes `fileUrl`, `fileName`, `fileSize` fields. Added `getItemFileUrl` (minimal ownership-scoped query returning only `fileUrl`).
- **`src/lib/validations/items.ts`** — `createItemSchema` extended with `fileUrl`, `fileName`, `fileSize` fields; `FILE_TYPE_SLUGS` exported for use in `NewItemDialog`.
- **`src/actions/items.test.ts`** — Added `vi.mock("@/lib/r2")` so R2 calls are stubbed in tests.
- **`.gitignore`** — Added `test-upload.md` (scratch file created during browser testing).

## Architecture Notes

- **Upload**: client POSTs metadata → server validates + generates R2 key → server calls `getPresignedUploadUrl` → returns signed URL to client → client XHR PUTs file directly to R2. Next.js never touches file bytes.
- **Key storage**: `Item.fileUrl` stores the R2 object key (e.g. `users/{userId}/{uuid}.pdf`), not a full URL. The name `fileUrl` is inherited from the schema; all code treats it consistently as a key.
- **Download**: client requests `/api/download/{itemId}` → server checks auth + ownership → `GetObjectCommand` → streams response. Uses item ID (not the key) so the client can never forge a path to another user's file.
- **`signableHeaders: new Set(["content-type"])`** on the presigned URL — required so R2 cryptographically enforces that the PUT's `Content-Type` matches what was validated server-side. Without it, a signed URL for `image/png` could accept any content type.

## Dependencies Added

- `@aws-sdk/client-s3` — S3-compatible SDK for R2 (`PutObjectCommand`, `DeleteObjectCommand`, `GetObjectCommand`)
- `@aws-sdk/s3-request-presigner` — `getSignedUrl` for generating presigned PUT URLs

## Deferred

- **R2 bucket CORS policy** — The browser XHR PUT to R2 is blocked by CORS until a CORS rule is added in the Cloudflare R2 dashboard for the `devmemory-files` bucket. Required rule: `AllowedOrigins: [app origin]`, `AllowedMethods: ["PUT"]`, `AllowedHeaders: ["Content-Type"]`. This is a bucket config step, not a code change.

## Verified

- Upload route issues valid presigned URLs (confirmed from browser network tab — correct AWS4 signature, scoped key).
- Download proxy: not testable until CORS is resolved (upload blocked before a file item can be created).
- Delete flow: browser-tested end-to-end — confirmation dialog, "Item deleted" toast, drawer closes, sidebar count and stats update immediately via `router.refresh()`.
- 90/90 tests passing (`npm test`); `npm run build` clean.
