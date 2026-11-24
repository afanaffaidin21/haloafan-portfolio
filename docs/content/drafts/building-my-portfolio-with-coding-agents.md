## Why I set rules before letting agents write code

I rebuilt my portfolio at [haloafan.com](https://haloafan.com/) with Next.js 16, Payload CMS 3.93, Neon Postgres, and Cloudflare R2. The whole repository is public on [GitHub](https://github.com/afanaffaidin21/haloafan-portfolio).

I wanted coding agents to help me move faster, but I did not want unchecked code sitting in production. Early on, I noticed a clear pattern whenever I gave an agent a vague prompt. The code looked neat at first glance, compiled on the first try, and quietly broke an edge case two steps later.

So I treated the agents like junior teammates who need clear specs, small tasks, and code review before anything merges. Every feature went through the same loop: write a design spec, break it into one-commit tasks, run tests before and after each change, and review the diff before moving to the next task.

## How the workflow was structured

All design specs and implementation plans live inside `docs/superpowers/` in the repository. Across the rebuild, I wrote four specs and four plans covering dark mode, the Payload CMS migration, the admin theme, and the AI notes blog feature.

Each plan lists hard rules at the top and a short list of failure cases to test. Here is the exact review checklist I wrote for the blog and agent-draft feature in `docs/superpowers/plans/2026-11-24-ai-notes-blog.md`:

```text
1. Anonymous visitor requests /blog/<draft-slug>/: expect 404,
   and the draft absent from /blog, home, sitemap, and metadata.
2. Agent API key calls REST with _status: "published", without
   ?draft=true, or tries DELETE, or writes to projects/users:
   expect 403 and no change.
3. /preview/?slug= without an owner session, with an unknown slug,
   or with slug=//evil.com or ../x: expect no Draft Mode cookie
   and no redirect off-site.
4. A published post gets a new draft saved: the public page still
   shows the published version until the owner publishes.
5. Markdown with javascript: links, an unclosed code fence, or
   literal <script>: links render as plain text, the fence renders
   to the end as code, the tag renders escaped.
```

I also kept a project rules file (`AGENTS.md`) that every agent reads before editing anything. It records real traps from my machine and stack, such as keeping port 3000 untouched because another local app uses it, backing up the local SQLite database before any schema push, and never letting static text defaults trigger Drizzle table rebuilds.

For the blog feature itself, I ran ten small tasks in order, one commit per task. A fresh agent implemented each task using test-driven development, and a separate read-only reviewer checked the git diff against the spec before I moved on.

## The bug an AI reviewer caught in AI code

The most useful moment in this build happened during Task 4, when I added `owner` and `agent` roles with Payload API keys ([commit 3db3e7a](https://github.com/afanaffaidin21/haloafan-portfolio/commit/3db3e7a2c77a73394fbecf41b2f15efc9b8fe497)).

The rule was simple: an AI agent account should be able to create and update draft posts and upload article images, and nothing else. It must never publish a post, unpublish a live post, delete records, or edit projects and site settings.

The first implementation looked solid and passed all of its unit and integration tests. It blocked `_status: "published"` and blocked non-draft edits whenever `originalDoc._status` was `"published"`.

Then the independent task reviewer traced Payload 3.93's internal `updateByID` flow and found a two-step unpublish bypass:

1. An agent sends `PATCH /api/posts/:id/?draft=true` on a live published post. That creates a new draft version in `_posts_v` while the live row stays published.
2. Next, the agent sends `PATCH /api/posts/:id/` without `?draft=true` and without `_status: "published"`.
3. Because Payload loads the latest version from `_posts_v` as `originalDoc`, the hook saw `originalDoc._status === "draft"` instead of `"published"` and allowed the write straight onto the live `posts` table, unpublishing the post.

I would not have spotted that just by glancing at the first diff, because the happy-path tests were green. Fixing it took two tight checks in `src/collections/Posts.ts`:

```ts
// Require draft: true on every agent create, update, or restoreVersion
if (isAgent(req.user) && !isDraftSave) {
  throw new APIError("Agents may only save draft posts.", 403);
}
```

We added that guard in `beforeOperation`, rejected `!isDraftSave` unconditionally for agents in `beforeChange`, and wrote regression tests in `tests/payload/agent-access.test.ts` that replay the exact two-step attack against a real throwaway SQLite database.

## The local build surprise I hit in Task 9

Not every mistake came from application logic. After writing the Postgres migration in Task 9 ([commit e4465b4](https://github.com/afanaffaidin21/haloafan-portfolio/commit/e4465b411ed711b7dc7f9348ac62c8a4456b16d4)) and testing it on the Neon `dev` branch, I ran `npm run build` locally to verify the Next.js production bundle.

Because `next build` runs with `NODE_ENV=production`, Next.js automatically loaded `.env.production.local`. That file held my production `DATABASE_URI`, and Payload's `prodMigrations` setting ran the new migration against production Postgres right during the local build.

Nothing broke because the migration SQL had already been audited and tested on `dev`. It backed up existing users to `role = 'owner'` before enforcing `NOT NULL`, and the only dropped column was the unused `posts.date` column on an empty table. Even so, a local build should never touch a production database.

To make sure that cannot happen again, I renamed `.env.production.local` to `.env.deploy` (still gitignored, but never auto-loaded by Next.js), documented explicit per-command loading, and made `DATABASE_URI=file:./payload.db` the standard command for local `npm run build` runs.

## What actually shipped and passed

Every commit in the blog and agent-draft rollout had to pass the full test suite, strict TypeScript checking, and ESLint before moving on. At the end of the build:

- `npx vitest run` passed with 40 test files and 227 tests, including real SQLite integration tests for draft isolation and agent role limits.
- `npx tsc --noEmit` and `npm run lint` both passed with zero errors.
- `npm run build` compiled and generated all 19 routes cleanly against local SQLite.
- `npx payload migrate:status` on production Postgres confirmed both migrations applied with zero pending changes.

After deploying to Vercel and creating the `agent` user in `/admin`, I ran live REST checks against `https://haloafan.com` using the agent API key:

- `POST /api/posts/?draft=true` returned `201` with `_status: "draft"`.
- `PATCH` attempts to publish (with or without `?draft=true`) and non-draft `PATCH` updates returned `403`.
- `DELETE` on posts and writes to `projects`, `site-settings`, and `users` all returned `403`.
- Anonymous requests to `/blog/<draft-slug>/` returned `404`, and the draft stayed absent from `/blog/` and `/sitemap.xml`.
- Requests to `/preview/?slug=` without an owner session returned `401` and set no Draft Mode cookie.

---

## Where this leaves the workflow

This article itself is the first real test of the flow. It was drafted locally in `docs/content/drafts/`, sent to Payload CMS by the agent account with `?draft=true`, previewed through Next.js Draft Mode ([commit c1e3e83](https://github.com/afanaffaidin21/haloafan-portfolio/commit/c1e3e83b1079172304c9389ebf80133f94faba7a)), and left unpublished until I review every paragraph myself.

Using coding agents saved real time on boilerplate, view mappers, and test scaffolding. The parts that kept the site safe were still the boring ones: written specs, real database tests, a second pair of eyes on every diff, and hard server-side rules so an agent can never publish on its own.
