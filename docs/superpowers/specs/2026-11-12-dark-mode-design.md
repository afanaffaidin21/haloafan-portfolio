# Dark Mode — Design

## Intent

Add a first-class dark theme to the public site. It is a designed alternate
palette, not an auto-invert: the site's identity is black ink on a near-white
page with black "contrast blocks" (footer, primary CTAs, dark cards). In dark
mode the page goes near-black, ink goes near-white, and the contrast blocks
flip to near-white with dark ink. The relationship between the two layers is
what carries over; the hues do not.

Dark mode is opt-in. **The default is always light, even when the OS reports
dark.** A manual toggle in the UI is the only way to enter dark mode, and the
choice persists across visits.

## Goals

- One semantic token layer; components stop naming literal colors.
- Theme switch is a class on `<html>`, persisted in `localStorage`.
- No flash of the wrong theme on load.
- Contrast blocks (footer, black CTAs, black cards) flip to light in dark mode.
- Light theme remains pixel-identical to the current build.
- No geometry, typography, motion, or content changes.

## Non-goals

- Theming the Payload admin (`/admin`).
- Following `prefers-color-scheme` automatically.
- Per-section or per-page themes.
- Image/photo processing; media renders as stored in both themes.
- New settings fields in the CMS.

## Anti-goals

- Utility names that lie about what they paint (e.g. `bg-black` rendering white).
- A theme toggle that widens or repositions the collapsed 233px nav pill.
- A visible flash of light on a dark-mode reload.
- Text that falls below ~4.5:1 against its surface in either theme.

## Constraints

- Tailwind v4 CSS-first: palette lives in `@theme` in `src/app/globals.css`.
- 146 color-class sites across 17 components; the four biggest groups are
  `text-white` 32, `bg-black` 29, `text-54` 28, `bg-white` 21.
- Nav pill geometry is measured from the reference: 233px collapsed, 550px open.
  Dark mode keeps the collapsed width exact and sizes the open pill to its
  content (545px), so the toggle glyph keeps the logo's 13px optical inset.
- Site-wide `trailingSlash: true` is intentional; do not touch it.
- `icons.tsx` is generated from the reference and mostly uses `currentColor`;
  all six partner-logo SVGs (`Logo1`–`Logo6`) hardcode `#0A0D12` and must
  inherit instead.

## Approaches

**A. Scale inversion.** Keep utility names, override `--color-*` in `.dark`.
Cheapest edit, but names invert their meaning, shadows and hardcoded logo fills
break, and there is no way to keep any element literal. Rejected.

**B. Semantic token layer.** Add role tokens (`page`, `surface`, `line`, `ink`,
`ink-2`, `ink-3`, `invert`, `invert-ink`), migrate the 146 sites mechanically,
and remap only those variables per theme. Bigger diff, honest names, and every
role can diverge (e.g. `ink-3` gets slightly lighter in dark for contrast).
**Chosen.**

**C. OS-only.** `@media (prefers-color-scheme: dark)`, no toggle, no JS. Cheapest
runtime, but the user cannot force light and cannot choose dark while the OS is
light. Rejected: explicit product decision is default-light plus a manual toggle.

User modifications applied to B: default is light regardless of OS; invert
blocks flip in dark rather than staying black.

## Token contract

Tailwind color tokens, light value → dark value.

| Token | Utility | Light | Dark | Role |
|---|---|---|---|---|
| `--color-page` | `bg-page` | `#fafafa` | `#0a0a0a` | body background |
| `--color-surface` | `bg-surface` | `#ffffff` | `#161616` | cards, nav, panels |
| `--color-surface-muted` | `bg-surface-muted` | `#f0f0f0` | `#1e1e1e` | pricing container, media tile bg |
| `--color-line` | `border-line` | `#dedede` | `#2e2e2e` | hairlines, dividers |
| `--color-ink` | `text-ink` | `#000000` | `#fafafa` | primary text |
| `--color-ink-2` | `text-ink-2` | `#545454` | `#b8b8b8` | secondary text |
| `--color-ink-3` | `text-ink-3` | `#828282` | `#9c9c9c` | muted text |
| `--color-ink-4` | `text-ink-4` | `#b8b8b8` | `#6b6b6b` | faintest marks/dots |
| `--color-invert` | `bg-invert` | `#000000` | `#fafafa` | contrast blocks, buttons |
| `--color-invert-ink` | `text-invert-ink` | `#ffffff` | `#0a0a0a` | text on contrast blocks |
| `--color-invert-ink-2` | `text-invert-ink-2` | `#828282` | `#545454` | muted text on contrast blocks |
| `--color-green` | `bg-green` | `#12b33f` | `#12b33f` | availability pulse |

`ink-*` is absolute (tuned to the page); `invert-ink-*` is relative to the
surface that flips. Muted text inside the footer, black CTAs, and black cards
must use `invert-ink-2`, never `ink-2`/`ink-3` — `#9c9c9c` on `#fafafa` is 2.6:1.

Shadows are theme variables too and must be overridden in `.dark` so they read
on a dark page:

- `--shadow-card`: add a `0 0 0 1px rgba(255,255,255,.06)` hairline ring; the
  black depth layers stay.
- `--shadow-pill`: same faint ring treatment.
- `--shadow-btn`: replace the white inset highlight and `rgb(84,84,84)` ring
  with `inset rgba(0,0,0,.06) 0 2px 4px` plus `0 0 0 1px rgba(0,0,0,.18)`.
  The dark button is light, so its ring must be dark.

