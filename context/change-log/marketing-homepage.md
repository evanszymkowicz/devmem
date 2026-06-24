# Marketing Homepage Mockup

## What was done

Built a standalone static marketing homepage prototype in `prototypes/homepage/` — plain HTML/CSS/JS, fully self-contained, separate from the Next.js app (no React/Tailwind/Prisma). Centerpiece is a "chaos → order" hero: a left container of 8 animated icons (where developer knowledge scatters today), a pulsing center arrow, and a right dashboard preview.

## Files added

- `prototypes/homepage/index.html` — page structure: fixed nav, hero text + chaos/arrow/dashboard visual, 6-card features grid, AI/Pro section with code-editor mockup, pricing (Free vs Pro + billing toggle), bottom CTA, footer
- `prototypes/homepage/styles.css` — dark theme with the 7 item-type accent colors as CSS vars, CSS arrow pulse, scroll-reveal classes, responsive breakpoints, reduced-motion fallback
- `prototypes/homepage/script.js` — `requestAnimationFrame` chaos engine (drift, wall bounce, mouse repulsion, rotation + scale pulse), IntersectionObserver scroll reveals, navbar opacity on scroll, billing toggle, current-year injection

## Key decisions

**Standalone prototype** — lives in `prototypes/`, outside `src/`, so it has zero impact on the app build (`npm run build` confirmed passing). Served over local HTTP for testing (browsers block `file://`).

**Inline SVG icons** — all chaos and feature icons are inline SVG, so there's no icon library or build step; the prototype opens directly in a browser.

**DevMemory wordmark** — the source spec (`context/features/homepage-spec.md`) used the outdated "DevStash" name; replaced with DevMemory throughout.

**Annual pricing** — spec gave "$8/mo or $72/yr", so the annual toggle shows $6/mo ($72 billed annually) with a "Save 25%" badge ($72 vs $96 = 25%).

**Copy edits (post-build)** — headline → "Store your Developer Knowledge"; subhead → "…and links centralized…"; CTAs → "Get Started for Free"; section headings title-cased: "Everything in One Place", "Let AI Do the Busywork", "Simple Pricing", "Ready to Start?".

## Testing

Browser-verified (no server actions/utilities to unit-test): hero visual, all sections, billing toggle ($8→$6/$72), rAF chaos animation, scroll reveals, and mobile responsive (vertical stack, arrow rotates 90° to point down). Fixed a mobile nav issue where the "Get Started" button was clipped at 390px (added a `<560px` rule shrinking nav padding/gap and button size). Screenshots/notes in `.playwright-mcp/Marketing Homepage/`.
