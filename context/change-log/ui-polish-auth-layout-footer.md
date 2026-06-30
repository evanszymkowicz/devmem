# UI Polish — Auth Layout & Footer Cleanup

## What was done

### Auth pages two-column layout
- Refactored `src/app/(auth)/layout.tsx` to be a neutral container (removed the `max-w-sm` card wrapper)
- Added the `max-w-sm` card wrapper directly to `forgot-password`, `verify-email`, and `reset-password` pages so they're unchanged visually
- Rewrote `sign-in/page.tsx` and `register/page.tsx` with a `md:grid-cols-2` split layout:
  - Left column: the form inside a card
  - Right column: value proposition panel with 4 feature bullets (hidden on mobile)

### Marketing footer cleanup
- Removed the **Company** (About, Blog, Contact) and **Legal** (Privacy, Terms) footer columns — all were `href="#"` dead links with no real pages behind them
- Removed **Changelog** from the Product column for the same reason
- Footer now only shows the Product column (Features, Pricing) which link to real on-page anchors

### Neon DB cleanup
- Deleted the `title = 'test'` item (`id: cmr062qjl0000y7popxy4mri0`) from the dev branch that was showing up in the dashboard Recent section
