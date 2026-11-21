# Portfolio Rebrand + Payload CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing pixel-clone portfolio into the owner's personal portfolio with Payload CMS-managed content, keeping every retained pixel and animation intact.

**Architecture:** Payload 3.93 mounts inside the existing Next 16 App Router app at `(payload)` route group, sharing one deployment. Pages stay prerendered; publishing fires `revalidateTag`. Content moves from `src/content/*.ts` into five collections plus one global, read through a thin view layer so client components keep their present props.

**Tech Stack:** Next.js 16.4.6 (App Router), React 19.1.0, TypeScript 5.8.3, Tailwind 4.1.13, Motion 12.23.12, Lenis 1.1.20, Payload 3.93.0, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-12-portfolio-rebrand-payload-design.md`

## Global Constraints

- Node `>=24.22.1` — Payload 3.93's exact engine floor. Do not downgrade.
- `next@16.4.6`, `payload@3.93.0`, `@payloadcms/next@3.93.0` — the peer range is `>=16.3.3 <17.0.0`; do not bump either side alone.
- Remove `output: "export"` from `next.config.ts`. Keep `trailingSlash: true` and `images.unoptimized: true`.
- Nine files stay `"use client"` and unchanged in behavior: `nav`, `about-pricing`, `chrome`, `faq-accordion`, `motion-primitives`, `project-card`, `project-showcase`, `text-cycle`, `app/blog/page`.
- Every `<img>` keeps its current markup; only `src` values change.
- Content language is English.
- Removed sections: Pricing, Testimonials, HappyClients, ClientLogos. Services becomes Skills.
- Hero label: `Web Designer & Developer`. CTA: email primary, CV (PDF) secondary. `bookUrl` is gone from all surfaces.
- Caps: collage 4 featured projects, home grid 6 projects, `/blog` page size 6, Articles renders only at ≥3 posts, work history caps at 3 entries.
- Media accepts PDF (for the CV) in addition to images.
- All 100 files in `public/img` migrate into the Media collection during seeding.

## Review Focus

Failure modes the spec implies but no feature task naturally exercises. Each gets a test in the task that owns the code.

1. **A skill arrives with an icon key outside the closed set** (via API or a stale seed) — the current maps return `undefined` and React throws. Must fall back to a neutral icon.
2. **A project has zero media blocks or a missing thumbnail** — the detail page and `ProjectCard` must render without a broken `<img>`.
3. **A post has an empty or title-less body** — `Markdown` must render nothing rather than throw.
4. **Zero projects at launch** — the collage indexes `offsets[0]` on an empty list and must not crash.
5. **A published edit does not reach visitors** — `revalidateTag` must fire for every collection the page reads, verified by editing a record and re-fetching the built page.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/payload.config.ts` | Payload init, adapters, collections, globals |
| `src/collections/{Projects,Skills,Posts,FAQs,Media,Users}.ts` | one file per collection |
| `src/globals/SiteSettings.ts` | identity, availability, CTA links, SEO |
| `src/app/(payload)/**` | admin UI + REST/GraphQL routes (generated, then committed) |
| `src/lib/media.ts` | `mediaUrl()` — resolves Media docs, legacy paths, and sizes |
| `src/lib/select.ts` | pure caps/ordering helpers used by pages |
| `src/lib/skill-icons.ts` | `ICON_KEYS`, `TOOL_KEYS`, `resolveIcon()` with a fallback |
| `src/lib/content.ts` | view layer; returns the shapes components already consume |
| `scripts/seed.ts` | idempotent content + media migration |
| `src/app/**/page.tsx` | becomes async, reads `src/lib/content.ts` |
| `src/components/{about-pricing,services,testimonials,happy-clients,client-logos}.tsx` | split, rename, or delete per Task 8 |
| `tests/**` | Vitest suites mirroring the source paths |

---

### Task 1: Test harness and pure helpers

**Files:**
- Create: `vitest.config.ts`, `src/lib/media.ts`, `src/lib/select.ts`
- Create: `tests/lib/media.test.ts`, `tests/lib/select.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `mediaUrl(ref, size?): string | null`, `featuredProjects(items, cap?): T[]`, `latestPosts(items, cap?): T[]`, `articlesLayout(items)`, `workHistoryHeight(count, expanded): number`

- [ ] **Step 1: Install the test runner**

Run: `npm i -D vitest` and add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["tests/**/*.test.ts"] } });
```

- [ ] **Step 3: Write the failing tests**

```ts
// tests/lib/media.test.ts
import { expect, test } from "vitest";
import { mediaUrl } from "../../src/lib/media";

test("passes through a legacy public path", () => {
  expect(mediaUrl("/img/a.jpg")).toBe("/img/a.jpg");
});
test("returns null for missing media", () => {
  expect(mediaUrl(null)).toBeNull();
  expect(mediaUrl(5)).toBeNull();
});
test("prefers the requested size", () => {
  expect(mediaUrl({ url: "/a.jpg", sizes: { card: { url: "/a-card.jpg" } } }, "card")).toBe("/a-card.jpg");
});
test("falls back to the original url when the size is absent", () => {
  expect(mediaUrl({ url: "/a.jpg", sizes: {} }, "card")).toBe("/a.jpg");
});
```

