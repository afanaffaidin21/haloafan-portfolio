# Design System

How the visual language of this site is built, and the rules for extending it.
Everything here is derived from the code in `src/`; when the two disagree, the
code wins and this document should be corrected.

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4 (CSS-first tokens),
Payload CMS for content. Fonts are self-hosted from `public/fonts`.

---

## 1. Principles

1. **Measured, not invented.** Layout, type, and spacing come from the original
   reference; deviations are recorded (see `docs/superpowers/specs/`).
2. **Two-tone ink.** Headings pair a muted line with a full-ink line. Muted is
   `ink-3`; full ink is `ink`.
3. **Contrast blocks invert.** Footer, primary CTAs, and dark chips use
   `invert` / `invert-ink`. In dark mode they flip to light; the relationship is
   the identity, not the hue.
4. **One accent.** `green` is reserved for the availability pulse on public
   surfaces. The Payload admin may use it for status (success) only; error and
   warning keep their functional ramps.
5. **Motion serves reading.** Reveals are short, blur-and-rise, once. Reduced
   motion removes movement entirely.

## 2. Token architecture

Two layers, both in `src/app/globals.css`:

```
@theme            primitive values + semantic roles (light)
.dark             unlayered overrides of the same variables (dark)
components        consume semantic Tailwind utilities only
```

There is **no separate component-token layer**. Do not add one: a component
that needs a variant composes semantic utilities instead of introducing
`--button-bg`-style variables.

Why the override works: Tailwind v4 emits theme variables into
`@layer theme` and compiles utilities to `var(--color-*)`. The `.dark` block is
unlayered, so it outranks the theme layer regardless of source order.

### Color tokens

| Token | Utility | Light | Dark | Use |
|---|---|---|---|---|
| `--color-page` | `bg-page` | `#fafafa` | `#0a0a0a` | body background |
| `--color-surface` | `bg-surface` | `#ffffff` | `#161616` | cards, nav, inputs |
| `--color-surface-muted` | `bg-surface-muted` | `#f0f0f0` | `#1e1e1e` | pricing box, media tile bg |
| `--color-line` | `border-line` | `#dedede` | `#2e2e2e` | hairlines, dividers |
| `--color-ink` | `text-ink` | `#000000` | `#fafafa` | primary text |
| `--color-ink-2` | `text-ink-2` | `#545454` | `#b8b8b8` | secondary text |
| `--color-ink-3` | `text-ink-3` | `#828282` | `#9c9c9c` | muted text |
| `--color-ink-4` | `text-ink-4` | `#b8b8b8` | `#6b6b6b` | faint marks |
| `--color-invert` | `bg-invert` | `#000000` | `#fafafa` | contrast blocks, CTAs |
| `--color-invert-ink` | `text-invert-ink` | `#ffffff` | `#0a0a0a` | text on invert |
| `--color-invert-ink-2` | `text-invert-ink-2` | `#828282` | `#545454` | muted text on invert |
| `--color-invert-ink-3` | `text-invert-ink-3` | `#b8b8b8` | `#6b6b6b` | faint text on invert |
| `--color-green` | `bg-green` | `#12b33f` | `#12b33f` | availability only |

`--color-white` and `--color-black` remain as literal values. They are only
valid for content that sits on a photo or video (see §4).

`ink-*` is absolute: it is tuned against the page. `invert-ink-*` is relative to
a surface that flips. **Never use `ink-*` inside `bg-invert`** — use
`invert-ink-*`.

### Radii

| Token | Value | Use |
|---|---|---|
| `--radius-pill` | `1000px` | avatars, count pills |
| `--radius-btn` | `24px` | buttons, tags, social chips |
| `--radius-card` | `16px` | cards, images, containers |
| `--radius-tool` | `12px` | tool logos |
| `--radius-nav` | `32px` | nav pill |

### Shadows

| Token | Light | Dark addition |
|---|---|---|
| `--shadow-card` | four black layers, 0.07→0.03 alpha | `0 0 0 1px rgba(255,255,255,.06)` ring |
| `--shadow-pill` | three black layers | same ring |
| `--shadow-btn` | inset white highlight + black depth + `rgb(84,84,84)` ring | `inset rgba(0,0,0,.06)` + `0 0 0 1px rgba(0,0,0,.18)` |

Shadows are theme variables; do not hardcode a shadow in a component.

### Breakpoints

| Token | Value | Effect |
|---|---|---|
| `sm` | `480px` | type step |
| `md` | `768px` | two-column layouts, nav toggle appears |
| `lg` | `992px` | desktop layout starts |
| `xl` | `1200px` | full type scale (h1 72) |

### Font families

