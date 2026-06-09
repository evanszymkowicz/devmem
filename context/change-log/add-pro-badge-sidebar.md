# Add Pro Badge to Sidebar

## What Changed

- Installed the ShadCN UI `Badge` component (`src/components/ui/badge.tsx`)
- Updated `src/components/dashboard/Sidebar.tsx` to render a `PRO` badge next to Files and Images in the Types list
- Badge uses `variant="outline"` with `h-4 px-1 text-[10px]` — small and subtle, does not disrupt the row layout
- Badge is conditionally rendered by checking `type.slug === "files" || type.slug === "images"`; all other types are unaffected
- `npm run build` passes clean; TypeScript no errors