```ts
// tests/lib/select.test.ts
import { expect, test } from "vitest";
import { articlesLayout, featuredProjects, latestPosts, workHistoryHeight } from "../../src/lib/select";

test("keeps featured only, ordered, capped at 4", () => {
  const items = [
    { order: 3, featured: true, id: "c" },
    { order: 1, featured: true, id: "a" },
    { order: 2, featured: false, id: "b" },
    { order: 4, featured: true, id: "d" },
    { order: 5, featured: true, id: "e" },
    { order: 6, featured: true, id: "f" },
  ];
  expect(featuredProjects(items).map((i) => i.id)).toEqual(["a", "c", "d", "e"]);
});
test("empty project list stays empty", () => {
  expect(featuredProjects([])).toEqual([]);
});
test("latest posts sort newest first and cap at 6", () => {
  const items = Array.from({ length: 8 }, (_, i) => ({ date: `Mar ${i + 1}, 2025`, id: i }));
  expect(latestPosts(items)).toHaveLength(6);
  expect(latestPosts([{ date: "Mar 6, 2025" }, { date: "Apr 2, 2025" }])[0].date).toBe("Apr 2, 2025");
});
test("articles layout needs three posts", () => {
  expect(articlesLayout([{ id: 1 }, { id: 2 }])).toBeNull();
  expect(articlesLayout([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual({ featured: { id: 1 }, second: { id: 2 }, third: { id: 3 } });
});
test("work history height derives from count", () => {
  expect(workHistoryHeight(3, true)).toBe(360);
  expect(workHistoryHeight(3, false)).toBe(139);
  expect(workHistoryHeight(1, true)).toBe(182);
  expect(workHistoryHeight(0, true)).toBe(0);
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../src/lib/media'`.

- [ ] **Step 5: Implement the helpers**

```ts
// src/lib/media.ts
export type MediaRef =
  | string | number | null | undefined
  | { url?: string | null; sizes?: Record<string, { url?: string | null } | null> | null };
export function mediaUrl(ref: MediaRef, size?: string): string | null;
```

```ts
// src/lib/select.ts
export function featuredProjects<T extends { featured?: boolean | null; order?: number | null }>(items: T[], cap?: number): T[];
export function latestPosts<T extends { date: string }>(items: T[], cap?: number): T[];
export function articlesLayout<T>(items: T[]): { featured: T; second: T; third: T } | null;
export function workHistoryHeight(count: number, expanded: boolean): number;
```

`workHistoryHeight` uses the measured geometry: card 77, pitch 89, button block 105. Expanded = `count * 77 + (count - 1) * 12 + 105`; collapsed = `77 + (count - 1) * 8 + 46`; zero entries → 0.