| Token | Family | Use |
|---|---|---|
| `--font-sans` | Switzer | all UI text |
| `--font-price` | Inter Display 600 | pricing figures |
| `--font-polar` | Manrope 700 | Polar CTA |
| `--font-mono` | Fragment Mono | sparingly, metadata |

## 3. Typography

Use the `t-*` utilities; never set `font-size` ad hoc.

| Class | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| `t-h1` | 72 → 64 → 48 → 42 | 500 | 0.95 | −2.16 → −1.26 |
| `t-h2` | 64 → 54 → 46 → 36 | 500 | 1 | −1.92 → −1.08 |
| `t-h3` | 32 → 28 → 26 | 500 | 1.15 | −0.96 → −0.78 |
| `t-h4` | 24 → 20 | 500 | 1.3 | −0.72 → −0.6 |
| `t-lead` | 22 → 20 → 18 | 500 | 1.4 | −0.66 → −0.36 |
| `t-body-lg` | 18 | 500 | 1.4 | −0.36 |
| `t-body` | 16 | 500 | 1.5 | −0.32 |
| `t-body-sm` | 14 | 500 | 1.6 | −0.14 |
| `t-label` | 14 | 600 | 1.12 | −0.28 |
| `t-micro` | 12 | 600 | 1.12 | −0.24 |

Steps apply at `max-width: 1199.98`, `991.98`, and `767.98`.

Rules:

- Headings are `<h1>`/`<h2>` with `t-h1`/`t-h2`; never simulate with bold body.
- Two-tone headings: use `<RevealWords tone="muted">` for the muted line; it
  resolves to `var(--color-ink-3)`.
- Body copy is `t-body` on `text-ink-2` for secondary paragraphs, capped at
  `max-w-[580px]`.
- Line lengths stay under ~80 characters.

## 4. Color usage rules

| Situation | Classes |
|---|---|
| Page text | `text-ink`, `text-ink-2`, `text-ink-3` |
| Card / surface | `bg-surface`, optional `shadow-card` |
| Hairline | `border-line` |
| Primary CTA | `bg-invert text-invert-ink shadow-btn` |
| Outline CTA | `border border-line` |
| Footer / dark block | `bg-invert`, text `text-invert-ink`, muted `text-invert-ink-2`, faint `text-invert-ink-3` |
| Chip on a photo | `bg-black/50 text-white backdrop-blur-[10px]` — literal by design |
| Status dot | `bg-green` only, always next to a text label |

Never theme content that sits on an image. Those chips stay literal black/white
in both themes.

## 5. Layout and spacing

| Primitive | Value |
|---|---|
| Content column | `max-width: 1080px`, `padding-inline: 44px` → 992px content |
| Mobile gutter | `22px` at ≤767 |
| Section rhythm | `padding-block: 128px` → 96 → 72 |
| Page frame | absolute 1080px column with `border-x border-line` |

Standard grids: two-column `md:grid-cols-2`, three-column
`md:grid-cols-3`, and asymmetric `md:flex` with `lg:gap-16` (about, services).

## 6. Components

### Buttons

| Variant | Markup | Height | Radius |
|---|---|---|---|
| Primary | `bg-invert text-invert-ink shadow-btn` | `h-11` (44px) | `rounded-[24px]` |
| Outline | `border border-line` | `h-11` | `rounded-[24px]` |
| Nav CTA | `bg-invert text-invert-ink px-[18px] py-2` | auto | `rounded-[24px]` |

States: `hover:opacity-90` (primary), `hover:opacity-70` (outline), transition
300ms. Focus uses the browser outline; do not remove it.

### Nav pill

- Fixed top center; collapsed **233×56**, open **545×56**; radius 32.
- Surface: `border border-line/70 bg-surface/50 backdrop-blur-[5px]`, padding 12.
- Collapsed trigger: three 4px dots (`bg-invert`, `bg-ink-3`, `bg-ink-4`).
- Open: links fade in staggered 0.1s; Email CTA 0.4s; theme toggle 0.5s.
- Name → links gap stays 64px (32 flex gap + 32 cluster padding).
- Theme toggle sits at the same 13px optical inset as the avatar (24px hit box,
  16px glyph, `-mr-1`).
- Width transition 500ms `cubic-bezier(.4,0,.2,1)`, capped by
  `max-w-[calc(100vw-24px)]`.

### Theme toggle

- Button 24×24, sun/moon 16×16 `currentColor`; CSS shows one glyph per theme.
- `aria-label="Toggle dark mode"`, `aria-pressed` from a shared store.
- Two mounts: expanded nav (hidden below `md`) and footer.
- Click toggles `.dark` on `<html>`, writes `localStorage.theme`, dispatches
  `themechange`. Default is always light; `prefers-color-scheme` is not read.

### Cards

