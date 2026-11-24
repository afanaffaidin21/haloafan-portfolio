# AI Notes in the Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty blog into the home for evidence-backed AI and web articles, drafted by an AI agent in the production admin, previewed by the owner on the real frontend, and published only by him.

**Architecture:** Extend the existing `posts` collection (drafts, real dates, categories, tools, related projects, discussion links, AI disclosure). Add `owner`/`agent` roles with server-side access rules and API keys. Add a session-checked preview route that turns on Next.js Draft Mode. Extend the dependency-free Markdown renderer. Link posts to projects both ways. Ship every schema change as one Postgres migration.

**Tech Stack:** Next.js 16.4.6 (App Router), Payload 3.93 (SQLite local with push, Postgres on Neon in production with `prodMigrations`), Cloudflare R2, Vitest 5, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-11-24-ai-notes-blog-design.md`

## Global Constraints

- Read `AGENTS.md`, `design.md`, the spec, and `node_modules/next/dist/docs` (especially `01-app/02-guides/draft-mode.md`) before touching Next APIs. Use find-docs for Payload 3.93 APIs (drafts, `admin.preview`, `useAPIKey`, access control, hooks); do not rely on memory.
- Every commit passes `npx vitest run`, `npx tsc --noEmit`, `npm run lint`; `npm run build` succeeds before the last production step.
- No new dependencies.
- Layout geometry and the visual system in `design.md` do not regress. New UI uses existing `t-*` classes and semantic color tokens only.
- All new user-facing copy goes in `src/lib/copy-defaults.ts` (placeholder pattern), never hardcoded in components.
- Site articles are English. No raw HTML from Markdown; React escaping is the only HTML path.
- Secrets (agent API key, connection strings) never appear in the repo, commits, logs, or reports.
- Dev server on port 3100. Port 3000 belongs to another app: never stop it.
- Local DB is SQLite with push. Back up `payload.db` and `./media` outside the repo (`D:\Afan-Files\backup\portfolio-<YYYYMMDD>\`) before any schema push. Postgres schema changes ship only as committed migrations.
- Steps marked OWNER need the owner's accounts: stop, give exact click-by-click instructions, and wait.
- SQLite push traps from `AGENTS.md` apply: give long text defaults as functions, and if a push both makes a column nullable and adds a column in the same table, push in two steps.
- Integration tests that boot Payload use a throwaway SQLite file and delete it afterwards. If booting Payload inside Vitest is not feasible, put the same assertions in `scripts/checks/<name>.ts`, run them with `npx payload run` against the throwaway DB in that step, and report the output.

## Review Focus

1. An anonymous visitor requests `/blog/<draft-slug>/`: expect 404, and the draft absent from `/blog`, home, sitemap, related notes, `generateStaticParams`, and metadata. (Task 3)
2. The agent API key calls REST with `_status: "published"`, without `?draft=true`, or tries DELETE, or writes to projects/site-settings/users: expect 403 and no change. (Task 4)
3. `/preview/?slug=` without an owner session, with an unknown slug, or with `slug=//evil.com` or `../x`: expect no Draft Mode cookie and no redirect off-site. (Task 5)
4. A published post gets a new draft saved: the public page still shows the published version until the owner publishes. (Task 3)
5. Markdown with `javascript:` links or images, an unclosed code fence, or literal `<script>`: links render as plain text, the fence renders to the end as code, the tag renders escaped. (Task 6)

---

### Task 1: TikTok and YouTube in the social registry

**Files:**
- Modify: `src/components/icons.tsx` (add `IconTikTok`, `IconYouTube`, same signature and stroke style as `IconThreads`)
- Modify: `src/lib/social-icons.ts` (add keys `tiktok`, `youtube` to `socialIconFor` and `SOCIAL_LABELS` "TikTok", "YouTube")
- Test: `tests/lib/social-icons.test.ts`