## Wiring

1. In `globals.css`, keep `@theme` as the light source of truth; add
   `.dark { … }` after it overriding the same `--color-*` and `--shadow-*`
   names. Tailwind emits theme vars as custom properties, so the utilities
   resolve per theme without changing any component for the switch itself.
2. `@layer base` body becomes `background: var(--color-page)`;
   `::selection` uses `invert` / `invert-ink`.
3. `.dark { color-scheme: dark; }` so native scrollbars and form controls follow.
4. `<html>` gains `suppressHydrationWarning` because an inline script may add
   the `dark` class before React hydrates.

## Toggle

- New client component `src/components/theme-toggle.tsx`.
- Markup: button containing both a sun and a moon glyph (inline SVG, not the
  generated reference sprite). CSS shows one per theme
  (`.dark .tt-sun { display: none }`), so the visual never mismatches during
  hydration.
- State: `useSyncExternalStore` — `getSnapshot` reads
  `document.documentElement.classList.contains("dark")`, `getServerSnapshot`
  returns `false`, and the store is a `themechange` window event dispatched by
  the click handler. Both instances stay in sync; `aria-pressed` on either
  control is always truthful.
- Click handler: toggle the `dark` class, write `localStorage.theme`, dispatch
  `themechange`. No OS listener.
- `aria-label="Toggle dark mode"`.
- Placement:
  - Nav: inside the expanded pill control cluster, after the "Email me" CTA,
    participating in the existing staggered fade. The collapsed 233px pill is
    untouched. The open pill is sized to its content (**545px**): at 590 the
    fixed width left ~54px of slack on the right. A 4px negative margin from
    the 24px hit box keeps the 16px glyph at the same 13px inset as the logo;
    `max-w-[calc(100vw-24px)]` still prevents overflow on narrow viewports.
  - Footer: one instance next to the social links, using `invert-ink` for its
    strokes. This is also the mobile path: the nav pill only expands on
    hover/focus, which touch devices do not produce.

## No-flash script

In `src/app/(site)/layout.tsx`, inside `<head>`:

```html
<script>
  try { if (localStorage.theme === "dark") document.documentElement.classList.add("dark") } catch (e) {}
</script>
```

Default remains light when the key is absent or storage throws. No
`matchMedia` is consulted anywhere.

## Migration map

Mechanical replacements; every site must be read before editing, because a few
`text-white` usages sit on photos rather than on `bg-black`.

| Current | New |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-black` (block/CTA/footer) | `bg-invert` |
| `text-white` paired with `bg-black` | `text-invert-ink` |
| `text-white` over media | stays `text-white` |
| `text-black` | `text-ink` |
| `text-54` | `text-ink-2` |
| `text-82` | `text-ink-3` |
| `text-b8` | `text-ink-4` |
| `border-de` (incl. `/70`) | `border-line` |
| `bg-f0` | `bg-surface-muted` |
| `bg-b8` | `bg-ink-4` |
| `bg-82` | `bg-ink-3` |
| `border-black` | `border-ink` |

Inside an `invert` surface (footer, black cards, black CTAs), muted text uses
`text-invert-ink-2`, not `ink-2`/`ink-3`. The footer's `text-82` labels are the
first case: `#9c9c9c` on the flipped `#fafafa` block is 2.6:1.

The migration is not class-only: `motion-primitives.tsx` sets a heading tone
with inline `var(--color-82)`, which becomes `var(--color-ink-3)`. Grep for
`var(--color-` before declaring the pass complete.

Keep literal `text-white` where the element sits on an image or a permanently
colored surface (e.g. video overlays). `#0A0D12` fills in the six partner-logo
SVGs become `fill="currentColor"` so they follow their container's ink.

## Files expected to change

- `src/app/globals.css` — tokens, dark overrides, body, selection, shadows.
- `src/app/(site)/layout.tsx` — no-flash script, `<html>` attributes.
- `src/components/theme-toggle.tsx` — new.
- `src/components/nav.tsx`, `footer.tsx`, and the remaining components with
  color utilities (about, articles, big-quote, blog-list, chrome, faq,
  faq-accordion, markdown, motion-primitives, project-card, project-showcase,
  skills, text-cycle, tool-logos).
- `src/components/icons.tsx` — six logo fills only.

## Verification

- `npx next build` passes; existing `vitest` suite passes.
- Browser at the production build: `/`, `/projects/`, `/projects/mango/`,
  `/blog/`, `/blog/[slug]/`, in both themes.
- Light theme: screenshot diff against the current build shows no change.
- Dark theme: no element keeps a light literal that should have flipped; no
  text below ~4.5:1 on its surface; footer/CTA/cards render light.
- Toggle: enters dark, survives reload, survives navigation; second click
  returns to light and clears to light default for a new visitor.
- No flash: hard reload while in dark shows the dark canvas immediately.
- Collapsed nav pill is still 233px; expanded is 545px and never exceeds the viewport.

## Left to the builder

- Exact sun/moon glyph artwork (simple, 16–20px, stroke `currentColor`).
- Spacing of the toggle inside the nav cluster, as long as the 545px width and
  the stagger timing hold.
- Whether `text-ink-3` dark needs a final nudge for contrast once rendered.
- Judgment on any color site the migration table does not obviously cover;
  decide and note it in the implementation summary.
