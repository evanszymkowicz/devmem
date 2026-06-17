# Item List Three-Column Layout

## What changed

`src/app/items/[type]/page.tsx` — grid class updated on line 70:

```
- grid grid-cols-1 gap-4 md:grid-cols-2
+ grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3
```

## Responsive breakpoints

| Breakpoint | Columns |
|---|---|
| mobile (default) | 1 |
| `md` (768px+) | 2 |
| `lg` (1024px+) | 3 |

## Notes

Single-line Tailwind change. No server actions, utilities, or components modified.
