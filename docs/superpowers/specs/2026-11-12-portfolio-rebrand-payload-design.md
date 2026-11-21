# Portfolio rebrand + Payload CMS — design

Date: 2026-11-12

## Intent

The site currently is a pixel clone of a Framer template selling design services,
carrying a placeholder identity ("Joseph Alexander / Full-stack Designer"). It must
become the owner's personal portfolio, aimed at getting hired or contracted through
four channels: full-time, part-time, freelance, and per-project.

The visual design, layout, and animations are kept exactly as they are. Only identity,
copy, and imagery change. Content becomes editable through a CMS so the owner can add
projects without touching code.

## Goals

1. Replace every piece of template identity, copy, and image with the owner's own.
2. Keep the current visual result: geometry, typography, colors, and animation timing
   must not regress in the retained sections.
3. Make Projects, Skills, Posts, FAQs, and site identity editable at `/admin`.
4. Deploy for zero recurring cost apart from the domain.
5. Keep the existing audit workflow (`prompts/reference-diff.md`) usable for the
   sections that survive.

## Non-goals

- No visual redesign. No new color system, type scale, or section order.
- No pricing, testimonials, or service packages — those sections are removed.
- No e-commerce, no payments, no booking.
- No multi-language.
- No redesign of the CMS admin UI beyond Payload's defaults.

## Anti-goals

Failure looks like any of these:

- A retained section shifts by more than 1px, or an animation loses its spring.
- The owner still needs a code change to add a project or a skill.
- Hosting costs money beyond the domain.
- The CMS becomes a second source of truth that drifts from the repo.

## Verified constraints

| Constraint | Evidence | Status |
|---|---|---|
| Next.js 16.4.6 | `package.json` | supported by Payload peer range |
| `@payloadcms/next` 3.93.0 peer | `next >=16.3.3 <17.0.0` | compatible |
| Node engines | `^22.23.4 \|\| >=24.22.1` | local 24.22.1, the exact minimum |
| No request-time APIs today | 0 `cookies()`, `headers()`, `searchParams`, `dynamic` | every page is prerenderable |
| No route handlers today | 0 `route.ts` | adding Payload routes is additive |
| Images | 0 `next/image`, 17 plain `<img>` | no loader migration needed |
| Content volume | 1,263 lines across 3 files | seedable in one script |
| Assets | 100 files, 48 MB in `public/img` | claimable by R2 free tier |
| Importers | 15 files import `@/content` | the rewiring surface |

## Approaches considered

**A. Payload inside the same Next app, deployed to Vercel — chosen.**
One deploy, one repo, live preview, instant revalidation. Requires dropping
`output: "export"` and adding a database and object storage.

**B. Separate Payload deployment, frontend stays static — rejected.**
Preserves `out/` and static hosting, but every publish needs a rebuild, there is no
live preview, and it doubles the deploy surface for no benefit here.

**C. Third-party headless CMS (Sanity/Contentful) — rejected.**
Vendor-hosted admin, weaker asset story on free tiers, and content leaves the repo.
Payload keeps schema and content under the same ownership.

## Decisions made by the owner

- Keep the visual design; change content only.
- Hero label: **Web Designer & Developer**, with AI as the differentiator line.
- Four clusters replace six titles: Design, Build, AI Automation, Generative AI.
- Primary CTA: email. Secondary: download CV. `bookUrl` (Cal.com) is removed.
- Open to full-time, part-time, freelance, and per-project work.
- `Services` becomes `Skills`. `Pricing` and `Testimonials` are deleted.
- `FAQ` is rewritten for recruiters.

## Decisions made by the builder (correctable)

| Decision | Choice | Reason |
|---|---|---|
| Content language | English | matches the template's tone; readable by local and international recruiters |
| `HappyClients` | dropped from the homepage **and** `projects/[slug]` | the "99+ happy clients" counter is a sales claim, not evidence |
| `ClientLogos` | dropped from the homepage **and** `projects/[slug]` | clients are private individuals; no company logos exist |
| `followerCount` | kept as optional; every render site hides it when empty | it renders in About, the footer, and blog posts — three files, not one |
| `Articles` | kept, section hidden when zero posts | writing is optional; an empty section is worse than none |
| `Posts` body | markdown textarea + existing renderer | preserves 795 lines of content byte-for-byte; Lexical conversion adds risk for no gain |
| Asset storage | Media + R2 from day one; the seed migrates all 100 existing images | staging would leave the owner unable to add a project on day one, which is the whole point of the CMS |

## Data model

### Global: `SiteSettings`

`name`, `role`, `tagline`, `availabilityStatus` (enum: open / selective / closed),
`availabilityNote`, `email`, `avatar`, `resume`, `socials[]` (platform, url),
`workHistory[]` (company, role, dates), `bigQuote` (text, attribution),
`seo` (title, description, ogImage), `copyright`.

