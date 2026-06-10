# CSS Variables Spec

## Overview

Replace static hardcoded hex/color values in component files with Tailwind
utility classes or `@theme` CSS variables, so colors are consistent and
themeable.

## Problem

Several components use hardcoded hex strings in `style={}` props or
className strings (e.g. `#6b7280` as a fallback color). These bypass the
design token system and make light-mode theming and future rebranding harder.

## Out of scope

Item type colors (`type.color`, `item.itemType.color`) come from the
database and must remain as dynamic inline styles — they are intentional and
not targets for this work.

## Requirements

### Audit
- Grep for hardcoded hex values in `src/components/` and `src/lib/`
- Identify which are static fallbacks vs. dynamic DB-driven values

### Fixes
- Replace static hex fallbacks (e.g. `?? "#6b7280"` in
  `getSidebarCollections` and `CollectionCard`) with a CSS variable defined
  in `src/app/globals.css` under `@theme`, e.g.
  `--color-type-default: #6b7280`
- Replace any hardcoded Tailwind color strings that have a semantic
  equivalent (e.g. amber-400 references for favorites) with a named token

### globals.css
- Add a `/* Item type defaults */` section to the `@theme` block for any
  new tokens

## References

- `src/app/globals.css`
- `src/components/dashboard/CollectionCard.tsx`
- `src/lib/db/collections.ts`
- Tailwind CSS v4 `@theme` docs