**Interfaces:**
- Produces: `SocialKey` now includes `"tiktok" | "youtube"`; `SOCIAL_KEYS` order ends with them. `SiteSettings.socials.platform` options follow automatically (schema change, migrated in Task 9).

- [ ] **Step 1: Failing test** `social keys include tiktok and youtube with labels` — `expect(SOCIAL_KEYS).toEqual(expect.arrayContaining(["tiktok","youtube"]))`, `SOCIAL_LABELS.tiktok === "TikTok"`, `resolveSocialIcon("youtube") === IconYouTube`.
- [ ] **Step 2:** Run `npx vitest run tests/lib/social-icons.test.ts` — FAIL.
- [ ] **Step 3:** Add the icons (paths from Simple Icons CC0, like the existing logos) and registry entries.
- [ ] **Step 4:** Run the test file and `npx tsc --noEmit` — PASS.
- [ ] **Step 5:** Commit `feat: add TikTok and YouTube to the social registry`.

### Task 2: Post categories and dates as pure helpers

**Files:**
- Create: `src/lib/post-meta.ts`
- Test: `tests/lib/post-meta.test.ts`

**Interfaces:**
- Produces:
  - `POST_CATEGORIES: readonly { value: PostCategory; label: string }[]` = `ai-workflow` "AI Workflow", `ai-in-products` "AI in Products", `experiments` "Experiments", `wordpress` "WordPress".
  - `type PostCategory = "ai-workflow" | "ai-in-products" | "experiments" | "wordpress"`.
  - `categoryLabel(value: string | null | undefined): string` — label, or `""` for unknown.
  - `formatPostDate(iso: string | null | undefined): string` — `"Mar 6, 2025"` (en-US, `timeZone: "UTC"`), `""` for empty or invalid.

- [ ] **Step 1: Failing tests** — `categoryLabel("ai-workflow") === "AI Workflow"`, `categoryLabel("nope") === ""`; `formatPostDate("2025-03-06T00:00:00.000Z") === "Mar 6, 2025"`; `formatPostDate("2025-03-06T23:30:00.000Z") === "Mar 6, 2025"`; `formatPostDate("") === ""`; `formatPostDate("x") === ""`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement with `Intl.DateTimeFormat`.
- [ ] **Step 4:** Run — PASS.
- [ ] **Step 5:** Commit `feat: add post category and date helpers`.

### Task 3: Posts schema, drafts, and published-only reads

**Files:**
- Modify: `src/collections/Posts.ts`
- Modify: `src/content/posts.ts` (the `Post` view type; `posts` stays `[]`)
- Modify: `src/lib/content.ts` (`PostDocInput`, `toPostView`, `byDateDesc`, `getPosts`, `getPost`, new `getPostsForProject`)
- Modify: `src/lib/revalidate.ts` (new `shouldRevalidatePost`)
- Modify: `scripts/seed.ts` (`toPostData` for the new shape)
- Test: `tests/lib/content-shape.test.ts`, `tests/payload/collections.test.ts`, `tests/lib/revalidate.test.ts` (new)

