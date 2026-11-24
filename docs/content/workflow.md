# Content workflow and agent draft procedure

This guide defines how experiments and build notes move from a quick Indonesian post on Threads to an evidence-backed English article on `haloafan.com/blog`, then into LinkedIn posts and short video scripts — including the exact REST API procedure for AI agents saving drafts into Payload CMS.

Read [`docs/content/TONE.md`](TONE.md) before drafting for any channel.

---

## 1. End-to-end content flow (Flow B)

Experiments start small and earn long-form space only when they produce real proof.

```text
1. Threads (casual Indonesian)
   Live build note / debugging curhat while working on a real task.
        │
        ▼  (within 1–2 weeks, if the experiment produced real evidence)
2. Site article at haloafan.com/blog (simple English)
   Stage locally in docs/content/drafts/ (Indonesian notes optional first) →
   edit into simple English → agent uploads media & saves as CMS draft →
   owner previews on the live frontend → owner publishes manually.
        │
        ├──▶ 3. LinkedIn post (professional Indonesian, "saya")
        │       Peer-to-peer reflection + takeaway, linking to the article.
        │
        └──▶ 4. Short video script (casual Indonesian, "aku/kalian")
                30–60s TikTok / Reels / Shorts script backed by screen evidence.
        │
        ▼  (later, when revisited or updated)
5. Optional evergreen refresh (content-recycling)
   Refresh the angle with new findings or updated tools — never an identical repost.
```

---

## 2. Evidence checklist (required before drafting a site article)

Do not start drafting a long-form article until you have concrete material for every applicable item below. No claims, numbers, or outcomes may be invented.

- [ ] **What was tried:** the real task, goal, tool/model setup, and constraints.
- [ ] **Result:** what actually happened when you ran or tested it.
- [ ] **Failure / what did not work:** dead ends, edge cases, or trade-offs that stayed unresolved.
- [ ] **Prompt or spec excerpt:** the actual prompt, rule, or specification slice used.
- [ ] **Repo or commit link:** public GitHub URL or commit link if the repo is public (if private, state that plainly without leaking client code).
- [ ] **Screenshot:** clear visual proof, **redacted before upload** — no API keys, tokens, session cookies, `.env` / `.env.deploy`, private URLs, or client data.
- [ ] **Test numbers:** exact command results (`npx vitest run`, `npx tsc --noEmit`, `npm run lint`, or measured runs) actually executed.
- [ ] **The AI mistake caught and how it was fixed:** at least one concrete bug, hallucination, or gap produced by the AI that you caught during review or testing.

---

## 3. Core editorial rules

### Explain-every-paragraph rule (interview test)

Before publishing any English article on `haloafan.com/blog`, read every paragraph aloud or mentally rehearse it as an interview answer. If Afan cannot explain a sentence, technical claim, or vocabulary choice naturally in an interview without looking it up, rewrite that paragraph in simpler English or remove it.

### AI disclosure rule

Afan owns the ideas, experiments, tests, and engineering decisions; AI tools assist with drafting and editing prose.

- Keep `aiAssisted: true` (the default on `posts`) on every article drafted or edited with AI help. The site automatically renders:
  > *"Written with AI assistance. The ideas, tests, and decisions are mine."*
  (Defined in `src/lib/copy-defaults.ts` under `blog.aiDisclosure`.)
- Set `aiAssisted: false` only when an article was written entirely without AI assistance.

### Hard guardrails (also enforced in `TONE.md`)

- Never disparage clients, employers, or coworkers, and never expose client data.
- Never publish politics or SARA.
- Never include metrics, benchmarks, or claims that were not personally tested or sourced in `docs/content/copy-draft.md`.
- Never upload screenshots or snippets that expose API keys, tokens, `.env`, or `.env.deploy`.

---

## 4. Skills mapped to each step

Load `docs/content/TONE.md` alongside the channel skills below so voice stays consistent while tone modulates per channel.

| Step | Language & register | Skills to use |
| --- | --- | --- |
| Voice & tone baseline | All channels | `docs/content/TONE.md` (`copywriting-tone-of-voice-creator`) |
| 1. Threads post | Casual Indonesian (`aku/kalian`, `<= 500` chars) | `threads-post`, `social`, `bahasa-indonesia` |
| 2. Site article | Simple English (`I`, interview-explainable) | `portfolio-case-study-writer`, `copywriting`, `copy-editing`, `humanizer`, `antislop-copywriting` |
| 3. LinkedIn post | Peer-professional Indonesian (`saya`) | `linkedin-post-writer`, `social`, `bahasa-indonesia` |
| 4. Short video script | Casual Indonesian (`aku/kalian`, 30–60s) | `short-form-video-script`, `social`, `bahasa-indonesia` |
| 5. Evergreen refresh | Per target channel | `content-recycling` |

---

## 5. Local draft staging convention

Draft articles locally in `docs/content/drafts/` before sending them to the CMS:

1. Optional Indonesian working draft (to think through the evidence and structure clearly): `docs/content/drafts/<slug>.id.md`.
2. English article draft (matching the Markdown subset below): `docs/content/drafts/<slug>.md`.
3. Run through the Evidence Checklist, `TONE.md`, `copy-editing`, `humanizer`, and `antislop-copywriting`.
4. Push the finalized draft to Payload CMS using the agent draft procedure below, then stop and ask the owner to preview and publish.