`latestPosts` compares `Date.parse(date)`, never the raw string: the source dates are display strings like `Mar 6, 2025`, and a lexicographic sort would put April before March.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib tests/lib
git commit -m "test: add vitest and pure content helpers"
```

---

### Task 2: Payload scaffold and app routing

**Files:**
- Create: `src/payload.config.ts`, `src/collections/Users.ts`, `src/app/(payload)/**`
- Move: `src/app/{layout.tsx,page.tsx,blog,projects}` → `src/app/(site)/`
- Modify: `next.config.ts`, `package.json`, `tsconfig.json`, `.gitignore`
- Test: `tests/payload/config.test.ts`

**Interfaces:**
- Produces: a running `/admin` and `withPayload`-wrapped config; `import { Collections }` from `src/payload.config.ts` for later tasks.

- [ ] **Step 1: Install dependencies**

Run: `npm i payload@3.93.0 @payloadcms/next@3.93.0 @payloadcms/db-postgres@3.93.0 @payloadcms/db-sqlite@3.93.0 @payloadcms/richtext-lexical@3.93.0 sharp graphql` and, as a dev dependency, `sass` — Payload's `RootLayout` imports `app.scss`, and the build fails without a Sass implementation.

- [ ] **Step 1b: Split the app into route groups**

`src/app/layout.tsx` is the root layout today, so a `(payload)/layout.tsx` beside it becomes a *nested* layout and Payload's `RootLayout` renders its own `<html>`/`<body>` inside the existing one — invalid nesting that breaks admin styles.

Move `layout.tsx`, `page.tsx`, `blog/`, and `projects/` into `src/app/(site)/`. Keep `src/app/globals.css` where it is and change the moved layout's import from `./globals.css` to `../globals.css`. Delete `src/app/layout.tsx`. Afterwards `src/app` holds `(site)`, `(payload)`, and `globals.css`, with no top-level `layout.tsx`.

Route groups do not change URLs: `/`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]` keep resolving.

- [ ] **Step 2: Add the `(payload)` route group**

`create-payload-app` is interactive and aborts without a TTY (`uv_tty_init returned EBADF`), and this version no longer accepts `--db` or `--no-deps`. Do not script it. Create the group by hand, matching what `@payloadcms/next@3.93.0` actually exports after `npm i`:

- `src/app/(payload)/layout.tsx` — `RootLayout` + `handleServerFunctions` + a `'use server'` `serverFunction`; imports `importMap` and `@payloadcms/next/css`
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — `RootPage` and `generatePageMetadata`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx` — `NotFoundPage`
- `src/app/(payload)/admin/importMap.js` — generated by `npx payload generate:importmap`
- `src/app/(payload)/api/[...slug]/route.ts` — `REST_GET`, `REST_POST`, `REST_PATCH`, `REST_PUT`, `REST_DELETE`, `REST_OPTIONS`
- `src/app/(payload)/api/graphql/route.ts` — `GRAPHQL_POST`
- `src/app/(payload)/api/graphql-playground/route.ts` — `GRAPHQL_PLAYGROUND_GET`
- `src/app/(payload)/custom.scss` — empty file

Add the alias `"@payload-config": ["./src/payload.config.ts"]` to `tsconfig.json` `paths`. Verify every import against the installed package rather than guessing — inspect the package's `exports` map or `Object.keys(require('@payloadcms/next/layouts'))`.

- [ ] **Step 3: Write `src/payload.config.ts`**

```ts
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const uri = process.env.DATABASE_URI ?? "file:./payload.db";

export default buildConfig({
  admin: { user: "users" },
  editor: lexicalEditor(),
  sharp,
  secret: process.env.PAYLOAD_SECRET ?? "dev-only-secret",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: uri.startsWith("postgres")
    ? postgresAdapter({ pool: { connectionString: uri } })
    : sqliteAdapter({ client: { url: uri } }),
  collections: [Users],
  globals: [],
});
```

The dual adapter is deliberate: SQLite lets a fresh clone run and seed without provisioning Postgres, while production uses Neon.

- [ ] **Step 4: Wrap Next and drop static export**

`next.config.ts` becomes `export default withPayload({ trailingSlash: true, images: { unoptimized: true } })` with `import { withPayload } from "@payloadcms/next/withPayload"`.

- [ ] **Step 5: Write the failing config test**

```ts
// tests/payload/config.test.ts
import { expect, test } from "vitest";
import { Users } from "../../src/collections/Users";

test("users collection is registered under the admin slug", () => {
  expect(Users.slug).toBe("users");
  expect(Users.auth).toBeTruthy();
});
```

- [ ] **Step 6: Run it**

Run: `npx vitest run tests/payload/config.test.ts`
Expected: PASS.

- [ ] **Step 7: Smoke-test the admin**

Run `npm run dev`, open `http://localhost:3000/admin`, create the first user.
Expected: the create-first-user form renders and submitting reaches the dashboard.

- [ ] **Step 8: Commit**

```bash
git add src/payload.config.ts src/collections/Users.ts "src/app/(payload)" next.config.ts package.json .gitignore src/payload-types.ts
git commit -m "feat: mount payload admin inside the next app"
```

---

### Task 3: Content collections

**Files:**
- Create: `src/collections/Projects.ts`, `Skills.ts`, `Posts.ts`, `FAQs.ts`, `Media.ts`
- Create: `src/lib/skill-icons.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/components/services.tsx` (re-import the maps moved in Step 3)
- Test: `tests/payload/collections.test.ts`, `tests/lib/skill-icons.test.ts`

**Interfaces:**
- Consumes: `Users` from Task 2.
- Produces: `ICON_KEYS: readonly string[]`, `TOOL_KEYS: readonly string[]`, `resolveIcon(key: string): ComponentType`; collection constants `Projects`, `Skills`, `Posts`, `FAQs`, `Media`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/payload/collections.test.ts
import { expect, test } from "vitest";
import { Skills } from "../../src/collections/Skills";
import { Projects } from "../../src/collections/Projects";
import { ICON_KEYS, TOOL_KEYS } from "../../src/lib/skill-icons";

test("skills expose variant plus closed icon and tool selects", () => {
  const names = Skills.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(expect.arrayContaining(["name", "group", "variant", "icon", "tool", "strength", "order"]));
  const opts = (n: string) => {
    const f = Skills.fields.find((x) => "name" in x && x.name === n) as { options: unknown[] };
    return f.options.map((o) => (typeof o === "string" ? o : (o as { value: string }).value));
  };
  expect(opts("icon")).toEqual([...ICON_KEYS]);
  expect(opts("tool")).toEqual([...TOOL_KEYS]);
});
test("projects carry blocks and a pull quote", () => {
  const names = Projects.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(expect.arrayContaining(["name", "slug", "kind", "heading", "quote", "blocks"]));
});
```

```ts
// tests/lib/skill-icons.test.ts
import { expect, test } from "vitest";
import { resolveIcon } from "../../src/lib/skill-icons";

test("unknown keys fall back instead of returning undefined", () => {
  expect(resolveIcon("not-a-real-icon")).toBeDefined();
});
test("known keys resolve to a component", () => {
  expect(resolveIcon("framer")).toBeDefined();
});
```

- [ ] **Step 2: Run them**

Run: `npx vitest run tests/payload/collections.test.ts tests/lib/skill-icons.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `src/lib/skill-icons.ts`**

Move the two closed maps out of `src/components/services.tsx` verbatim (`iconFor`, `toolFor`) into this module, export their keys as `ICON_KEYS` and `TOOL_KEYS`, and add `resolveIcon(key)` returning `iconFor[key] ?? IconArrow` plus `resolveTool(name)` returning `toolFor[name] ?? IconArrow` (any existing neutral icon already imported by `icons.tsx`).

- [ ] **Step 4: Implement the five collections**

`Media`: `upload: { staticDir: "media", mimeTypes: ["image/*", "application/pdf"] }`, fields `alt` (required), `caption`, and `imageSizes` for `card` (400w) and `hero` (1200w).

`Projects`: fields per the spec table, with `slug` unique and `index: true`, `kind` select `client|experiment`, `blocks` as an array containing `layout` select `full|two|three`, `tiles` array of `{ kind: image|video, image (upload), src (text), poster (upload), alt }`, and an optional `description` group `{ heading, bold, text }`.

`Skills`: `name`, `group` select `design|build|ai-automation|generative-ai`, `variant` select `row|tile`, `icon` select over `ICON_KEYS` (admin condition `variant === 'row'`), `tool` select over `TOOL_KEYS` (admin condition `variant === 'tile'`), `strength` select `working|strong|expert`, `note`, `order`. Two fields, not one union: the maps use different key conventions (`framer` vs `Framer`) and resolve to different components.

`Posts`: `title`, `slug` unique, `description`, `category`, `date`, `image` (upload), `body` (textarea).

`FAQs`: `question`, `answer` (textarea), `category` select `availability|role|process|general`, `order`. The displayed index (`01`, `02`, …) is derived from `order` in the view layer and supplied to `faq-accordion.tsx` as `n`; it is not stored, so two FAQs can never both show `01`.

Register all five plus `Users` in `src/payload.config.ts`. Content collections
(`Projects`, `Skills`, `Posts`, `FAQs`) set `versions: { drafts: false }` — every save
publishes, per the spec's "no drafts in v1" decision.

- [ ] **Step 5: Run the tests and the type check**

Run: `npx vitest run tests/payload/collections.test.ts tests/lib/skill-icons.test.ts && npx tsc --noEmit`
Expected: PASS and no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/collections src/lib/skill-icons.ts src/payload.config.ts tests
git commit -m "feat: add content collections and closed icon registry"
```

---

### Task 4: SiteSettings global

**Files:**
- Create: `src/globals/SiteSettings.ts`
- Modify: `src/payload.config.ts`
- Test: `tests/payload/site-settings.test.ts`

**Interfaces:**
- Produces: `SiteSettings` global with `name`, `role`, `tagline`, `availabilityStatus`, `availabilityNote`, `email`, `avatar`, `resume`, `socials[]`, `workHistory[]`, `bigQuote`, `seo`, `copyright`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { SiteSettings } from "../../src/globals/SiteSettings";

test("site settings expose identity, availability, and cv fields", () => {
  const names = SiteSettings.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(expect.arrayContaining(["name", "role", "tagline", "availabilityStatus", "email", "avatar", "resume", "workHistory", "bigQuote"]));
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/payload/site-settings.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the global**

`availabilityStatus` select `open|selective|closed`; `resume` an upload restricted to PDF; `workHistory` an array of `{ company, role, dates }`; `bigQuote` group `{ text, bold, tail, name, role, avatar }` (all six are rendered by `big-quote.tsx`); `seo` group `{ title, description, ogImage }`; and `followerCount` as optional text — three render sites (About, footer, blog post) read it and hide the pill when it is empty.

- [ ] **Step 4: Run it again**

Run: `npx vitest run tests/payload/site-settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/globals src/payload.config.ts tests/payload/site-settings.test.ts
git commit -m "feat: add site settings global"
```

---

### Task 5: Object storage adapter

**Files:**
- Create: `src/lib/storage.ts`
- Modify: `src/payload.config.ts`
- Create: `.env.example`
- Test: `tests/payload/storage.test.ts`

**Interfaces:**
- Produces: `storageEnabled(): boolean` — true when all four `R2_*` variables are present.

- [ ] **Step 1: Write the failing test**

```ts
import { afterEach, expect, test } from "vitest";
import { storageEnabled } from "../../src/lib/storage";

afterEach(() => {
  delete process.env.R2_BUCKET; delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY; delete process.env.R2_ENDPOINT;
});
test("storage stays off without credentials", () => {
  expect(storageEnabled()).toBe(false);
});
test("storage turns on with the full credential set", () => {
  Object.assign(process.env, { R2_BUCKET: "b", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_ENDPOINT: "https://r2" });
  expect(storageEnabled()).toBe(true);
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/payload/storage.test.ts`
Expected: FAIL — `storageEnabled` is not exported.

- [ ] **Step 3: Implement it**

Export `storageEnabled()` from `src/lib/storage.ts` and import it in
`payload.config.ts`; when true, add `@payloadcms/storage-s3` (install it) to `plugins` with `bucket`, `config.credentials`, `config.region: "auto"`, `config.endpoint`, and `collections: { media: true }`. When false, Media writes to `./media` for local development.

- [ ] **Step 4: Run it again**

Run: `npx vitest run tests/payload/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Document the environment**

`.env.example` lists `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`.

- [ ] **Step 6: Commit**

```bash
git add src/payload.config.ts .env.example tests/payload/storage.test.ts package.json
git commit -m "feat: add r2 storage adapter"
```

---

### Task 6: Seed script

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (`"seed": "payload run scripts/seed.ts"`)

**Interfaces:**
- Consumes: collections from Task 3, global from Task 4, `src/content/{site,projects,posts}.ts` as the source of truth.
- Produces: an idempotent seed keyed by `slug`.

- [ ] **Step 1: Write the media pass**

For every file in `public/img`, create a Media record if none exists with the same `filename`. `alt` is required, so derive it from the filename (strip the extension) rather than leaving it empty, and preserve the original bytes. Verify the count afterwards equals 100.

Assert that at least one created record carries `sizes.card` and `sizes.hero`. If the run logs "Image resizing is enabled … but sharp not installed", the cause is `sharp` missing from **`buildConfig`**, not from `package.json` — the package is already a dependency and must be passed to the config.

- [ ] **Step 2: Write the content pass**

Upsert 4 Projects from `projects.ts` mapping `name→name`, `slug→slug`, `type→type`, `heading→heading`, `year→year`, `description→description`, `scope→scope`, `liveUrl→liveUrl`, `thumbnail→thumbnail` (Media id), `quote→quote`, `blocks→blocks` with each tile's `src` resolved to a Media id when the path starts with `/img/`. Set `order` to the project's index + 1 and `featured` to `true` — the home collage renders `featuredProjects()` capped at 4 and there are exactly 4 projects, so leaving them null and false yields an empty collage and an unstable grid order. Upsert 10 Posts with `body` verbatim. Upsert the `SiteSettings` global from `site`, `workHistory`, and `bigQuote`.

**Skills have no content file, so derive them** — `group` is required, and a missing value fails validation:

- from `services` (each `{ label, icon }`) → `variant: "row"`, `name = label`, `icon = icon`, `order` = array index + 1, and `group`: `framer → build`, `brand → design`, `webapp → build`, `landing → build`, `motion → design`, `3d → design`, `ux → design`.
- from `techStack` (each string) → `variant: "tile"`, `name = the string`, `tool = the same string`, `order` = array index + 1, and `group`: `Figma → design`, `Framer → build`, `Webflow → build`, `Rive → design`, `Blender → design`, `Trello → build`, `ChatGPT → generative-ai`, `Claude → generative-ai`.

`ai-automation` intentionally gets no seed rows — the owner adds those from the admin.

Upsert FAQs from `faqs`, mapping `q → question`, `a → answer`, `order` from the existing `n` (`"01"` → 1), and leaving `category` unset.

- [ ] **Step 3: Run the seed against SQLite**

Run: `npm run seed`
Expected: `seeded 100 media, 4 projects, 10 posts` with no duplicate-constraint errors on a second run.

- [ ] **Step 4: Verify idempotency**

Run: `npm run seed` again.
Expected: same counts reported, zero new records created.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "feat: seed payload from the existing content files"
```

---

### Task 7: View layer

**Files:**
- Create: `src/lib/content.ts`
- Test: `tests/lib/content-shape.test.ts`

**Interfaces:**
- Produces: `getSiteSettings()`, `getProjects()`, `getProject(slug)`, `getPosts()`, `getPost(slug)`, `getSkills()`, `getFaqs()`. Each returns the exact shape the current components consume, with media resolved to URL strings via `mediaUrl`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { toProjectView } from "../../src/lib/content";

test("project view flattens media to urls and keeps the card props", () => {
  const view = toProjectView({
    slug: "mango", name: "Mango", type: "Branding", heading: "H", year: "2026",
    description: "d", scope: ["Brand Identity"], liveUrl: "https://x",
    thumbnail: { url: "/a.jpg" }, quote: { text: "t", bold: "b", name: "n", role: "r" },
    blocks: [{ layout: "full", tiles: [{ kind: "image", image: { url: "/b.jpg" }, alt: "alt" }] }],
  });
  expect(view.thumbnail).toBe("/a.jpg");
  expect(view.blocks[0].tiles[0].src).toBe("/b.jpg");
});
test("a project without a thumbnail yields an empty string, never undefined", () => {
  const view = toProjectView({ slug: "s", name: "n", blocks: [] } as never);
  expect(view.thumbnail).toBe("");
  expect(view.blocks).toEqual([]);
});
test("video tiles keep src and flatten the poster", () => {
  const view = toProjectView({
    slug: "v", name: "v",
    blocks: [{ layout: "two", tiles: [{ kind: "video", src: "/v.mp4", poster: { url: "/p.jpg" }, alt: "" }] }],
  } as never);
  expect(view.blocks[0].tiles[0]).toEqual({ kind: "video", src: "/v.mp4", poster: "/p.jpg", alt: "" });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/lib/content-shape.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the view layer**

Each getter calls `payload.find` with `depth: 1`, sorts by `order`, then maps through a pure `toXView` function so the mapping is testable without a database. Empty bodies map to `""`.

The objects returned by `getProjects()` must be **assignable to** the existing `Project` type in `src/content/projects.ts` **while also carrying `featured` and `order`** — Task 11 filters with `featuredProjects()`, whose constraint requires those properties, and a bare `Project` erases both. Return `(Project & { featured: boolean | null; order: number | null })[]`. The card view must satisfy `ProjectCardData` in `src/components/project-card.tsx`. Import those types rather than redeclaring them, so schema drift fails `tsc` instead of silently changing what components receive.

Two avatar fields are stored differently and must be resolved differently: `SiteSettings.bigQuote.avatar` is a **Media relation** (seeded as a numeric id), so resolve it with `mediaUrl(...)`; `Projects.quote.avatar` is a **text path** (`/img/…`), so pass it through unchanged. Both components render `<img src>`, so an unresolved id becomes `src="18"`.

- [ ] **Step 4: Run it again**

Run: `npx vitest run tests/lib/content-shape.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts tests/lib/content-shape.test.ts
git commit -m "feat: add payload view layer with url-resolved shapes"
```

---

### Task 8: Component surgery

**Files:**
- Modify: `src/components/about-pricing.tsx:1-165` (keep), delete `:166-313`
- Create: `src/components/skills.tsx`, `src/components/about.tsx`
- Delete: `src/components/testimonials.tsx`, `happy-clients.tsx`, `client-logos.tsx`, `services.tsx`
- Modify: `src/app/(site)/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`
- Modify: `src/app/(site)/projects/page.tsx` — remove only the `HappyClients`/`ClientLogos` imports and their elements, which deleting those components makes mandatory. Task 8b still owns its data rewiring.
- Test: `tests/components/empty-media.test.tsx`

**Interfaces:**
- Consumes: `getSkills()`, `getSiteSettings()` from Task 7; `resolveIcon` from Task 3.
- Produces: `About({ workHistory, site })`, `Skills({ skills })`, `Markdown` unchanged.

- [ ] **Step 1: Write the failing test**

```tsx
import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Skills } from "../../src/components/skills";

test("a skill with an unknown icon still renders", () => {
  const html = renderToStaticMarkup(<Skills skills={[{ name: "Weird", group: "build", variant: "row", icon: "nope", strength: "working", order: 1 }]} />);
  expect(html).toContain("Weird");
});
test("skills with no rows render nothing", () => {
  expect(renderToStaticMarkup(<Skills skills={[]} />)).toBe("");
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/components/empty-media.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Split About out of `about-pricing.tsx`**

Copy lines 1–165 into `src/components/about.tsx`, keep `"use client"`, keep the work-history spring (`stiffness: 120, damping: 18, mass: 1`) untouched, replace the `workHistory`/`site` module imports with props (`About({ workHistory, site })` supplied by the page), and replace the fixed `360` with `workHistoryHeight(entries.length, true)` while the collapsed height uses the same helper. Delete `about-pricing.tsx`.

- [ ] **Step 4: Build `src/components/skills.tsx`**

Section id becomes `skills`. Preserve the two existing render paths exactly:

- **tile** (`variant: "tile"`, icon from `resolveTool(tool)`): outer `group relative size-14`; inner `grid size-14 place-items-center rounded-[12px] bg-white shadow-card`; icon `className="size-6 text-black"`; tooltip `pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-pre rounded-full bg-black px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100` with `transitionDelay: ${i * 0.05}s`, text = the skill `name`.
- **row** (`variant: "row"`, icon from `resolveIcon(icon)`): wrapped in `<Appear delay={0.05 * i} duration={0.5}>`; inner `flex items-center gap-3`; badge `grid size-10 shrink-0 place-items-center rounded-full bg-black text-white shadow-btn`; icon `<Icon className="size-6" filled strokeWidth={1.5} />`; label `<p className="t-lead">{name}</p>`.
- Layout stays `container-1080 flex flex-col items-start gap-16 md:flex-row md:items-center`, left column `md:flex-[1.5]` with the heading and the tile grid (`flex flex-wrap items-center gap-2`), right column `md:flex-1` with `flex flex-col gap-12`.
- Return `null` when there are no skills.

The two icon families take different props — row icons accept `filled`/`strokeWidth`, tool logos accept only `className` — which is why `icon` and `tool` are separate fields and `resolveIcon` must not be used for tiles.

- [ ] **Step 5: Remove the dead components**

Delete the four files and every import in `app/page.tsx` and `app/projects/[slug]/page.tsx`. `page.tsx` order becomes Hero → Projects → BigQuote → Skills → About → FAQ.

Two more imports break with those deletions and must be handled in the same step:

- `faq.tsx` imports `HappyClients` and renders it in the sticky sidebar card; drop that import and the element.
- `faq-accordion.tsx` imports `faqs` from `@/content/site` and is a client component. It must take `faqs` as a prop instead, supplied by `faq.tsx`, which in turn receives them from the page. Keep its `"use client"` and its internal `useState`.

`faq.tsx` also reads `site` for the sidebar card; it must receive the settings values it needs as props in the same way.

- [ ] **Step 6: Run the tests and the type check**

Run: `npx vitest run tests/components && npx tsc --noEmit`
Expected: PASS, and no unresolved imports.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app/page.tsx "src/app/projects/[slug]/page.tsx" tests/components
git commit -m "refactor: split about from pricing and replace services with skills"
```

---

### Task 8b: Listing and detail page wiring

**Files:**
- Modify: `src/app/(site)/projects/page.tsx`, `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProjects()`, `getPosts()`, `getPost(slug)`, `getSiteSettings()` from Task 7.

- [ ] **Step 1: Wire the projects index**

`projects/page.tsx` becomes an async server component calling `getProjects()` and `getSiteSettings()`, and drops the `HappyClients`/`ClientLogos` imports deleted in Task 8.

- [ ] **Step 2: Split the blog index into server page + client list**

`blog/page.tsx` is `"use client"` today and filters with `useMemo`/`useState`. Make the page a server component that fetches `getPosts()`, and move the filter UI and its hooks into `src/components/blog-list.tsx` (`"use client"`) receiving `posts` as a prop. Derive categories from the data (`["All", ...new Set(posts.map(p => p.category))]`) instead of the hardcoded `postCategories` array.

- [ ] **Step 3: Wire the post detail**

`blog/[slug]/page.tsx` becomes async: `generateStaticParams` reads `getPosts()`, the body loads via `getPost(slug)` and calls `notFound()` when absent, and the follower pill reads settings.

- [ ] **Step 4: Confirm the content modules are no longer read**

Run `grep -rn "@/content" src --include=*.ts --include=*.tsx`. Expected: only `src/lib/content.ts` (type imports) and the seed reference the modules; no page does.

- [ ] **Step 5: Verify and commit**

Run `npx vitest run && npx tsc --noEmit && npx next build`, then commit `refactor: read listing pages from the cms`.

---

### Task 9: CTA rewiring

**Files:**
- Modify: `src/components/nav.tsx`, `chrome.tsx`, `footer.tsx`, `faq.tsx`, `src/app/page.tsx`, `src/app/projects/page.tsx`, `src/app/projects/[slug]/page.tsx`
- Modify: `src/content/site.ts` (remove `bookUrl`)

**Interfaces:**
- Consumes: `getSiteSettings()` — `email`, `resume`, `socials`.
- Produces: no `bookUrl` reference anywhere.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { globSync, readFileSync } from "node:fs";

test("no source file references the booking url", () => {
  const offenders = globSync("src/**/*.{ts,tsx}").filter((f) => {
    const text = readFileSync(f, "utf8");
    return text.includes("bookUrl") || text.includes("cal.com");
  });
  expect(offenders).toEqual([]);
});
test("the cv download is wired on the hero, footer and sticky bar", () => {
  for (const f of ["src/app/page.tsx", "src/components/footer.tsx", "src/components/chrome.tsx"]) {
    expect(readFileSync(f, "utf8"), f).toContain("resume");
  }
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/cta.test.ts`
Expected: FAIL — `bookUrl` still present.

- [ ] **Step 3: Rewire the seven surfaces**

Replace each booking link with `mailto:${site.email}`; replace the Cal.com wordmark block in `faq.tsx` with a CV download; give the sticky bar's calendar slot the CV. Labels become `Email me` and `Download CV`.

`footer.tsx` keeps its `socials` array at module scope today, reading `site.social.x` and `site.followerCount` at import time. Move it inside the component and build it from the `socials` and `followerCount` values the page passes down; keep the four hardcoded network URLs for Instagram, Dribbble, Behance, and LinkedIn, and omit the count pill when `followerCount` is empty.

- [ ] **Step 4: Run it again**

Run: `npx vitest run tests/cta.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: replace booking ctas with email and cv"
```

---

### Task 10: Nav links

**Files:**
- Modify: `src/content/site.ts` (or `src/lib/nav.ts` if the links move to the CMS), `src/components/nav.tsx`
- Test: `tests/nav.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { navLinks } from "../src/lib/nav";

test("nav exposes work, skills, blog and contact", () => {
  expect(navLinks.map((l) => l.label)).toEqual(["Work", "Skills", "Blog", "Contact"]);
});
test("skills anchors to the renamed section", () => {
  expect(navLinks.find((l) => l.label === "Skills")!.href).toBe("/#skills");
});
```

- [ ] **Step 2: Run it, then implement**

Run: `npx vitest run tests/nav.test.ts` → FAIL. Create `src/lib/nav.ts` with the four links, use it in `nav.tsx`, and rename the section id to `skills`. Delete the `navLinks` export from `src/content/site.ts` at the same time: it still publishes `Services → /#services` and `Pricing → /#pricing`, both of which now point at nothing (the section id became `skills` and Pricing is gone), and leaving the array behind lets a stale import resurrect them.

- [ ] **Step 3: Verify the open width is unchanged**

Open the site at 1440, hover the dots.
Expected: `nav` is `[445,24,550,56]` in the console via `getBoundingClientRect`, dots at `[800,40,24,24]` when closed.

- [ ] **Step 4: Commit**

```bash
git add src/lib/nav.ts src/components/nav.tsx src/app/page.tsx tests/nav.test.ts
git commit -m "feat: rename services to skills in navigation"
```

---

### Task 11: Wire the caps

**Files:**
- Modify: `src/app/page.tsx`, `src/app/blog/page.tsx`, `src/components/project-showcase.tsx`, `src/components/articles.tsx`
- Test: `tests/pages/caps.test.ts`

**Interfaces:**
- Consumes: `featuredProjects`, `latestPosts`, `articlesLayout` from Task 1.

- [ ] **Step 1: Write the failing tests**

```ts
import { expect, test } from "vitest";
import { featuredProjects, articlesLayout } from "../../src/lib/select";

test("five featured projects still yield four collage slots", () => {
  const five = Array.from({ length: 5 }, (_, i) => ({ order: i, featured: true }));
  expect(featuredProjects(five)).toHaveLength(4);
});
test("articles render nothing below three posts", () => {
  expect(articlesLayout([{ id: 1 }])).toBeNull();
});
```

- [ ] **Step 2: Run, then apply the caps**

Run: `npx vitest run tests/pages/caps.test.ts` → PASS after Task 1. Then apply them: `page.tsx` passes `featuredProjects(projects)` to the collage and `projects.slice(0, 6)` to the grid — `getProjects()` already sorts by `order`, so no second helper is needed and `latestPosts` applies only to posts. `blog/page.tsx` uses page size 6; `articles.tsx` returns `null` when `articlesLayout` is null.

- [ ] **Step 3: Verify zero and one project states**

With the seed emptied to 0 projects, load `/`.
Expected: Projects section renders its heading with no cards and no console error.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/blog/page.tsx src/components/project-showcase.tsx src/components/articles.tsx tests/pages
git commit -m "fix: cap project and post lists so cms growth cannot break layout"
```

---

### Task 12: Prerendering and revalidation

**Files:**
- Create: `src/lib/revalidate.ts`
- Modify: `src/app/(site)/**/page.tsx`, `src/collections/{Projects,Skills,Posts,FAQs,Media}.ts`, `src/globals/SiteSettings.ts`
- Test: manual verification recorded in the commit message

- [ ] **Step 1: Add the ISR contract**

Each page under `src/app/(site)` exports `export const revalidate = 3600` so the prerendered HTML refreshes periodically.

Invalidation is by **path**, not by tag: the local API's `payload.find` is not a `fetch`, so `next: { tags }` on it does nothing. Create `src/lib/revalidate.ts` with a single `revalidateSite()` that calls `revalidatePath("/", "layout")` — one call invalidates every prerendered route, which is correct for a site this size and avoids enumerating paths per collection.

Register `afterChange` and `afterDelete` hooks on `Projects`, `Skills`, `Posts`, `FAQs`, `Media`, and the `SiteSettings` global, each calling `revalidateSite()`. `Media` matters because replacing a file changes its URL, and a stale URL would keep serving the previous image until the window expired.

**Critical:** `revalidatePath` throws when it runs outside a Next request context, and the hooks also fire during `npm run seed`, which is a plain script. `revalidateSite()` must swallow that specific failure — wrap the call in `try/catch` and ignore the missing-store error — or seeding will abort. Verify by running `npm run seed` after wiring the hooks.

- [ ] **Step 2: Build and start**

Run: `npm run build && npm start`, then load `/`, `/projects`, `/projects/mango`, `/blog`, `/blog/<slug>`.
Expected: all five render with no build-time errors and no dynamic-render warnings.

- [ ] **Step 3: Verify invalidation end to end**

Edit a project's `name` in `/admin`, save, then reload `/projects`.
Expected: the new name appears without a rebuild.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "feat: prerender pages and revalidate on publish"
```

---

### Task 13: Structural verification and docs

**Files:**
- Modify: `README.md`, `prompts/reference-diff.md`

- [ ] **Step 1: Run the structural gates**

Using the browser console at 1440×900: `nav` closed `[604,24,233,56]`, open `[445,24,550,56]`, dots `[800,40,24,24]`, work-history toggle springs over ~550 ms with a ~1% overshoot, `document.documentElement.clientWidth === window.innerWidth`.
Expected: all match.

- [ ] **Step 2: Run the full suite**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 3: Update the README**

Replace the template identity, list the new stack (Payload, Neon, R2, Vercel Hobby), document `npm run seed`, and note that `prompts/reference-diff.md` is now a structural check.

- [ ] **Step 4: Commit**

```bash
git add README.md prompts/reference-diff.md
git commit -m "docs: document cms setup and post-rebrand structure"
```

---

### Task 14: Deployment

**Files:** none in the repo — this task provisions services and sets environment.

**Interfaces:**
- Consumes: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, the four `R2_*` values.
- Produces: a public URL where `/admin` and prerendered pages both work.

- [ ] **Step 1: Provision the database**

Create a Neon project in the Singapore region and copy the pooled connection string.

- [ ] **Step 2: Provision storage**

Create an R2 bucket and an API token with object read/write; record endpoint, key id, and secret.

- [ ] **Step 3: Create the Vercel project**

Import the repo on the Hobby plan, set all seven environment variables for Production and Preview, and keep the default build command (`next build`).

- [ ] **Step 4: Deploy and smoke-test**

Open the deployment URL, then `/admin`.
Expected: the admin loads and the first user can be created; the home page renders from prerendered HTML.

- [ ] **Step 5: Seed production once**

Run the seed against the production `DATABASE_URI` with the `R2_*` variables present, so media uploads land in R2 rather than local disk. Verify the Media list count is 100 and one image URL resolves to the R2 hostname.

- [ ] **Step 6: Verify publication reaches visitors**

Edit a project name in the production admin, save, reload `/projects`.
Expected: the new name appears within one revalidation window.

---

## Self-review notes

- Spec coverage: every section of the design doc maps to a task — data model (Tasks 3–4), asset migration (6), component surgery (8), CTAs (9), nav (10), caps (11), rendering (12), verification (13), deployment (14).
- The five Review Focus failures each have a test: icon fallback (Task 8), missing thumbnail (Task 7), empty post body (Task 7 mapping), zero projects (Task 11), stale page (Task 12 step 3).
- No task leaves `about-pricing.tsx` half-split: Task 8 creates `about.tsx` and deletes the original in the same step.
