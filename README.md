# Portfolio

A portfolio site built on Next.js with Payload as its CMS. Pages are prerendered
at build time and refreshed hourly; publishing in the admin invalidates them
immediately.

The visual design was rebuilt from the LaunchFolio Framer reference. Copy and
imagery are the owner's own (sources in
[`docs/content/copy-draft.md`](docs/content/copy-draft.md)), so
[`prompts/reference-diff.md`](prompts/reference-diff.md) is now a **structural**
check for the retained sections — block order and heights, element geometry,
interaction states, animation curves — not a whole-page pixel audit.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4.6, App Router |
| UI | React 19.1, TypeScript 5.8 (strict) |
| Styling | Tailwind CSS 4.1 (`@theme` tokens) |
| Animation | Motion 12 |
| Smooth scroll | Lenis 1.1 |
| CMS | Payload 3.93 — admin at `/admin`, REST and GraphQL under `/api` |
| Uploads | Payload S3 storage plugin, backed by Cloudflare R2 |
| Database | Postgres (Neon in production), SQLite file for local work |
| Tests | Vitest 5.1 |

## Design system

Color tokens, typography, layout, component specs, motion, and accessibility
rules live in [`design.md`](design.md). It is generated from the code: update it
whenever a token or component rule changes.

## Content model

Five content collections plus one global. `users` is the Payload auth collection
with `owner` and `agent` roles plus API key support (`useAPIKey: true`): only
`owner` can log into `/admin`, publish or unpublish posts, delete records, or
change settings and other collections; `agent` is restricted server-side to
creating/updating `posts` drafts (`?draft=true`), creating `media`, and reading
`posts` and `projects`.

- `projects` — case studies: name, slug, kind, summary blocks, media tiles.
- `posts` — articles with drafts enabled (`versions: { drafts: true }`):
  `title`, `slug`, `description`, `category` (`ai-workflow`, `ai-in-products`,
  `experiments`, `wordpress`), `publishedAt`, `image`, `body` (plain-text
  Markdown textarea rendered by the dependency-free `Markdown` component with
  `##`/`###` headings, lists with one nesting level, fenced code blocks, inline
  code, safe links, captioned images, blockquotes, and horizontal rules),
  `tools`, `relatedProjects`, `discussion` (`platform` from `SOCIAL_KEYS`,
  `https://` URL), and `aiAssisted` (default `true`).
- `skills` — row and tile entries with icon, group, and strength.
- `faqs` — question, answer, category, order.
- `media` — uploads with alt text and card/hero/thumb/wide image sizes.
- `site-settings` (global) — split into admin tabs (Identity, Hero, About,
  Sections, Socials, Footer, SEO). The tabs are unnamed, so every field keeps
  its root path and column:
  - identity: `name`, `role`, `email`, `avatar`, `resume`;
  - hero: `tagline`, `availabilityStatus`, `availabilityNote`;
  - about: `workHistory`, `about.signature` (optional image, hidden when empty);
  - sections: `bigQuote` and `copy`, one group per section (`hero`, `home`,
    `skills`, `about`, `faq`, `articles`, `blog`, `projects`, `project`,
    `contactCta`, `footer`). These fields are overrides only; see "Editing
    copy" below;
  - socials: `socials[]` (`platform` from the closed list in
    `src/lib/social-icons.ts`, `url` that must start with `https://`) and
    `followerCount`, which only the X chip shows. The hidden `label` field is
    a legacy fallback for rows saved before `platform` existed;
  - footer: `footerWordmark` (defaults to the first name), `copyright`;
  - seo: `seo`.

`services` and `techStack` in `src/content/site.ts` have no collection of their
own: the seed turns `services` into `skills` rows and `techStack` into skill
tiles. The `faqs` array in the same file seeds the `faqs` collection.

The site reads all of it through the view layer in `src/lib/content.ts`.

### Draft preview and editorial workflow

Clicking **Preview** on a post in `/admin` opens `/preview/?slug=<slug>`, which
verifies the logged-in `owner` session cookie, enables Next.js Draft Mode, and
redirects to `/blog/<slug>/` with a **"Preview, not published"** bar. Clicking
**Exit preview** sends `POST /preview/exit/?slug=<slug>` to disable Draft Mode.
Unpublished drafts return 404 to public visitors and never appear on `/`,
`/blog`, project pages, `/sitemap.xml`, or OG metadata.

Editorial tone rules and the agent draft REST API procedure live in
[`docs/content/TONE.md`](docs/content/TONE.md) and
[`docs/content/workflow.md`](docs/content/workflow.md).

### Editing copy

The site's copy is written in `src/lib/copy-defaults.ts`. It is versioned with
the code and reaches production with the next deploy. The copy fields in the
admin (Site Settings → Sections → Copy) start empty and show that text as a
grey placeholder. Fill a field to override it; clear it again to fall back to
the repo text. Nothing is copied into the database unless you type it, so an
edit to `copy-defaults.ts` shows up on every field you have not overridden.

## Commands

```bash
npm install
npm run dev     # dev server on :3000, site + /admin (-- -p 3100 to pick a port)
npm run build   # production build
npm start       # serve the production build on :3000
npm test        # vitest run
npm run seed    # load src/content/*.ts into Payload
npm run thumbs  # build project thumbnails and phone images into public/img
```