Keep working draft files free of secrets and client data.

---

## 6. Agent draft procedure (Payload 3.93 REST API)

### Hard rule: NEVER publish

AI agents authenticate as a `users` account with `role: "agent"`. Server-side access control and hooks (`src/collections/Posts.ts`, `src/collections/Users.ts`, `src/collections/Media.ts`) enforce these boundaries with HTTP **403**:

- **Allowed:** read `posts` and `projects`, create `media`, create `posts` with `?draft=true` (`_status: "draft"`), update `posts` with `?draft=true` (`_status: "draft"`).
- **Blocked (403):** publishing (`_status: "published"`), unpublishing, saving a post without `?draft=true`, deleting posts/media, or modifying `users`, `site-settings`, `projects`, `skills`, or `faqs`.

Even if an agent tries to omit `?draft=true` or set `_status: "published"`, the server rejects the request. Agents must still never attempt to publish.

### Authentication header and key storage

- **Header format** (Payload 3.93 `APIKeyAuthentication` strategy in `node_modules/payload/dist/auth/strategies/apiKey.js`):
  ```http
  Authorization: users API-Key <PAYLOAD_AGENT_API_KEY>
  ```
- **Where the key lives:** `PAYLOAD_AGENT_API_KEY` in the owner's local `.env.deploy` file.
  - `.env.deploy` is gitignored by `.env.*` and is **never** auto-loaded by Next.js during `npm run build` or `npm run dev`.
  - Never commit `.env.deploy`, never echo `PAYLOAD_AGENT_API_KEY` to stdout/logs, and never paste it into chat.
  - Load it explicitly per command, for example:
    ```bash
    node --env-file=.env.deploy scripts/...
    ```
    or by referencing `process.env.PAYLOAD_AGENT_API_KEY` inside a one-off `node --env-file=.env.deploy -e "..."` command.

### Step A — Query `projects` for `relatedProjects` (optional)

If the article references portfolio projects, fetch their numeric IDs first:

```bash
node --env-file=.env.deploy -e '
const origin = process.env.NEXT_PUBLIC_SERVER_URL || "https://haloafan.com";
const res = await fetch(`${origin}/api/projects?limit=100`, {
  headers: { Authorization: `users API-Key ${process.env.PAYLOAD_AGENT_API_KEY}` },
});
const data = await res.json();
console.log(data.docs.map((p) => ({ id: p.id, slug: p.slug, name: p.name })));
'
```

### Step B — Upload article images to `/api/media` first