**Interfaces:**
- Consumes: Task 1 `SOCIAL_KEYS`, `SOCIAL_LABELS`; Task 2 `POST_CATEGORIES`, `categoryLabel`, `formatPostDate`.
- Produces:
  - `Posts` fields: `title`, `slug`, `description`, `category` (select from `POST_CATEGORIES`, required), `publishedAt` (date, required, day only), `image`, `body` (textarea), `tools` (text hasMany), `relatedProjects` (relationship → `projects`, hasMany), `discussion` (array `{ platform: select SOCIAL_KEYS, url: text https-validated }`), `aiAssisted` (checkbox, default `true`). `date` removed. `versions: { drafts: true }`.
  - `Post` view: `{ slug, title, description, category: string /* label */, categoryKey: string, date: string /* formatPostDate */, publishedAt: string /* ISO */, image, body, tools: string[], relatedProjects: { slug: string; name: string }[], discussion: { platform: SocialKey; url: string }[], aiAssisted: boolean }`. Existing components keep reading `category` and `date` unchanged.
  - `getPosts(): Promise<Post[]>` — published only, newest `publishedAt` first.
  - `getPost(slug: string, opts?: { draft?: boolean }): Promise<Post | null>` — published only unless `draft: true` (latest draft version, used only by preview).
  - `getPostsForProject(projectSlug: string): Promise<Post[]>` — published posts whose `relatedProjects` contains that project, newest first.
  - `shouldRevalidatePost(args: { doc: { _status?: string | null }; previousDoc?: { _status?: string | null } | null }): boolean` — true when either is `"published"`.
  - Posts hooks: `afterChange` revalidates only when `shouldRevalidatePost` is true; `afterDelete` always.

- [ ] **Step 1: Failing tests**
  - `toPostView maps the new fields` — doc with `category: "ai-workflow"`, `publishedAt: "2026-11-24T00:00:00.000Z"`, `tools: ["Claude"]`, `relatedProjects: [{ slug: "jejak-puncak", name: "Jejak Puncak" }]`, `discussion: [{ platform: "threads", url: "https://www.threads.com/@afanaffaidin/post/1" }, { platform: "nope", url: "https://x" }]`, `aiAssisted: true` → `category === "AI Workflow"`, `categoryKey === "ai-workflow"`, `date === "Nov 24, 2026"`, `discussion` has one entry, `relatedProjects[0].slug === "jejak-puncak"`.
  - `toPostView tolerates an empty doc` — all strings `""`, arrays `[]`, `aiAssisted === false`.
  - `posts collection enables drafts and has no free-text date` — `Posts.versions` has `drafts` truthy; field names include `publishedAt`, `tools`, `relatedProjects`, `discussion`, `aiAssisted`; exclude `date`; `category` options equal `POST_CATEGORIES` values.
  - `shouldRevalidatePost` — draft→draft false; draft→published true; published→draft true; new draft without previous false.
- [ ] **Step 2:** Run the three test files — FAIL.
- [ ] **Step 3:** Implement the schema, view, getters, and hook. Public getters pass an explicit `where: { _status: { equals: "published" } }` (and `draft: false`); confirm against Payload 3.93 docs that a never-published draft is excluded and a published doc with a newer draft returns the published version. Seed's `toPostData` maps the new fields (no posts are seeded today).
- [ ] **Step 4:** Back up the local DB, run `npm run dev -- -p 3100` once so SQLite pushes, stop it, then run the tests, `npx tsc --noEmit`, and `npx payload generate:types` — PASS.
- [ ] **Step 5: Draft-leak check (Review Focus 1, 4)** — integration test `tests/payload/post-visibility.test.ts` against a throwaway SQLite file (`DATABASE_URI=file:./tmp-test.db`, deleted after): create post A published, post B draft only, then save a draft change to A's title. Assert `getPosts()` returns only A with its published title, `getPost("b")` is `null`, `getPost("b", { draft: true })` returns B, `getPostsForProject` never returns B.
- [ ] **Step 6:** Commit `feat: add drafts, categories, dates, tools, and project links to posts`.

### Task 4: Owner and agent roles with server-side access

**Files:**
- Create: `src/access/roles.ts`
- Modify: `src/collections/Users.ts`, `src/collections/Posts.ts`, `src/collections/Media.ts`, `src/collections/Projects.ts`, `src/collections/Skills.ts`, `src/collections/FAQs.ts`, `src/globals/SiteSettings.ts`
- Test: `tests/payload/roles.test.ts` (unit, access functions), `tests/payload/agent-access.test.ts` (integration, throwaway SQLite)

