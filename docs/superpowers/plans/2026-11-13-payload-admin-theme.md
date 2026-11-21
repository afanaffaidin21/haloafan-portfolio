# Payload Admin Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Payload admin look like the public site — palette, Switzer, radii, status colors — and open the dashboard with a branded header, without changing its structure.

**Architecture:** `src/app/(payload)/custom.scss` (unlayered, so it outranks Payload's `@layer payload-default`) remaps Payload's base gray ladder, semantic theme variables, fonts, radii, and success ramp. Two async server components read the site name from Payload and render the login/nav mark and a `beforeDashboard` header through stable admin slots.

**Tech Stack:** Payload 3.93.0, `@payloadcms/ui`, Next.js 16, React 19. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-13-payload-admin-theme-design.md`

## Global Constraints

- Only appearance: no `components.Nav`, no `views.dashboard`, no widget API, no layout changes.
- Do not import `globals.css` or Tailwind into the admin.
- Overrides live in `custom.scss` as plain CSS; it loads after `@payloadcms/next/css`.
- Component paths resolve from `admin.importMap.baseDir`, set to `app/(payload)` relative to `src`.
- Admin theme stays `all`; both `html[data-theme='light']` and `dark` must be mapped.
- Brand green `#12b33f` is a status color in the admin only; error/warning stay Payload's.
- Brand name reads `site-settings.name` (`depth: 0`, `overrideAccess: true`) with a static fallback.
- Verification may create a temporary local user in the dev database; it must be deleted before the task commit.
- No public-site changes.

## Review Focus

1. Dark-mode surfaces must use the dark role values, not the light ladder reversed by accident.
2. The login page is unauthenticated: a failed site-settings read must never block or crash it.
3. `AdminIcon` must read at StepNav's 18px and at 38px in the admin OG image, and must take color from its `fill` prop.
4. Status colors: success must be green, error red; neither may become invisible on its theme.
5. A wrong component path or stale import map leaves a blank admin; build success alone does not prove the slot renders.

## File Structure

- `src/app/(payload)/custom.scss` — all admin styling.
- `src/app/(payload)/components/AdminLogo.tsx` — `AdminLogo` (login) and `AdminIcon` (StepNav/OG).
- `src/app/(payload)/components/DashboardHeader.tsx` — `beforeDashboard` block.
- `public/admin-icon.svg` — favicon monogram.
- `src/payload.config.ts` — `importMap.baseDir`, `meta`, `components`.
- `src/app/(payload)/admin/importMap.js` — regenerated, committed.

---

### Task 1: Admin stylesheet

**Files:**
- Modify: `src/app/(payload)/custom.scss`
- Test: browser computed styles on `/admin/login`

**Interfaces:**
- Produces: `--font-body`, admin radii, gray ladder, success ramp, and classes `.padmin-eyebrow`, `.padmin-title`, `.padmin-body`, `.padmin-link`.
- Produces: `--theme-bg`, `--theme-input-bg`, `--theme-text`, `--theme-border-color` per theme.

- [ ] **Step 1: Add fonts and the gray ladder**

In `custom.scss`, add `@font-face` for Switzer 500/600/700 using the same hashed files as `globals.css` (`6XPIMU…`, `YS3VPN…`, `Y7SCNZ…`) and `font-display: swap`. Then override `--color-base-0` … `--color-base-1000` with a monotonic ramp:

```
0 #ffffff   50 #fafafa  100 #f0f0f0  150 #dedede  200 #d6d6d6
250 #cccccc 300 #b8b8b8 350 #adadad 400 #9c9c9c 450 #949494
500 #828282 550 #747474 600 #6b6b6b 650 #5f5f5f 700 #545454
750 #3f3f3f 800 #2e2e2e 850 #1e1e1e 900 #161616 950 #0a0a0a
1000 #000000
```

- [ ] **Step 2: Map the semantic theme variables**

Unlayered rules:

```css
:root {
  --theme-bg: #fafafa;
  --theme-input-bg: #ffffff;
  --theme-border-color: #dedede;
  --theme-text: #000000;
}
html[data-theme='dark'] {
  --theme-bg: #0a0a0a;
  --theme-input-bg: #161616;
  --theme-border-color: #2e2e2e;
  --theme-text: #fafafa;
}
```

Then set `--font-body: "Switzer", Arial, sans-serif`, `--style-radius-s: 6px`, `--style-radius-m: 10px`, `--style-radius-l: 16px`.

- [ ] **Step 3: Replace the success ramp**

Override `--color-success-50/100/200/300/400/500/600/700/800/900/950` with a green ramp anchored at `#12b33f` (500). Example anchors: 50 `#eefbf2`, 100 `#d7f5e0`, 200 `#aeeac0`, 300 `#7fdc9c`, 400 `#45c96f`, 500 `#12b33f`, 600 `#0d8c30`, 700 `#0b7529`, 800 `#095c22`, 900 `#07441a`, 950 `#052f12`. Leave error and warning untouched.

- [ ] **Step 4: Add admin type classes**

```css
.padmin-header  { display: flex; flex-direction: column; gap: 8px; padding: 24px 0 32px; }
.padmin-wordmark { font-size: 16px; font-weight: 600; letter-spacing: -0.32px; }
.padmin-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: -0.24px; text-transform: none; }
.padmin-title   { font-size: 24px; font-weight: 500; line-height: 1.3; letter-spacing: -0.72px; }
.padmin-body    { font-size: 14px; font-weight: 500; line-height: 1.6; letter-spacing: -0.14px; }
.padmin-links   { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
.padmin-link    { font-size: 14px; font-weight: 600; text-decoration: none; }
```

- [ ] **Step 5: Build and verify light**

Run `npx next build` — expected: success. Open `/admin/login` in the browser and evaluate:

```js
getComputedStyle(document.body).backgroundColor      // rgb(250, 250, 250)
getComputedStyle(document.body).fontFamily           // Switzer...
getComputedStyle(document.querySelector('input')).backgroundColor // rgb(255, 255, 255)
```

Expected: `#fafafa` page, Switzer, white inputs.

- [ ] **Step 6: Verify dark without the selector**

Still on `/admin/login`, run `document.documentElement.dataset.theme = 'dark'`, then:

```js
getComputedStyle(document.body).backgroundColor                 // rgb(10, 10, 10)
getComputedStyle(document.querySelector('input')).backgroundColor // rgb(22, 22, 22)
getComputedStyle(document.documentElement).getPropertyValue('--theme-success-500') // #12b33f or rgb(18,179,63)
```

Revert to `light`, screenshot login in both themes.

- [ ] **Step 7: Confirm the public site is untouched**

`curl -s http://localhost:3400/ | grep -o 'localStorage.getItem("theme")'` — expected: one match; the site still renders its own theme.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(payload)/custom.scss"
git commit -m "feat: theme the Payload admin with the site tokens"
```

---

### Task 2: Brand mark and dashboard header

**Files:**
- Create: `src/app/(payload)/components/AdminLogo.tsx`
- Create: `src/app/(payload)/components/DashboardHeader.tsx`
- Create: `public/admin-icon.svg`
- Modify: `src/payload.config.ts`
- Modify: `src/app/(payload)/admin/importMap.js` (generated)

**Interfaces:**
- Consumes: `.padmin-*` classes and theme variables from Task 1.
- Produces: `AdminLogo` (default async component), `AdminIcon({ fill?: string })`, `DashboardHeader` (async), all registered in the import map.

- [ ] **Step 1: Add the monogram asset**

`public/admin-icon.svg`: 32×32 viewBox, rounded square with an "A" cutout, `fill="#0a0a0a"` background and `#fafafa` letter. Used only as the favicon.

- [ ] **Step 2: Write `AdminLogo.tsx`**

Two exports:

- `AdminLogo({ payload }: { payload: Payload })`: async server component. Payload
  passes `serverProps` to graphics components; destructure `payload` and `try`
  `payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true })`.
  Use `doc.name`, fall back to `"Afan Affaidin"`. Render
  `<span className="padmin-wordmark">{name}</span>`.
- `AdminIcon({ fill = "currentColor" }: { fill?: string })`: inline
  `<svg width="18" height="18" viewBox="0 0 18 18">` monogram; all shapes use
  `fill={fill}`, no CSS dependency, no hooks. It must remain legible when scaled
  to 38px. The OG route passes `clientProps={{ fill: 'white' }}`; the admin
  StepNav passes none, so the default `currentColor` applies.

- [ ] **Step 3: Write `DashboardHeader.tsx`**

`DashboardHeader({ payload }: { payload: Payload })`: async server component.
Import `readAdminName` from `./AdminLogo` (export it there) and read the name
once. Render:

```tsx
<section className="padmin-header">
  <p className="padmin-eyebrow">Portfolio CMS</p>
  <h1 className="padmin-title">Welcome back</h1>
  <p className="padmin-body">Manage projects, writing, media, skills, and the FAQ.</p>
  <nav className="padmin-links">
    {/* Projects, Posts, Media, Skills, FAQs, Site Settings */}
  </nav>
</section>
```

Links use `/admin/collections/<slug>` and `/admin/globals/site-settings`, each `className="padmin-link"`.

- [ ] **Step 4: Register components and metadata**

In `src/payload.config.ts`:

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

- [ ] **Step 5: Regenerate the import map**

Run `npx payload generate:importmap`. Expected: `importMap.js` contains the three component paths and still contains the existing `CollectionCards` entry.

- [ ] **Step 6: Create a temporary verification user**

Run a throwaway script: `payload.create({ collection: "users", data: { email: "verify@local.test", password: "verify-local-123" } })`. Keep the id for cleanup.

- [ ] **Step 7: Verify login, dashboard, and nav in both themes**

Log in at `/admin/login` as the temporary user. Expected:

- login shows the wordmark and no "Payload" branding in the tab;
- dashboard shows the header above the collection cards, all six links resolve;
- StepNav icon is 18×18 and visible in light and dark;
- `document.documentElement.dataset.theme = 'dark'` repaints the dashboard without layout shifts.

Screenshot login, dashboard, Projects list, project edit, Media, Site Settings in both themes at 1440.

- [ ] **Step 8: Verify status colors and cleanup**

Evaluate `getComputedStyle(document.documentElement).getPropertyValue('--theme-success-500')` — expected green. Delete the temporary user with `payload.delete`. Expected: `users` count returns to its previous value.

- [ ] **Step 9: Build and test**

Run `npx next build` and `npx vitest run`. Expected: build success, all tests pass.

- [ ] **Step 10: Commit**

```bash
git add "src/app/(payload)/components" public/admin-icon.svg "src/app/(payload)/admin/importMap.js" src/payload.config.ts
git commit -m "feat: brand the Payload admin login and dashboard"
```

---

## Self-Review

- Spec coverage: stylesheet/palette/typography/radii/status → Task 1; logo/icon/header/meta/import map → Task 2; verification matrix split across both tasks.
- Types: `AdminIcon({ fill?: string })` is defined once and used by both `graphics.Icon` and the OG path.
- Review Focus: 1→Task 1 Step 6; 2→Task 2 Step 2 (try/catch + fallback); 3→Task 2 Step 7; 4→Task 1 Step 6 and Task 2 Step 8; 5→Task 2 Step 5 and Step 9.
- Proportion: no component bodies beyond the header's fixed copy; CSS values are pinned because the spec fixes them.
- No dead code: the site-name read is one helper reused by both components.
