# AI notes in the blog — design

Date: 2026-11-24
Status: draft for owner approval

## Intent

The owner explores AI and developer tooling (new models, tools, agent skills,
experiments) and shares it on Threads, later LinkedIn and short video. The
portfolio should carry the proof behind that activity: evidence that he
understands AI, can build AI features into products correctly, and runs an
AI-assisted development workflow properly rather than shipping unchecked
"vibe coding".

Readers are the portfolio's readers: recruiters and clients, local first,
international-ready. They are not looking for AI news. They want to answer
"can this person actually do it?".

## Goals

1. Long-form articles on the site that show method and evidence: what was
   tried, results, what failed, prompts or specs, repo/commit links,
   screenshots, test numbers, and mistakes the AI made that he caught.
2. Articles can link to related projects, and project pages list the articles
   that reference them.
3. The existing blog becomes the single home for all writing (AI and
   WordPress), filtered by category.
4. A documented content workflow and tone guide so the owner can turn a
   Threads post into a site article, a LinkedIn post, and a video script with
   AI help, without losing his own voice.
5. AI drafts articles directly in the production admin as unpublished drafts;
   the owner previews them on the real frontend and is the only one who can
   publish.

## Non-goals

- No AI news feed, model-release roundups, or hype posts.
- No multi-language site. Site articles are English only.
- No comments, newsletter, or auto-posting to social platforms.
- No embedded third-party social widgets or video hosting on the site.
- No new top-level nav item or nav geometry change.

## Anti-goals (failure even if it works)

- The section reads like generic AI hype, or claims without evidence.
- Published English prose the owner cannot explain in an interview.
- A visibly empty or stale section.
- Any regression of the existing visual system (design.md) or layout geometry.
- A draft visible to the public (pages, sitemap, OG), or an AI agent able to
  publish, delete, or touch anything outside draft posts and article images.

## Decisions made by the owner

- Content flow B: Threads first, as now. Experiments that matter are expanded
  into a site article within 1-2 weeks; LinkedIn and video are cut from it.
- The owner owns the ideas, content, and evidence; AI drafts and edits the
  copy; the owner reviews before publishing. Articles disclose AI assistance.
- Languages: site articles in simple English; Threads in casual Indonesian;
  LinkedIn in professional Indonesian; video in Indonesian. Drafts start in
  Indonesian.
- Placement: approach A plus the linking strength of C (see Approaches).
- The four old WordPress articles are abandoned (the CMS is offline and no
  backup exists). The blog starts from zero; their legacy URLs keep
  redirecting to `/blog/`.
- Publishing flow: an AI agent writes the article into the production admin as
  a draft. The owner reviews it in the admin and through a frontend preview
  link that renders the unpublished draft, then publishes it himself.

## Approaches

| | Approach | Trade-off | Outcome |
|---|---|---|---|
| A | Existing blog holds everything, by category | Least work, nav unchanged, home section goes live with existing + migrated posts; AI and WordPress posts share a list (category filter already exists) | **Chosen** |
| B | New `/lab` collection with structured experiment fields | Strongest positioning signal; most work, nav geometry change, two streams to keep alive, looks empty with 1-2 entries under flow B | Rejected for now; A can grow into B later |
| C | Build logs attached to project pages | Evidence sits next to the work; no home for tool/model explorations unrelated to a project | Folded into A as post <-> project links |

## Design

### Data model: `posts` (extend, do not replace)

Production `posts` is empty, so field type changes are safe. Every schema
change ships with a Postgres migration (`payload migrate:create` against the
Neon dev branch, committed; production applies it through `prodMigrations`).

| Field | Change | Notes |
|---|---|---|
| `title`, `slug`, `description`, `image`, `body` | keep | `body` stays a Markdown textarea: AI drafts are Markdown |
| `category` | text -> select | `ai-workflow` "AI Workflow", `ai-in-products` "AI in Products", `experiments` "Experiments", `wordpress` "WordPress" |
| `publishedAt` | new, date, required | replaces the free-text `date`; display format stays "Mar 6, 2025"; sorting by real date |
| `date` | remove | after `publishedAt` exists |
| `tools` | new, text hasMany | e.g. Claude, Codex, Gemini |
| `relatedProjects` | new, relationship -> projects, hasMany | drives the project-page list |
| `discussion` | new, array `{ platform, url }` | platform select from the social registry, plus `tiktok` and `youtube` icons |
| `aiAssisted` | new, checkbox, default true | renders the disclosure line |

Collection settings:

- `versions: { drafts: true }` on `posts` only. This reverses the v1 "no
  drafts" rule from the rebrand spec for posts; other collections keep it.
- `revalidateSite()` runs only when a post is published, unpublished, or a
  published post changes; saving a draft does not touch the public cache.
- Every public read of posts returns published documents only: `getPosts`,
  `getPost`, the home section, `/blog`, `/blog/[slug]`, related notes on
  project pages, `sitemap.ts`, and metadata/OG. Drafts never leak.

### Drafts, preview, and the AI agent account