- `rounded-[16px] bg-surface shadow-card`; media cards rely on the shadow ring
  in dark mode for separation.
- Project thumbnails: `aspect-[484/363]`, image scales 1.04 over 700ms on hover.
- Blog cards: image half + `bg-surface` content half.

### Chips and tags

- Project type tags: `rounded-full bg-surface px-3 py-2 shadow-card t-micro`.
- Scope tags: same shape, on the project hero. Tech tags reuse them under a
  "Tech" label; either group disappears with its label when empty.
- Paired actions on one row sit `gap-[18px]` apart (Email me + Download CV,
  View Live Site + View Code).
- Photo overlays: `rounded-[24px] bg-black/50 px-2 text-white backdrop-blur-[10px]`.

### Form controls

- Filter/search labels: `h-11 rounded-[24px] bg-surface px-4 shadow-card`.
- Placeholder text uses `text-ink-2`; no custom border.

### Footer

- `bg-invert`, full-bleed; heading pairs `text-invert-ink` and
  `text-invert-ink-2`.
- Social chips: `bg-surface text-ink` — a surface inside an inverted block.
- Fit-text wordmark via `foreignObject`, 296px cap height. Text is Site
  Settings → `footerWordmark`, else the owner's first name in capitals.
- Theme toggle uses `invert-ink` strokes.

### Social chips

- One closed registry, `src/lib/social-icons.ts`: `x`, `github`, `linkedin`,
  `instagram`, `threads`, `dribbble`, `behance`. It backs the admin select and
  the renderer; an unknown key resolves to a neutral outbound icon.
- Chips render only for the platforms in Site Settings → Socials, in that
  order; no platform has a hardcoded fallback URL. An empty list renders no
  chips at all.
- External links open in a new tab with `rel="noopener noreferrer"`.
- Only the `x` chip carries `followerCount`. On the About photo it is the
  pill-shaped chip (`h-[30px] px-2`); the rest are 30px squares.
- New glyphs follow the stroke icons: 24px viewBox, `currentColor` stroke,
  round caps and joins, `strokeWidth` defaulting to 1.5.

### Section copy

- Headings and body copy live in `src/lib/copy-defaults.ts`. Site Settings →
  Sections → `copy` only overrides them: an empty field renders the repo text.
  Components render `settings.copy` and never hold the strings.
- Which line of a two-line heading is muted stays in the component.
- UI chrome labels ("Email me", "Download CV", "View All", "Show all") stay in
  code.

## 7. Media

- CMS images render through `MaybeImg` (`src/components/maybe-img.tsx`): no
  source, no `<img>`. The wrapper keeps its size, radius, and aspect ratio; a
  wrapper the image normally covers adds `emptyFrame(src)`, which is
  `bg-surface-muted` only while the image is missing.
- Empty CMS fields remove their element, never render it blank: no `href=""`,
  no label without a value, no section without content.

- `mediaUrl(ref, size)` resolves Payload uploads: prefers `sizes[size].url`, then
  the original, and strips the trailing slash Payload adds under
  `trailingSlash: true`.
- Sizes: `card` 400px, `hero` 1200px, `thumb` 1000px, `wide` 2200px. An upload
  narrower than a size has no file for it; the original is used.
- Which size renders where (`src/lib/content.ts`): project card thumbnails use
  `thumb` (cards are about 490px wide), full-width project tiles use `wide`
  (1080px container), two- and three-column tiles use `hero`. Each is about 2x
  the rendered width, because `images.unoptimized` means no srcset.

- The About portrait is driven by Site Settings → Avatar (`avatarHero`), so the
  nav avatar and About share one upload.
- Without an avatar the About frame stays an empty `bg-surface-muted` panel
  with no `<img>`; the template's stock portrait is gone.
- The About signature is an optional upload (Site Settings → About →
  Signature), shown at 97×97 `object-contain`, and hidden when empty. It is
  not recolored, so upload a version that reads in both themes.
- Photos are never filtered or recolored; only their container background
  (`bg-surface-muted`) follows the theme.

### Project images

Generated by `npm run thumbs` (`scripts/thumbnails/`). The desktop screenshots
are in `public/img` (the project pages show them); the phone screenshots are
generator-only sources in `scripts/thumbnails/sources/`, so they are neither
served nor seeded. The geometry is in `layout.ts` and covered by tests.

- Screenshots: desktop 1440x900 at 2x (2880x1800), mobile 390x844 at 2x
  (780x1688), scrollbars and floating widgets hidden, progressive JPG q82.