**Interfaces:**
- Produces:
  - `type Role = "owner" | "agent"`; `isOwner(user: unknown): boolean`; `isAgent(user: unknown): boolean`.
  - Access helpers: `ownerOnly: Access`, `ownerOrAgent: Access`.
  - `Users`: `auth: { useAPIKey: true }`; field `role` (select owner/agent, required, default `"agent"`, field-level update access owner only); `access.admin = ({ req }) => isOwner(req.user)`; read/create/update/delete owner only except a user reading self. A `beforeChange` hook sets `role: "owner"` when the users collection is empty (first user).
  - `Posts`: create/update `ownerOrAgent`, delete `ownerOnly`; `beforeChange` hook `rejectAgentPublish` throws a 403 `APIError` when `isAgent(req.user)` and the outgoing `_status` is `"published"`.
  - `Media`: create `ownerOrAgent`; update/delete `ownerOnly`; read stays public.
  - `Projects`, `Skills`, `FAQs`, `SiteSettings`: writes `ownerOnly`; reads unchanged (public site reads via the Local API, which bypasses access).

- [ ] **Step 1: Failing unit tests** — `isOwner({ role: "owner" })` true, `isOwner({ role: "agent" })` false, `isOwner(null)` false; `ownerOrAgent` true for both roles, false for no user.
- [ ] **Step 2: Failing integration tests (Review Focus 2)** — with a throwaway SQLite DB and Local API calls using `overrideAccess: false` and `user` set to an agent: agent creates a draft post (succeeds); agent update with `draft: false` / `_status: "published"` rejects with status 403; agent delete post rejects; agent update project, site-settings, or another user rejects; agent upload media succeeds; agent deletes media rejects; owner publishes the agent's draft (succeeds); first user created in an empty DB becomes `owner`.
- [ ] **Step 3:** Run both — FAIL.
- [ ] **Step 4:** Implement roles, access, and the hook.
- [ ] **Step 5:** Back up and push the local SQLite schema as in Task 3; set the existing local user's role to `owner` (one SQL update on the local file); run tests and `npx tsc --noEmit`; `npx payload generate:types` — PASS. Log in to `/admin` as the owner and confirm every collection still edits normally.
- [ ] **Step 6:** Commit `feat: add owner and agent roles with API keys and server-side limits`.

### Task 5: Preview route and Draft Mode on the article page

**Files:**
- Create: `src/lib/preview.ts`
- Create: `src/app/(site)/preview/route.ts` (GET)
- Create: `src/app/(site)/preview/exit/route.ts` (POST)
- Create: `src/components/preview-bar.tsx`
- Modify: `src/collections/Posts.ts` (`admin.preview`)
- Modify: `src/app/(site)/blog/[slug]/page.tsx`
- Modify: `src/lib/copy-defaults.ts`, `src/globals/SiteSettings.ts` (copy fields: `blog.previewBar` "Preview, not published", `blog.previewExit` "Exit preview")
- Test: `tests/lib/preview.test.ts`, `tests/components/preview-bar.test.tsx`