### Project images for a new project

1. Put `<slug>-desktop-1.jpg` (1440x900 at 2x, 2880x1800) in `public/img`,
   and `<slug>-mobile-1.jpg` and `<slug>-mobile-2.jpg` (390x844 at 2x,
   780x1688) in `scripts/thumbnails/sources/`. The phone screenshots are only
   read by the generator, so they stay out of `public/` and the seed.
2. Add the slug to `scripts/thumbnails/config.ts` with its accent colour
   (`#rrggbb`) and `source: "<slug>-desktop-1.jpg"`.
3. Run `npm run thumbs`. It writes `<slug>-thumb.jpg`,
   `<slug>-mobile-pair.jpg`, and `<slug>-mobile-single.jpg` for every project
   in the config and prints their sizes. `npm run thumbs -- --variant=B
   --out=<dir>` renders the gradient-and-grain variant elsewhere for
   comparison; `--only=thumbs`, `--only=pairs`, or `--only=singles` limits
   the output.
4. Point the project in `src/content/projects.ts` at `/img/<slug>-thumb.jpg`
   and a full-width block with `src: "/img/<slug>-mobile-pair.jpg"` and
   `mobileSrc: "/img/<slug>-mobile-single.jpg"`, then `npm run seed`.

The rules for these images (frame, sizes, shadow, safe area) are in
[`design.md`](design.md) under Media.

`npm run seed` is idempotent: every pass keys on the collection's natural key
(media filename, project/post slug, skill name, FAQ question) and updates the
existing row instead of duplicating it. It uploads every image in `public/img`
and every PDF in `public/files` (the CV, linked to `resume` through
`site.resume`). `site-settings` is only written while
it is empty: once it has a `name`, the seed logs `site-settings exists, skipped`
and leaves the owner's edits alone. `SEED_FORCE_SETTINGS=true npm run seed`
overwrites it with the seed identity. Section copy is never seeded; empty copy
fields fall back to the defaults in `src/lib/copy-defaults.ts`.

## Rendering

Every page under `src/app/(site)` exports `revalidate = 3600`, so `next build`
prerenders `/`, `/blog`, `/blog/[slug]`, `/projects`, and `/projects/[slug]` as
static HTML and refreshes them hourly. Payload `afterChange`/`afterDelete` hooks
call `revalidateSite()` (`src/lib/revalidate.ts`), which runs
`revalidatePath("/", "layout")` — one call drops every prerendered route,
including the `[slug]` pages. The helper swallows only Next's
`Invariant: static generation store missing` error, which is what
`revalidatePath` throws when the seed script writes outside a request. Without
that guard `npm run seed` would abort.

## Deployment

The app runs on Vercel Hobby, Postgres on Neon, and uploads on Cloudflare R2.
Set these variables in the hosting environment (names only — values live in the
dashboard, never in the repo):

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | Neon connection string (`postgres://…`) |
| `PAYLOAD_SECRET` | Payload signing secret; required whenever `NODE_ENV=production` |
| `NEXT_PUBLIC_SERVER_URL` | public origin of the site |
| `R2_BUCKET` | R2 bucket name |
| `R2_ACCESS_KEY_ID` | R2 token id |
| `R2_SECRET_ACCESS_KEY` | R2 token secret |
| `R2_ENDPOINT` | R2 S3 endpoint |
| `R2_PUBLIC_URL` | public custom domain of the bucket (e.g. `https://media.haloafan.com`); Media URLs point here |

Copy `.env.example` to `.env` for local work. Without it, `payload.config.ts`
falls back to `file:./payload.db` for `DATABASE_URI`; if any R2 value
(including `R2_PUBLIC_URL`) is missing, uploads fall back to the local
`./media` directory. With R2 on, Media files are read straight from
`R2_PUBLIC_URL` (`disablePayloadAccessControl`), not through
`/api/media/file`, so every Media file is public.

`PAYLOAD_SECRET` is required for `npm run build` and `npm start`: both run with
`NODE_ENV=production`, and `payloadSecret()` in `src/lib/secret.ts` throws
instead of booting Payload without one. Under `npm run dev` and `npm test` it is
optional; an unset secret falls back to a fixed dev-only value.

Run local production builds against SQLite (`DATABASE_URI=file:./payload.db`).
Keep production, Neon migration (`MIGRATION_DATABASE_URI`), and agent
(`PAYLOAD_AGENT_API_KEY`) credentials in `.env.deploy` — never
`.env.production.local` — so Next.js does not auto-load production
`DATABASE_URI` during `npm run build`. Load `.env.deploy` explicitly per command
(for example `node --env-file=.env.deploy ...` or an explicit shell variable).
See [`docs/deploy.md`](docs/deploy.md) for deployment and Postgres migration
steps.

## Layout

```
src/
  app/(site)/          public pages — home, blog, projects, [slug] routes
  app/(payload)/       Payload admin and API route handlers
  collections/         Payload collection configs
  globals/             SiteSettings global
  lib/                 content view layer, storage gate, revalidation helper
  content/             seed source modules (projects, posts, site)
scripts/seed.ts        one-way bridge from src/content into Payload
tests/                 Vitest suites — components, pages, lib, payload config
```