- Card thumbnail `<slug>-thumb.jpg`: 1600x1200 (the card's 484:363 ratio) on
  the project's flat accent colour (variant A, chosen by the owner). The
  desktop screenshot sits in a browser window 1280 wide (80%), centred, from
  y=168: radius 18, a 40px `#f4f4f4` top bar with three `#cfcfcf` dots, the
  screenshot scaled to the window width and cut from the top. The window ends
  inside the safe area and is never cut by the canvas edge.
- Phone pair `<slug>-mobile-pair.jpg`: 2400x1500 on the same accent, the two
  phone screenshots side by side, each 84% of the canvas height with radius
  44, 6% of the canvas width apart, centred. It replaces the old two-column
  block of phone screenshots with one full-width tile.
- Single phone `<slug>-mobile-single.jpg`: 1200x2160 on the same accent, the
  first phone screenshot alone at 88% of the canvas height, centred, radius
  44. The mobile-pair tile names it as its `mobileImage`, and below 768px a
  `<picture>` source swaps it in: in the 302px tile of a 390px viewport the
  pair's phones are ~75px wide, the single phone ~221px. The canvas is taller
  than the pair's so the phone fills ~73% of its width.
- Shadow under windows and phones: blur 40px, opacity 0.22, offset y 18px.
- Safe area: nothing important within 8% of any canvas edge. The single phone
  is the one exception: at the specified 88% of the height it sits 6% from the
  top and bottom.
- The accent is a per-project colour in `scripts/thumbnails/config.ts`; it is
  not a Payload field and does not theme the site. Keep it a muted brand
  colour of the project so the six cards read as one series.
- Output: progressive JPG q82, under 250 KB each.

## 8. Motion

| Effect | Spec |
|---|---|
| Reveal | opacity 0→1, `blur(6px)→0`, `translateY(20px)→0`, 500ms `cubic-bezier(.4,0,.2,1)` |
| Reveal stagger | 60ms per word, first at `delay` |
| Trigger | `useInView`, once, margin `-10% 0 -10%` |
| Nav width | 500ms `cubic-bezier(.4,0,.2,1)` |
| Hover fades | 300ms |
| Smooth scroll | Lenis, `lerp: 0.1` |

`prefers-reduced-motion` disables Lenis and resolves every reveal immediately.

## 9. Accessibility

- Contrast: body ink on page 18.97:1; secondary `ink-2` 9.98:1; muted `ink-3`
  7.21:1 in dark; footer muted 7.26:1 and faint 5.11:1 on the flipped surface.
- Hit targets: footer controls 30px, nav toggle 24px (WCAG 2.5.8 minimum).
- The sun/moon button has an accessible name and pressed state; glyph visibility
  is CSS-driven so hydration never mismatches.
- Decorative SVGs are `aria-hidden`; icon-only links always carry `aria-label`.
- Focus outlines are never removed.
- Status is not color-only: the green dot always accompanies text.

## 10. Do / Don't

| Do | Don't |
|---|---|
| `bg-surface`, `text-ink`, `border-line` | `bg-white`, `text-black`, `border-[#dedede]` |
| `invert-ink-2` inside a dark block | `ink-2` inside `bg-invert` |
| `t-h2` / `t-body` | arbitrary `text-[64px]` |
| `shadow-card` | inline box-shadow |
| `container-1080` / `section-pad` | raw `max-w` / fixed vertical padding |
| `mediaUrl(doc, "hero")` | hardcoded `/img/...` paths |
| Literal white on photos | Themed colors over imagery |

## 11. File map

| Path | Responsibility |
|---|---|
| `src/app/globals.css` | tokens, `.dark`, type scale, layout primitives, reveal, toggle glyphs |
| `src/lib/content.ts` | Payload → view mapping (`mediaUrl`, semantic fields, copy fallback) |
| `src/lib/copy-defaults.ts` | default section copy (CMS defaults + render fallback) |
| `src/lib/social-icons.ts` | closed social platform registry |
| `src/lib/media.ts` | upload URL resolution + trailing-slash normalization |
| `src/lib/theme.ts` | `theme` storage key, `themechange` event |
| `src/components/theme-toggle.tsx` | theme control |
| `src/components/motion-primitives.tsx` | `Reveal`, `RevealWords`, `Appear` |
| `src/components/nav.tsx` | nav pill geometry and stagger |
| `src/components/footer.tsx` | inverted footer |
| `src/components/icons.tsx` | reference SVG sprite (`currentColor`) |
| `src/components/maybe-img.tsx` | CMS image that skips an empty source |
| `src/components/project-detail.tsx` | project page hero, blocks, quote |

## 12. Changing the system

1. Add or change a token in `@theme` **and** its `.dark` counterpart.
2. Prefer a semantic role over a new literal; if a component needs a one-off,
   compose utilities rather than adding a token.
3. Verify both themes and mobile (375px) before committing.
4. Update this document with any changed value or rule.
