# Payload Admin — Design System Appearance

## Intent

Make the Payload admin (`/admin`) look like the public site while keeping every
Payload surface and behavior intact. The owner uses this panel daily; the goal is
recognition and comfort, not a new admin product. Only appearance changes:
palette, typography, radii, buttons, inputs, and the dashboard's opening block.

## Goals

- The admin's chrome uses the site's palette, Switzer, and radius language in
  both admin themes (light and dark).
- The dashboard opens with a branded header and quick links to the content the
  owner actually manages.
- Payload's own components, navigation, tables, forms, and flows are reused
  unchanged.
- The admin keeps its own light/dark/auto selector; both palettes are mapped.
- No Tailwind or site preflight is loaded into the admin.

## Non-goals

- Replacing `components.Nav`, `views.dashboard`, or any structural layout.
- `admin.dashboard.widgets` (experimental API).
- Changing collection lists, edit views, or field layout.
- Coupling the admin theme to the site's `.dark` class and `localStorage.theme`.
- Touching the public site.

## Anti-goals

- Deep CSS selectors that break on a Payload patch when a variable exists.
- Importing `globals.css` into the admin (Tailwind preflight would fight
  Payload's reset).
- Applying the site's 24px pill radius to dense admin controls.
- Removing or hiding admin functionality in the name of styling.

## Constraints

- Payload 3.93.0, `@payloadcms/ui`, admin mounted at `src/app/(payload)`.
- `src/app/(payload)/custom.scss` already exists, is imported after
  `@payloadcms/next/css`, and is empty — the intended override point.
- Payload styles live in `@layer payload-default`; an unlayered rule in
  `custom.scss` wins, so plain CSS overrides are reliable.
- Admin exposes `--color-base-*`, `--theme-elevation-*`, `--theme-bg`,
  `--theme-text`, `--theme-input-bg`, `--theme-border-color`, `--font-body`,
  `--style-radius-s/m/l`, `--base-body-size`, `--nav-width`, `--gutter-h`.
- Admin theme is `html[data-theme='light' | 'dark']`, chosen by the user;
  `admin.theme` stays `all`.
- Site fonts are hashed files under `public/fonts`; Switzer weights 500, 600, and 700
  are the ones the admin uses.
- Components added to `admin.components` must be registered in the generated
  import map (`npx payload generate:importmap`).
- The admin cannot use the site's Tailwind utilities; it needs its own small
  class set in the same stylesheet.

## Approaches

**A. Token bridge only.** Map Payload's variables to the site palette, load
Switzer, set radii. Lowest risk, one file, whole panel gets the look; dashboard
stays Payload's default. Rejected alone: the landing page is the first thing
seen and would still read as stock Payload.

**B. Token bridge + branded dashboard header (chosen).** A, plus a
`beforeDashboard` server component with the owner's wordmark, a short greeting,
and quick links to Projects, Posts, Media, and Site Settings. Uses a stable
Payload slot, keeps the default collection cards below it, and adds no
experimental API.

**C. A + B + custom Nav and dashboard view.** Full structural control, but the
owner would inherit maintenance of nav links, account menu, logout, mobile
behavior, and access checks. Rejected: the request is appearance only, and this
costs far more per upgrade than it returns.

## 1. Stylesheet (`src/app/(payload)/custom.scss`)

Loaded by the admin layout. Plain CSS inside the existing SCSS file.

### Palette mapping

Override Payload's base ladder with the site's grays, then set the semantic
theme variables that need to differ from the derived values.

| Role | Light | Dark |
|---|---|---|
| page / `--theme-bg` | `#fafafa` | `#0a0a0a` |
| surface (cards, inputs) | `#ffffff` | `#161616` |
| muted surface | `#f0f0f0` | `#1e1e1e` |
| line / `--theme-border-color` | `#dedede` | `#2e2e2e` |
| text | `#000000` | `#fafafa` |
| secondary text | `#545454` | `#b8b8b8` |
| muted text | `#828282` | `#9c9c9c` |
| primary button | `#000000` bg / `#ffffff` text | `#fafafa` bg / `#0a0a0a` text |

Mapping rule: prefer the semantic variables (`--theme-bg`, `--theme-text`,
`--theme-input-bg`, `--theme-border-color`) and the `--theme-elevation-*` steps
that the rendered admin actually uses. Do not override selector colors one by
one until the variable path is proven insufficient. Record every selector
override with a comment naming the surface it fixes.

Payload reverses elevations in dark mode (`elevation-0` = base-900). Verify the
ladder under both themes on: dashboard, collection list, edit form, media
library, account, and login.

### Typography

- `@font-face` for Switzer 500, 600, and 700, pointing at the hashed files already in
  `public/fonts` (same URLs as `globals.css`).
- `--font-body: "Switzer", Arial, sans-serif`.
- Keep Payload's 13px base body size; the admin is denser than the site.
- Admin-specific classes for the dashboard block: `.padmin-eyebrow` (12/600,
  `-0.24px`), `.padmin-title` (24/500, `-0.72px`), `.padmin-body` (14/500,
  `1.6`), `.padmin-link` (14/600). No Tailwind in the admin.

### Radii

Adapted for dense controls, not copied:

| Variable | Value |
|---|---|
| `--style-radius-s` | `6px` |
| `--style-radius-m` | `10px` |
| `--style-radius-l` | `16px` |

Buttons and inputs use the Payload radius variables; only the primary button's
color is restyled if the theme ladder leaves it off-palette.

### Status colors

Payload's success ramp is blue and its error ramp is red. Keep error and
warning stock (they are functional), but map `--color-success-*` to a green ramp
derived from the brand green `#12b33f` (500 = the brand value), so a save toast
does not introduce a second accent. This is a deliberate functional exception
to the "green is only for availability" rule in `design.md`; amend that line to
scope the reservation to brand surfaces, not status UI.

### Admin metadata

- `admin.meta.titleSuffix: ""` so tabs stop reading "— Payload".
- `admin.meta.icons` points at `/admin-icon.svg`, a monogram favicon committed
  under `public/` (same shape as `AdminIcon`).

## 2. Dashboard header

New server components under `src/app/(payload)/components/`:

- `AdminLogo.tsx` exports two components:
  - `AdminLogo` — the login wordmark, Switzer, reading `site-settings.name`
    through `serverProps.payload` (`depth: 0`, `overrideAccess: true`) with a
    `"Afan Affaidin"` fallback. Async server component.
  - `AdminIcon({ fill = "currentColor" })` — inline SVG monogram, no stylesheet
    dependency. It renders in StepNav's 18×18 home slot and in the admin OG image
    at 38px on black (`clientProps={{ fill: "white" }}`), so the mark must read
    at both sizes and take its color from the `fill` prop.
- `DashboardHeader.tsx` — rendered via `admin.components.beforeDashboard`.
  Async server component; reads the site name like `AdminLogo`.
  Content:
  - eyebrow "Portfolio CMS"
  - title "Welcome back"
  - one line of body copy: "Manage projects, writing, media, skills, and the FAQ."
  - quick links: Projects, Posts, Media, Skills, FAQs, Site Settings

The name query is one `depth: 0` read with a static fallback, so a CMS rename
does not leave the admin showing an old name and a failed read never blocks the
login page.

Registration in `src/payload.config.ts`. Component paths resolve against
`admin.importMap.baseDir`, which defaults to `process.cwd()` (the repo root), so
the admin points it at the Payload app directory first:

```ts
admin: {
  user: "users",
  importMap: { baseDir: path.resolve(dirname, "app/(payload)") },
  meta: {
    titleSuffix: "",
    icons: [{ rel: "icon", type: "image/svg+xml", url: "/admin-icon.svg" }],
  },
  components: {
    beforeDashboard: ["/components/DashboardHeader#DashboardHeader"],
    graphics: {
      Logo: "/components/AdminLogo#AdminLogo",
      Icon: "/components/AdminLogo#AdminIcon",
    },
  },
},
```

Regenerate the import map after the change.

## 3. Behavior preserved

- Nav structure, collection cards, tables, filters, forms, drawers, modals,
  toasts, and rich-text editing are untouched.
- Admin's theme selector (light/dark/auto) keeps working; the stylesheet maps
  both themes.
- No changes to access control, routes, or `admin.user`.

## Verification

- `npx payload generate:importmap` updates the map, `npx next build` passes,
  `npx vitest run` passes.
- Screenshots at 1440 and 1024 of: login, dashboard, Projects list, project edit,
  Media library, Site Settings, account screen — light and dark.
- Contrast on each surface: body text ≥ 4.5:1, secondary ≥ 4.5:1, borders
  visible but not competing with text.
- `AdminIcon` is legible in StepNav's 18px slot and in the admin OG image at
  38px on black; neither path depends on `custom.scss`.
- Save a document (success toast) and submit an invalid required field (error):
  status colors are green/red, not Payload blue.
- The browser tab has no `Payload` suffix and shows the monogram favicon.
- The public site is unchanged (build diff and one page screenshot).
- No console errors from missing components or font 404s.

## Left to the builder

- Exact elevation-step mapping after inspecting computed styles in the live
  admin; the role table above is the contract, the step numbers are derived.
- Whether the primary button needs a selector override or the ladder already
  paints it correctly.
- Final tuning of the gray ladder between `#2e2e2e` and `#545454` for hover and
  active states in dark mode.
- Whether the login page needs any extra treatment beyond Logo and palette.
- The exact monogram geometry: one path/shape that survives 18px without
  anti-aliasing mush and 38px without looking sparse.