**Interfaces:**
- Consumes: Task 3 `getPost(slug, { draft: true })`; Task 4 `isOwner`.
- Produces:
  - `isValidSlug(slug: unknown): slug is string` — `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
  - `previewTarget(slug: string): string` — `"/blog/" + slug + "/"`.
  - `previewUrl(origin: string, slug: string): string` — `${origin}/preview/?slug=${encodeURIComponent(slug)}`; used by `Posts.admin.preview`.
  - GET `/preview/?slug=`: `payload.auth({ headers })`; responds 401 unless `isOwner(user)`, 400 unless `isValidSlug`, 404 unless `getPost(slug, { draft: true })` exists; otherwise `draftMode().enable()` and redirect 307 to `previewTarget(slug)`.
  - POST `/preview/exit/?slug=`: `draftMode().disable()`, redirect 303 to `previewTarget(slug)` when valid, else `/blog/`.
  - `PreviewBar({ slug, label, exitLabel }: { slug: string; label: string; exitLabel: string })` — fixed bar using `bg-invert text-invert-ink`, with a POST form to `/preview/exit/?slug=`.
  - `/blog/[slug]`: when `(await draftMode()).isEnabled`, reads `getPost(slug, { draft: true })` and renders `PreviewBar`; otherwise behavior unchanged.

- [ ] **Step 1: Failing tests (Review Focus 3)** — `isValidSlug("ai-notes")` true; false for `""`, `"//evil.com"`, `"../x"`, `"A b"`, `"a/b"`, `123`; `previewTarget("ai-notes") === "/blog/ai-notes/"`; `previewUrl("https://haloafan.com", "ai-notes") === "https://haloafan.com/preview/?slug=ai-notes"`; `PreviewBar` renders the label and a `form` with `method="post"` and `action="/preview/exit/?slug=ai-notes"`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement helpers, routes (following the Next draft-mode guide; confirm route handlers in `(site)` do not collide with `(payload)/api/[...slug]` or `trailingSlash: true`), `admin.preview`, the bar, and the page branch.
- [ ] **Step 4:** Run tests, `npx tsc --noEmit` — PASS.
- [ ] **Step 5: Manual check on the dev server (port 3100)** — as owner, create a draft post in `/admin`, click Preview: lands on `/blog/<slug>/` with the bar. In a private window: `/preview/?slug=<slug>` returns 401 and sets no `__prerender_bypass` cookie; `/blog/<slug>/` returns 404. Exit preview returns to the normal page. Record the results.
- [ ] **Step 6:** Commit `feat: preview unpublished posts on the frontend with Draft Mode`.

### Task 6: Markdown renderer for evidence articles

**Files:**
- Create: `src/lib/safe-url.ts`
- Modify: `src/components/markdown.tsx`
- Test: `tests/lib/safe-url.test.ts`, `tests/components/markdown.test.tsx`

**Interfaces:**
- Produces:
  - `safeHref(url: string): string | null` — returns the URL for `https://…`, root-relative `/…` (but not `//…`), and `#…`; returns `null` for everything else, including `http://…`, `javascript:`, and `data:`.
  - `Markdown({ source }: { source: string })` — unchanged signature. Adds: inline links `[text](url)` (external links `target="_blank" rel="noopener noreferrer"`), inline code, unordered and ordered lists (one nesting level), fenced code blocks with an optional language label, images `![alt](src "caption")` rendered as `figure` + `figcaption` with `loading="lazy"` through `MaybeImg`, and `---` as `hr`. A link or image whose URL fails `safeHref` renders its text only.