- Preview: `posts` gets an admin `preview` URL pointing to a route handler
  (e.g. `/api/preview?slug=...`). The handler verifies the request carries a
  logged-in Payload admin session (the owner's cookie on the same domain) and
  that the slug exists, enables Next.js Draft Mode, and redirects to
  `/blog/<slug>/`. No shared secret. With Draft Mode on, `/blog/[slug]` reads
  the latest draft and shows a visible "Preview, not published" bar with an
  exit action (POST) that disables Draft Mode. Follow
  `node_modules/next/dist/docs/01-app/02-guides/draft-mode.md`.
- Live Preview inside the admin is out of scope for now; the Preview button is
  enough.
- Roles: `users` gets a `role` select (`owner`, `agent`). Existing users become
  `owner`. `useAPIKey: true` on `users`.
- `agent` access: create and update `posts` only while they stay drafts,
  read posts and projects (for `relatedProjects`), and create `media` (images
  for articles). An `agent` cannot publish, unpublish, delete, change users,
  site settings, projects, skills, or FAQs. Enforced on the server (access
  control plus a hook that rejects `_status: "published"` from an agent), not
  only hidden in the UI.
- The agent API key lives only on the owner's machine (`.env.deploy`
  or the agent's own secret store), never in the repo. The owner can revoke it
  in the admin at any time.
- `docs/content/workflow.md` documents how an agent creates or updates a draft
  over the REST API (endpoint, auth header format, fields, image upload), how
  the owner previews, and how he publishes.

### Article rendering

Extend the existing `Markdown` component to the subset evidence posts need,
keeping it dependency-free:

- links (relative and `https://` only; external links open in a new tab with
  `rel="noopener noreferrer"`; anything else renders as text)
- unordered and ordered lists (one nesting level)
- fenced code blocks with an optional language label, and inline code
- images `![alt](src "caption")` with a visible caption, lazy-loaded, using
  the same frame rules as project images
- horizontal rule

React escaping stays the only HTML path; no raw HTML in Markdown.

### Pages

- `/blog`: copy reframed to web development and AI; category filter uses the
  select labels; cards show the category.
- `/blog/[slug]`: meta row (date, tools, related project links), the AI
  disclosure line when `aiAssisted`, the body, and "Discussed on" links.
  Per-page metadata already exists.
- Home "From my blog": heading copy updated; still renders only with >= 3 posts.
- `/projects/[slug]`: a "Related notes" list of posts whose `relatedProjects`
  includes the project; hidden when empty.
- All new copy lives in `src/lib/copy-defaults.ts` (placeholder pattern).

Sketch of an article page:

```
Blog / AI Workflow / Building my portfolio with coding agents
[title]                         Nov 2026 · By Afan Affaidin
[1-2 sentence summary]
Tools: Claude, Codex · Related project: Portfolio
Written with AI assistance; the ideas, tests, and decisions are mine.
──────────────────────────────────
## The problem      paragraphs, links, lists
## What I tried     code block / prompt excerpt
## What the AI got wrong   screenshot + caption
## Result           test counts, commit/repo links
──────────────────────────────────
Discussed on: Threads · LinkedIn
```

### Launch content

- The blog starts empty. The home "From my blog" section stays hidden until
  three posts are published, as it does today.
- The first article is an AI Workflow case study about building this
  portfolio with coding agents (specs and plans in `docs/superpowers/`, hard
  rules and checkpoints, tests per commit, AI mistakes caught during the
  build). It goes through the new draft and preview flow as its first real use.
- `LEGACY_POSTS` redirects stay pointed at `/blog/`.

### Content workflow and tone (docs, not code)

- `docs/content/TONE.md`, built with `copywriting-tone-of-voice-creator`: one
  base voice with channel adaptations for the site (simple English), LinkedIn
  (professional Indonesian), Threads (casual Indonesian), and video scripts.
- `docs/content/workflow.md`: the Threads -> site -> LinkedIn -> video steps,
  the evidence checklist, the "explain every paragraph" rule, the disclosure
  rule, and the prompts and skills used at each step.
- Skills to evaluate and install after approval: `coreyhaines31/marketingskills@social`;
  from `social-media-skills/skills`: `threads-post`, `linkedin-post-writer`,
  `short-form-video-script`, `content-recycling`. Existing: `copywriting`,
  `copy-editing`, `humanizer`, `antislop-copywriting`,
  `portfolio-case-study-writer`.

## Constraints

- Next.js 16.4.6, Payload 3.93, production live on Vercel + Neon + R2 at
  haloafan.com. Read `node_modules/next/dist/docs` before touching Next APIs.
- Every commit passes `npx vitest run`, `npx tsc --noEmit`, `npm run lint`;
  `npm run build` succeeds.
- Layout geometry and the visual system in design.md do not regress.
- No new dependencies unless the agreed Markdown subset cannot be met.
- Port 3000 belongs to another app on the owner's machine; dev uses 3100.

## Calls made in the design (owner may override)

- Category set and labels; `discussion` adds TikTok and YouTube icons.
- `aiAssisted` defaults to true.
- Related notes on project pages are hidden when empty.
- Article JSON-LD left to the builder.
- The Preview button rather than Payload Live Preview.
- Agent role scope as listed above, enforced server-side.
- The `wordpress` category stays available for future WordPress writing.

## Left to the builder

- Markdown parser internals and the code-block styling within design.md tokens.
- Card and meta-row layout details, within the existing type scale.
- Whether to add Article JSON-LD to post pages.