### Collections

| Collection | Fields |
|---|---|
| `Projects` | `name`, `slug`, `kind` (client / experiment), `type`, `heading`, `year`, `client`, `description`, `scope[]`, `disciplines[]` (design / build / ai-automation / generative-ai), `tech[]`, `liveUrl`, `repoUrl`, `thumbnail`, `quote` (group: text, bold, name, role, avatar), `blocks[]` (layout full / two / three; `tiles[]` image or video; optional `description` group), `featured`, `order` |
| `Skills` | `name`, `group` (design / build / ai-automation / generative-ai), `variant` (row / tile), `icon` (select over the existing closed icon keys), `strength` (working / strong / expert), `note`, `order` |
| `Posts` | `title`, `slug`, `description`, `category`, `date`, `image`, `body` |
| `FAQs` | `question`, `answer`, `category` (availability / role / process / general), `order` |
| `Media` | `file`, `alt`, `caption`, `mimeTypes` including PDF for the CV; sizes for cover and gallery |

These shapes were read from the current source, not invented: `projects.ts` defines 4
projects with `blocks[]` and a per-project pull quote, and `posts.ts` defines 10 posts
whose markdown body carries its own H1, date, and byline. `blocks[]` replaces a flat
`gallery[]` because the detail page renders three distinct layouts.

`Skills` needs `variant` because the Services section renders two unrelated systems:
7 icon rows through `iconFor` and 8 tool tiles through `toolFor`. Both are closed maps
where an unknown key yields `undefined`, so `icon` must be a select over the keys those
maps already contain — free text would render blank.

Removed with their sections: `services`, `pricingSteps`, `subscriptionBenefits`,
`singleProjectBenefits`, `testimonials`, `clientAvatars`.

`followerCount` is **not** removed. It renders in `about-pricing.tsx`, `footer.tsx`, and
`app/blog/[slug]/page.tsx`. It becomes optional and each site hides it when empty;
deleting it outright would mean editing three unrelated files for no user gain.

`HappyClients` and `ClientLogos` are imported twice — `app/page.tsx` and
`app/projects/[slug]/page.tsx`. Both imports are removed, and the project detail page
keeps its own content without them.

### Content migration map

| Source | Target |
|---|---|
| `site.ts: site` | `SiteSettings` |
| `site.ts: workHistory` | `SiteSettings.workHistory[]` |
| `site.ts: bigQuote` | `SiteSettings.bigQuote` |
| `projects.ts` | `Projects` (seed) |
| `posts.ts` | `Posts.bodyMarkdown` (seed, verbatim) |
| `site.ts: faqs` | `FAQs` (rewritten, not copied) |
| `site.ts: services` + `techStack` | `Skills` (re-grouped) |
| `site.ts: pricingSteps`, `testimonials`, `clientAvatars`, `followerCount` | deleted |

## Page composition after rebrand

```
Hero → Projects → BigQuote → Skills → About → FAQ → Articles
```

`HappyClients`, `ClientLogos`, `Testimonials`, and `Pricing` are removed from
`src/app/page.tsx`. `About` stays; `about-pricing.tsx` is split because it currently
exports both `About` and `Pricing`, and the work-history spring inside `About` must
survive untouched.

### Component changes

| File | Action |
|---|---|
| `about-pricing.tsx` | keep lines 1–165 (`About`), delete `Pricing` (166–313) and the three imports it alone uses; rename to `about.tsx` |
| `services.tsx` | replaced by `skills.tsx` |
| `testimonials.tsx` | deleted |
| `happy-clients.tsx`, `client-logos.tsx` | deleted, and their imports removed from `app/page.tsx` and `app/projects/[slug]/page.tsx` |
| `faq.tsx` | kept; content rewritten for recruiters |
| `articles.tsx` | takes `posts` as a prop rather than importing the module; returns `null` under 3 posts |
| `nav.tsx` | link labels updated; geometry and spring untouched |
| `footer.tsx` | `followerCount` hidden when empty |

Verified by reading the file: `About` uses only `workHistory` and `site`, while
`Pricing` alone owns `pricingSteps`, `subscriptionBenefits`, and `singleProjectBenefits`.
The split therefore touches no shared state and leaves the work-history spring intact.

## Rendering and caching

- Remove `output: "export"` from `next.config.ts`. Keep `trailingSlash` and
  `images.unoptimized`.
- Every page becomes an async server component reading through Payload's local API.
- `generateStaticParams` for `projects/[slug]` and `blog/[slug]` reads from Payload.
- Pages are prerendered at build; publishing calls `revalidateTag` per collection so
  visitors always receive cached HTML.
