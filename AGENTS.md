<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

- Verify with `npm run lint`, `npx vitest run`, and `npx tsc --noEmit`.
- Local SQLite schema changes are pushed by drizzle on the first request under
  `npm run dev`. Back up `payload.db` first (`payload.db-*` is gitignored).
- Site copy lives in `src/lib/copy-defaults.ts`; edit it there. The Site
  Settings copy fields are overrides only: no `defaultValue`, the repo text
  as `admin.placeholder`, and `fillCopy` in `src/lib/content.ts` as the single
  fallback. Clearing a field returns it to the repo text.
- A static string `defaultValue` on a Payload text field becomes a SQL
  `DEFAULT`. Drizzle's SQLite push re-diffed such defaults on every boot and
  rebuilt the table; if a field needs a default, use a function.
- Making a column nullable and adding a column to the same SQLite table in one
  push fails (drizzle copies the new column from the old table). Push in two
  steps.
- `npm run seed` overwrites Projects, Posts, Skills, and FAQs from
  `src/content`. Never seed into a database that holds manual admin edits
  without backing up `payload.db` and `./media` first.
- The local `payload.db` and `./media` were rebuilt from the repo on
  2026-11-21 (schema push under `npm run dev`, then `npm run seed`). The
  previous database and media are in `D:/Afan-Files/backup/portfolio-20261121/`
  (`rebuild-thumbs/` holds the one replaced when the Media sizes changed).
  Keep backups outside the repo.
- Port 3000 is taken by another app on this machine (a WhatsApp bridge); do
  not stop it. Run `npm run dev -- -p 3100` and `npm start -- -p 3100`.
- Stop the dev server before moving or replacing `payload.db`: SQLite keeps
  the file locked on Windows.
- Site content and its sources: `docs/content/copy-draft.md`. Claims on the
  site need a source there (CV, fact sheet, or owner decision); no metrics or
  testimonials without one.
