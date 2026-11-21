# Deploy runbook

The code is ready; this step needs your accounts. Nothing here stores a secret in the repo.

## Order matters

1. Database (Neon)
2. Object storage (Cloudflare R2)
3. App (Vercel) with every variable already set
4. Seed **after** R2 is live

Running the seed before R2 exists writes the 100 images to a Vercel filesystem that is read-only outside `/tmp` and discarded on every deploy. The records would survive in the database and the files would not, so every image URL would 404 while the seed reported success.

## 1. Neon

1. Create a project in the Singapore region.
2. Copy the **pooled** connection string.
3. It becomes `DATABASE_URI`. Any value starting with `postgres` selects the Postgres adapter; anything else falls back to SQLite at `file:./payload.db`.

## 2. Cloudflare R2

1. Create a bucket, for example `portfolio-media`.
2. Create an API token with object read and write on that bucket.
3. Record four values: bucket name, access key id, secret access key, and the S3 endpoint (`https://<account-id>.r2.cloudflarestorage.com`).

The storage plugin activates only when all four are non-empty; empty strings count as absent, so a half-filled environment silently keeps local disk behaviour.

## 3. Vercel

1. Import the repository on the **Hobby** plan and keep the default build command.
2. Set these in Production and Preview:

| Name | Purpose |
|---|---|
| `DATABASE_URI` | Neon pooled connection string |
| `PAYLOAD_SECRET` | signs admin sessions — generate a long random string, never reuse the dev default |
| `NEXT_PUBLIC_SERVER_URL` | the public origin, for example `https://your-domain.tld` |
| `R2_BUCKET` | bucket name |
| `R2_ACCESS_KEY_ID` | R2 token key id |
| `R2_SECRET_ACCESS_KEY` | R2 token secret |
| `R2_ENDPOINT` | R2 S3 endpoint |

3. Deploy. `next build` runs `payload generate:types` output from the repo; no schema push is required for a fresh database because Payload creates its tables on first use.

## 4. Seed production, once R2 is live

```bash
DATABASE_URI="postgres://…" \
PAYLOAD_SECRET="…" \
R2_BUCKET="…" R2_ACCESS_KEY_ID="…" R2_SECRET_ACCESS_KEY="…" R2_ENDPOINT="…" \
npx payload run scripts/seed.ts
```

Expect `100 media, 4 projects, 10 posts, 15 skills, 5 faqs`. Run it twice: the second run must report `created 0`.

Then confirm the media is not on Vercel: open `/admin`, pick any Media record, and check that its URL host is your R2 endpoint rather than the deployment origin.

## 5. First user

Open `/admin`, create the first user immediately. Until that account exists the admin is unclaimed.

## 6. Verify

- `/`, `/blog`, `/projects`, `/projects/<slug>`, `/admin` each return 200.
- The home page shows four projects in the collage and a six-card grid at most.
- Edit a project name in `/admin`, save, reload `/projects`: the new name must appear without a rebuild. If it does not, the `revalidateSite()` hook chain is not firing.
- Upload a replacement image and confirm the page shows the new one within the same reload.

## Later changes

- Content edits need nothing but a save.
- Schema edits (adding a field or collection) need `npx payload generate:types` and `npx payload generate:importmap` committed, plus a deploy.
- Moving to a paid Vercel plan is required only if the site starts taking payments; the Hobby terms allow a personal portfolio that advertises availability.