- Client components (`nav`, `about-pricing`, `motion-primitives`, `text-cycle`, etc.)
  receive the same data shapes as today and are not modified.

## Deployment

| Component | Service | Notes |
|---|---|---|
| App + admin | Vercel Hobby | personal, non-commercial portfolio |
| Database | Neon free | region Singapore; accessed through Vercel Marketplace |
| Object storage | Cloudflare R2 free | 48 MB fits well inside 10 GB; no egress fee |
| Domain | owner | not part of this design |

Environment: `PAYLOAD_SECRET`, `DATABASE_URI`, `NEXT_PUBLIC_SERVER_URL`,
`R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`.

Vercel's filesystem is ephemeral and read-only outside `/tmp`, so uploads must go to
R2. SQLite is not viable in production for the same reason.

### Commercial-use risk

Vercel Hobby is limited to personal, non-commercial projects. A portfolio that states
availability for freelance or per-project work sits close to that line. The working
assumption is that a personal portfolio stays personal use as long as nothing is bought
or paid for on the site. If that assumption is not acceptable, the fallback is a Render
free web service running the same code — slower cold starts and no edge cache, but no
architectural change.

The owner accepted the Hobby risk on 2026-11-12. If the site ever starts selling
services or taking payment, it moves to Vercel Pro; that is a billing change, not a
code change.

## Display caps and empty states

Every one of these is a place where adding content would otherwise break a retained
layout. The CMS must not be able to produce a broken page.

| Surface | Hard limit today | Rule |
|---|---|---|
| Home collage (`ProjectShowcase`) | 4 fixed offsets, `offsets[0]` fallback | render `featured` only, capped at 4 |
| Home grid "Latest Projects" | unbounded | show 6, then a "View all" link |
| `/projects` | none | all, sorted by `order` |
| `/blog` listing | `featured + rest.slice(0, 4)` — a 6th post is unreachable | raise to a documented page size |
| `Articles` (home) | destructures exactly 3; throws at 1–2 posts | return `null` under 3 |
| About work history | panel animates to a fixed 360px sized for 3 entries | derive height from count, cap the stack at 3 |

## CTA surfaces

`bookUrl` is not one component — it renders in the nav Contact button, the home hero,
`/projects`, `/projects/[slug]`, the FAQ sidebar card (which also carries a Cal.com
wordmark), the footer ("Call Me / Book Now"), and the sticky bar (email plus calendar
icons). All of them lose booking. Email becomes primary everywhere; the CV download is
the hero's second action, the footer's second link, and takes the sticky bar's calendar
slot. `Media` therefore accepts PDF, not only images. The owner confirmed the CV exists
and is ready to upload.

## Drafts and preview

No drafts in v1. Every save publishes and fires `revalidateTag`. Payload version history
is enabled for rollback, but `drafts` stays off so a prerendered page always matches
published state. Live preview is out of scope for v1.

## Nav width

The open width stays 550px. Removing `Pricing` leaves roughly 60px of slack before the
Contact button; that slack is accepted rather than re-measured, because 550 is a
regression gate and the gap reads as intentional on a four-item nav. The `#services`
anchor becomes `#skills`.

## Verification

- `prompts/reference-diff.md` stops being a whole-page audit and becomes a structural
  check on retained sections. Removed sections have no reference to compare against, and
  rewritten copy legitimately changes text-driven heights.
- Structural gates: nav 233→550 at `[604,24]`, dots at `[800,40,24,24]`, work-history
  spring `stiffness 120 / damping 18`, section padding, and inter-section gaps.
- `tsc --noEmit` clean; `next build` produces no static-export errors.
- `/admin` loads and one collection round-trips a save before any content migration.

## Risks

1. **Payload 3.93 + Next 16 is a recent pairing.** The peer range says supported, but
   the combination is young. Smoke-test `/admin` first, before any schema work.
2. **Node 24.22.1 is the exact engine minimum.** Do not downgrade Node.
3. **`sharp` must be installed** for Payload image sizes; without it, uploads succeed
   but resizing silently degrades.
4. **Neon cold start** adds ~1s to the first query after idle; prerendered pages hide
   this from visitors.
5. **Section removal changes page height.** Any stored height table from the clone work
   is no longer a valid expectation.

## Left to the builder

- Field-level validation rules and admin list columns.
- Image size presets for covers and galleries.
- Seed script structure and idempotency.
- SEO field granularity.
- Whether `navLinks` stays a global or becomes a constant.

## Prerequisite not yet supplied

Real identity data (name, projects, contact email, project assets) is not in this
document. The CV exists as a PDF and is ready to upload. Structure can be built and
seeded with placeholders, but the site is not finished until the remaining content
arrives.