Always upload screenshots or cover images **before** creating or updating the post so you have the `media` ID (for the post's `image` field) and public R2 URL (for Markdown inline figures). Redact all secrets and client data before uploading.

`POST <origin>/api/media` uses `multipart/form-data` with:
- `file`: the image file
- `_payload`: JSON string with required `alt` and optional `caption` (`{"alt":"...","caption":"..."}`)

```bash
node --env-file=.env.deploy -e '
import fs from "node:fs";
const origin = process.env.NEXT_PUBLIC_SERVER_URL || "https://haloafan.com";
const form = new FormData();
const bytes = fs.readFileSync("path/to/redacted-screenshot.png");
form.append("file", new Blob([bytes], { type: "image/png" }), "redacted-screenshot.png");
form.append("_payload", JSON.stringify({ alt: "Describe what the screenshot shows" }));

const res = await fetch(`${origin}/api/media`, {
  method: "POST",
  headers: { Authorization: `users API-Key ${process.env.PAYLOAD_AGENT_API_KEY}` },
  body: form,
});
const data = await res.json();
console.log({ status: res.status, id: data.doc?.id, url: data.doc?.url });
'
```

Use `data.doc.id` for the post's `image` field, and `data.doc.url` inside Markdown body images (`![alt](https://... "caption")`).

### Step C — Create a draft post (`POST /api/posts?draft=true`)

Always include `?draft=true` in the URL and `"_status": "draft"` in the JSON body.

```bash
node --env-file=.env.deploy -e '
const origin = process.env.NEXT_PUBLIC_SERVER_URL || "https://haloafan.com";
const payload = {
  title: "Building my portfolio with coding agents",
  slug: "building-my-portfolio-with-coding-agents",
  description: "How I used specs, plans, and tests to keep coding agents in check while rebuilding haloafan.com.",
  category: "ai-workflow",
  publishedAt: "2026-11-24T00:00:00.000Z",
  // image: 12,
  body: "## The problem\n\n...",
  tools: ["Claude", "Codex"],
  relatedProjects: [],
  discussion: [
    // { platform: "threads", url: "https://www.threads.com/@afanaffaidin/post/..." },
  ],
  aiAssisted: true,
  _status: "draft",
};

const res = await fetch(`${origin}/api/posts?draft=true`, {
  method: "POST",
  headers: {
    Authorization: `users API-Key ${process.env.PAYLOAD_AGENT_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
const data = await res.json();
console.log({ status: res.status, id: data.doc?.id, slug: data.doc?.slug, _status: data.doc?._status });
'
```

### Step D — Update an existing draft (`PATCH /api/posts/:id?draft=true`)

To revise an existing draft without creating a duplicate, send `PATCH` with `?draft=true` and `"_status": "draft"`:

```bash
node --env-file=.env.deploy -e '
const origin = process.env.NEXT_PUBLIC_SERVER_URL || "https://haloafan.com";
const postId = 42;
const res = await fetch(`${origin}/api/posts/${postId}?draft=true`, {
  method: "PATCH",
  headers: {
    Authorization: `users API-Key ${process.env.PAYLOAD_AGENT_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    body: "## The problem\n\nUpdated draft body...",
    _status: "draft",
  }),
});
const data = await res.json();
console.log({ status: res.status, id: data.doc?.id, _status: data.doc?._status });
'
```

### Exact `posts` field reference (`src/collections/Posts.ts`)

| Field | Type | Required | Rules / allowed values |
| --- | --- | --- | --- |
| `title` | `string` | Yes | Sentence case article title |
| `slug` | `string` | Yes | Unique, lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) |
| `description` | `string` | No (recommended) | 1–2 sentence summary shown on cards, article header, and meta description |
| `category` | `select` | Yes | One of: `"ai-workflow"` (`AI Workflow`), `"ai-in-products"` (`AI in Products`), `"experiments"` (`Experiments`), `"wordpress"` (`WordPress`) |
| `publishedAt` | `date` (ISO) | Yes | ISO 8601 date string, e.g. `"2026-11-24T00:00:00.000Z"`; rendered in UTC as `"Nov 24, 2026"` |
| `image` | `media` ID | No | Numeric ID returned by `POST /api/media` |
| `body` | `string` (Markdown) | No (recommended) | Plain Markdown following the supported subset below |
| `tools` | `string[]` | No | Tool names used in the experiment, e.g. `["Claude", "Codex", "Vitest"]` |
| `relatedProjects` | `projects` IDs (`number[]`) | No | Numeric IDs from `GET /api/projects`; shows the post under "Related notes" on those project pages once published |
| `discussion` | `{ platform, url }[]` | No | `platform` must be one of `x`, `github`, `linkedin`, `instagram`, `threads`, `dribbble`, `behance`, `tiktok`, `youtube`; `url` must start with `https://` |
| `aiAssisted` | `boolean` | No (default `true`) | Renders the AI disclosure line when `true` |
| `_status` | `"draft"` | Required for agents | Agents must always send `"draft"` along with `?draft=true` |

### Supported Markdown subset (`src/components/markdown.tsx`)

The site uses a dependency-free Markdown renderer with React escaping (no raw HTML):

- **Headings:** `## Heading` and `### Subheading` (`#` lines are ignored so the article title remains the single `<h1>`).
- **Paragraphs & quotes:** standard paragraphs and `>` blockquotes.
- **Lists:** unordered (`- ` or `* `) and ordered (`1. `), up to one level of indentation nesting.
- **Code:** fenced blocks (` ```ts ... ``` `) with an optional language label, and inline code (`` `code` ``).
- **Links:** `[label](url)` — relative paths (`/projects/jejak-puncak/`) and `https://` URLs only. External links automatically open in a new tab with `rel="noopener noreferrer"`; unsupported schemes render as plain text.
- **Emphasis:** `**bold**` and `*italic*`.
- **Captioned images:** standalone line `![alt text](https://media.haloafan.com/... "Optional visible caption")`, lazy-loaded in the standard rounded frame.
- **Horizontal rule:** `---`.
- **Not supported:** raw HTML and Markdown tables (use bullet lists or short paragraphs instead).

---

## 7. Owner preview and publish workflow

Only an `owner` user can log into `/admin`, preview drafts, and publish.

1. Open `<origin>/admin` and sign in with the `owner` account.
2. Go to **Posts** and open the draft created by the agent.
3. Check the fields (`title`, `slug`, `category`, `publishedAt`, `tools`, `relatedProjects`, `discussion`, `aiAssisted`), screenshots, and every paragraph against the interview rule.
4. Click **Preview** in the admin toolbar:
   - Opens `/preview/?slug=<slug>`.
   - The route verifies your logged-in `owner` session cookie, enables Next.js Draft Mode, and redirects to `/blog/<slug>/`.
   - The article renders with a visible **"Preview, not published"** bar and an **Exit preview** button (which submits `POST /preview/exit/?slug=<slug>` to disable Draft Mode).
   - Unauthenticated visitors still get 404 on unpublished drafts; drafts never appear on `/`, `/blog`, project pages, `/sitemap.xml`, or OG metadata.
5. Make any final edits in `/admin` (or ask the agent to patch the draft via `PATCH /api/posts/:id?draft=true`).
6. When ready, click **Publish Changes** in `/admin`.
   - Publishing triggers `revalidateSite()`, refreshing `/`, `/blog`, `/blog/<slug>/`, related project pages, and the sitemap immediately.
7. After publishing, cut the Indonesian LinkedIn post and short video script from the published article, and optionally add their URLs to the post's `discussion` array.