- [ ] **Step 1: Failing tests (Review Focus 5)** — `safeHref("https://a.com") === "https://a.com"`, `safeHref("/blog/") === "/blog/"`, `safeHref("#x") === "#x"`, `null` for `"javascript:alert(1)"`, `"//evil.com"`, `"data:text/html,x"`, `"http://a.com"`. Markdown: `[Repo](https://github.com/x)` renders an `a` with `rel="noopener noreferrer"`; `[x](javascript:alert(1))` renders `x` and no `href`; `- a\n- b` renders `ul` with two `li`; `1. a\n2. b` renders `ol`; a fenced block with ```` ```ts ```` renders `pre > code` and the label `ts`; an unclosed fence renders the rest of the source inside `pre`; `<script>alert(1)</script>` renders as escaped text; `![Diagram](/img/a.jpg "Flow")` renders `figure`, `img alt="Diagram"`, `figcaption` "Flow"; existing headings, quotes, bold and italic still render as before (keep the current cases passing).
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement. Styling uses existing tokens (`bg-surface-muted`, `border-line`, `font-mono` for code, `t-body-sm`, radius-card) and stays within the 672px article column; code blocks scroll horizontally instead of widening the page.
- [ ] **Step 4:** Run tests, `npx tsc --noEmit` — PASS. Check one long code block at 360px: no horizontal page scroll.
- [ ] **Step 5:** Commit `feat: render links, lists, code, and images in articles`.

### Task 7: Article meta, disclosure, discussion links, and blog copy

**Files:**
- Modify: `src/app/(site)/blog/[slug]/page.tsx`, `src/components/blog-list.tsx`, `src/components/articles.tsx`
- Modify: `src/lib/copy-defaults.ts`, `src/globals/SiteSettings.ts`
- Test: `tests/components/article-meta.test.tsx` (extract the meta row into `src/components/article-meta.tsx` so it renders without a database)

**Interfaces:**
- Consumes: Task 3 `Post`; Task 1 `resolveSocialIcon`, `SOCIAL_LABELS`.
- Produces:
  - `ArticleMeta({ post, copy }: { post: Post; copy: SiteCopy["blog"] })` — tools line `"Tools: Claude, Codex"` only when tools exist; related project links to `/projects/<slug>/` only when they exist; disclosure line only when `post.aiAssisted`.
  - `DiscussionLinks({ items, label }: { items: Post["discussion"]; label: string })` — renders nothing for an empty list.
  - New copy keys with defaults: `blog.toolsLabel` "Tools", `blog.relatedLabel` "Related project", `blog.aiDisclosure` "Written with AI assistance. The ideas, tests, and decisions are mine.", `blog.discussedOn` "Discussed on". Changed defaults: `blog.title` "Notes on web development and AI", `blog.intro` "Experiments, workflows, and lessons from building websites and web apps with AI.", `articles.heading.line2` "notes on web and AI.".
  - Blog cards show the category label (`t-micro text-ink-2`) when present; the category filter uses labels.

- [ ] **Step 1: Failing tests** — meta with tools and one related project renders `Tools: Claude, Codex` and `href="/projects/jejak-puncak/"`; with empty tools and projects renders neither label; `aiAssisted: false` hides the disclosure; `DiscussionLinks` with `[]` renders `""`, with a Threads item renders `href` of that URL and `aria-label` containing "Threads".
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement and wire into the page and cards; add the copy fields with the placeholder pattern.
- [ ] **Step 4:** Run tests, `npx tsc --noEmit`, `npx payload generate:types` — PASS. Screenshot one sample post (owner-created draft in preview) at 1440 and 390.
- [ ] **Step 5:** Commit `feat: show tools, related projects, AI disclosure, and discussion links on articles`.

### Task 8: Related notes on project pages

**Files:**
- Create: `src/components/related-notes.tsx`
- Modify: `src/app/(site)/projects/[slug]/page.tsx`, `src/lib/copy-defaults.ts`, `src/globals/SiteSettings.ts` (`project.relatedNotesHeading` "Related notes")
- Test: `tests/components/related-notes.test.tsx`

**Interfaces:**
- Consumes: Task 3 `getPostsForProject`.
- Produces: `RelatedNotes({ posts, heading }: { posts: Post[]; heading: string })` — returns `null` for `[]`; otherwise a heading and up to 3 links to `/blog/<slug>/` with title and date, placed before "More Projects".

- [ ] **Step 1: Failing tests** — `[]` renders `""`; two posts render two `href="/blog/<slug>/"` links and the heading; four posts render three.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement and wire in.
- [ ] **Step 4:** Run tests, `npx tsc --noEmit` — PASS. With no posts, project-page DOM (without `<script>`) at 1440 is identical to before.
- [ ] **Step 5:** Commit `feat: list related notes on project pages`.

### Task 9: Postgres migration for all schema changes

**Files:**
- Create: `src/migrations/<timestamp>_ai_notes.ts` and `.json` (generated), plus the updated `src/migrations/index.ts`

**Interfaces:**
- Consumes: the final schema from Tasks 1, 3, 4, 5, 7, 8.

- [ ] **Step 1:** Generate against the Neon `dev` branch (connection string in `.env.deploy` as `MIGRATION_DATABASE_URI`, never printed): run `npx payload migrate:create ai-notes` with `DATABASE_URI` set from that variable for the command only.
- [ ] **Step 2:** Read the generated SQL. It must not drop tables or columns other than `posts.date` (production `posts` is empty). Add a data step that sets `role = 'owner'` for every existing user, so the production owner is not demoted to the default `agent`.
- [ ] **Step 3:** Run `npx payload migrate` against the `dev` branch; then `npx payload migrate:status` shows no pending migrations.
- [ ] **Step 4:** `npm run build` with the normal local env — PASS; full `npx vitest run`, `npx tsc --noEmit`, `npm run lint` — PASS.
- [ ] **Step 5:** Commit `feat: migrate Postgres for posts drafts, roles, and new copy fields`.

### Task 10: Content workflow, tone guide, and skills

**Files:**
- Create: `docs/content/TONE.md`, `docs/content/workflow.md`, `docs/content/drafts/.gitkeep`
- Modify: `AGENTS.md`, `README.md`

- [ ] **Step 1:** Evaluate and install globally (`npx skills add <pkg> -g -y`) only if install count >= 1K, security audits pass or warnings are understood, and the SKILL.md has no network or destructive scripts: `coreyhaines31/marketingskills@social`; from `social-media-skills/skills`: `threads-post`, `linkedin-post-writer`, `short-form-video-script`, `content-recycling`. Report each decision.
- [ ] **Step 2:** Build `docs/content/TONE.md` with `copywriting-tone-of-voice-creator` (ask the owner its questions): base voice, then channel sections for site (simple English, every paragraph explainable in an interview), LinkedIn (professional Indonesian), Threads (casual Indonesian), short video script (Indonesian).
- [ ] **Step 3:** Write `docs/content/workflow.md`: Threads post → site article within 1-2 weeks → LinkedIn post → video script; the evidence checklist (what was tried, result, failure, prompt/spec excerpt, repo or commit link, screenshot, test numbers, the AI mistake caught); the disclosure rule; which skills run at each step; and the agent draft procedure: REST `POST /api/posts?draft=true` and `PATCH /api/posts/:id?draft=true` with header `Authorization: users API-Key <key>` (confirm the exact format in Payload 3.93 docs), field list, image upload to `/api/media` first, and "never publish". Include how the owner previews (admin Preview button) and publishes.
- [ ] **Step 4:** Update `AGENTS.md` (draft-only rule for agents, migration rule) and `README.md` (content model: posts fields, roles, preview).
- [ ] **Step 5:** Commit `docs: add the content workflow, tone guide, and agent draft procedure`.

### Task 11: Production rollout and the first draft

- [ ] **Step 1:** Push to `main` (OWNER confirms). Vercel deploys; `prodMigrations` applies the migration. Verify the production owner still logs in and has full access.
- [ ] **Step 2: OWNER** — in `/admin` → Users → create user `agent` (email the owner chooses, role `agent`), enable API Key, generate it, and type it into `.env.deploy` as `PAYLOAD_AGENT_API_KEY`. Do not paste it into chat.
- [ ] **Step 3:** Production checks: with the agent key, create a draft test post via REST → succeeds; try to publish it → 403; try DELETE → 403; anonymous `/blog/<slug>/` → 404; owner Preview shows it with the bar; owner deletes the test post.
- [ ] **Step 4:** Draft the first article as the agent: an AI Workflow case study on building this portfolio with coding agents, following `docs/content/workflow.md` and `TONE.md` (drafted in `docs/content/drafts/` first, then sent to the admin as a draft with `relatedProjects` empty and `aiAssisted: true`). Stop and ask the owner to preview it. The owner publishes.
- [ ] **Step 5:** Report every check with its result, plus `npm run lint`, vitest, tsc, and build status.
