/**
 * One-way bridge from the static content modules in `src/content` into Payload.
 *
 * Every pass is keyed by the collection's natural key, so a second run updates
 * the rows it created instead of duplicating them: media by `filename`,
 * projects and posts by `slug`, skills by `name`, FAQs by `question`.
 * SiteSettings is a singleton the owner edits in the admin, so it is only
 * written while it is still empty; `SEED_FORCE_SETTINGS=true` overwrites it.
 *
 * Run with `npm run seed` (`payload run scripts/seed.ts`).
 */
import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "@payload-config";
import { posts as postContent } from "@/content/posts";
import { projects as projectContent, type MediaBlock, type MediaTile } from "@/content/projects";
import { faqs, services, site, techStack, workHistory } from "@/content/site";
import type { Faq, Media, Post, Project, SiteSetting, Skill } from "@/payload-types";

import { POST_CATEGORIES, type PostCategory } from "@/lib/post-meta";
import { storageEnabled } from "@/lib/storage";

import { migrations } from "../src/migrations";

import { countSeededMedia, missingFiles, pendingMigrations, seedFiles, seedSourceMap, type MediaFiles } from "./seed-media";

const IMG_DIR = path.join(process.cwd(), "public", "img");
const FILES_DIR = path.join(process.cwd(), "public", "files");
const MEDIA_DIR = path.join(process.cwd(), "media");

type ProjectData = Omit<Project, "id" | "createdAt" | "updatedAt">;
type Block = NonNullable<ProjectData["blocks"]>[number];
type Tile = NonNullable<Block["tiles"]>[number];
type PostData = Omit<Post, "id" | "createdAt" | "updatedAt">;
type SkillData = Omit<Skill, "id" | "createdAt" | "updatedAt">;
type FaqData = Omit<Faq, "id" | "createdAt" | "updatedAt">;
type SiteData = Omit<SiteSetting, "id" | "createdAt" | "updatedAt">;

type Counts = { total: number; created: number; updated: number; restored: number };

const payload = await getPayload({ config });

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** A public R2 URL answers a HEAD request when the object is there. */
async function urlExists(url: string): Promise<boolean> {
  try {
    return (await fetch(url, { method: "HEAD" })).ok;
  } catch {
    return false;
  }
}

/**
 * Where this run's Media files live. With R2 on, the bytes are not in
 * ./media, so each file (original and every size) is checked at its public
 * URL instead.
 */
const FILE_MODE = storageEnabled() ? ({ remote: true } as const) : { local: MEDIA_DIR };
const whereFiles = "remote" in FILE_MODE ? "R2" : MEDIA_DIR;
const filesMissing = (doc: MediaFiles) => missingFiles(doc, FILE_MODE, "remote" in FILE_MODE ? urlExists : fileExists);

/** Seed files with no directory yet (no CV in `public/files`) contribute nothing. */
async function readSeedDir(dir: string): Promise<string[]> {
  try {
    return seedFiles(await fs.readdir(dir));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/** Every file the seed uploads: images from `public/img`, PDFs such as the CV from `public/files`. */
async function seedSources(): Promise<Map<string, string>> {
  const dirs = await Promise.all([IMG_DIR, FILES_DIR].map(async (dir) => ({ dir, names: await readSeedDir(dir) })));
  return seedSourceMap(dirs);
}

/** `public/img/<filename>` or `public/files/<filename>` → Media id, filled by the media pass. */
const mediaIds = new Map<string, number>();

function mediaId(src: string): number {
  const id = mediaIds.get(path.posix.basename(src));
  if (id === undefined) throw new Error(`No seeded Media record for "${src}"`);
  return id;
}

/** Project slug → Project id, filled by the projects pass. */
const projectIds = new Map<string, number>();

function projectId(slug: string): number {
  const id = projectIds.get(slug);
  if (id === undefined) throw new Error(`No seeded Project record for "${slug}"`);
  return id;
}

function postCategory(key: string): PostCategory {
  const match = POST_CATEGORIES.find((c) => c.value === key);
  if (!match) throw new Error(`"${key}" is not a known Posts.category option`);
  return match.value;
}

// --- Skills -----------------------------------------------------------------
// Skills have no content file of their own: the row skills come from `services`
// (keyed by icon) and the tile skills from `techStack` (keyed by tool name).
// `ai-automation` intentionally receives no rows; the owner adds those in the
// admin.

type SkillGroup = Skill["group"];

const ROW_GROUP = {
  wordpress: "build",
  webapp: "build",
  ai: "generative-ai",
  ux: "design",
  support: "build",
  performance: "build",
} as const satisfies Record<string, SkillGroup>;

const TILE_GROUP = {
  WordPress: "build",
  Elementor: "build",
  WooCommerce: "build",
  PHP: "build",
  "Next.js": "build",
  React: "build",
  TypeScript: "build",
  Supabase: "build",
  Figma: "design",
  Gemini: "generative-ai",
  ChatGPT: "generative-ai",
  Claude: "generative-ai",
} as const satisfies Record<string, SkillGroup>;

const rowSkills: SkillData[] = services.map((service, index) => ({
  name: service.label,
  group: ROW_GROUP[service.icon],
  variant: "row",
  icon: service.icon,
  order: index + 1,
}));

const tileSkills: SkillData[] = techStack.map((name, index) => {
  if (!(name in TILE_GROUP)) throw new Error(`"${name}" is not a known Skills.tool option`);
  const tool = name as keyof typeof TILE_GROUP;
  return { name, group: TILE_GROUP[tool], variant: "tile", tool, order: index + 1 };
});

// --- Content mapping --------------------------------------------------------

function toTile(tile: MediaTile): Tile {
  if (tile.kind === "video") {
    return {
      kind: "video",
      src: tile.src,
      ...(tile.poster ? { poster: mediaId(tile.poster) } : {}),
    };
  }
  // A repo image becomes the upload relation; any other string stays in `src`.
  const mobile = tile.mobileSrc ? { mobileImage: mediaId(tile.mobileSrc) } : {};
  return tile.src.startsWith("/img/")
    ? { kind: "image", image: mediaId(tile.src), alt: tile.alt, ...mobile }
    : { kind: "image", src: tile.src, alt: tile.alt, ...mobile };
}

function toBlock(block: MediaBlock): Block {
  return {
    layout: block.layout,
    tiles: block.tiles.map(toTile),
    ...(block.description ? { description: block.description } : {}),
  };
}

function toProjectData(project: (typeof projectContent)[number], order: number): ProjectData {
  return {
    kind: project.kind,
    name: project.name,
    slug: project.slug,
    type: project.type,
    heading: project.heading,
    year: project.year,
    description: project.description,
    client: project.client || null,
    scope: [...project.scope],
    tech: [...project.tech],
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl || null,
    thumbnail: mediaId(project.thumbnail),
    // Projects carry no pull quote; null clears one left by an earlier seed.
    quote: { text: null, bold: null, tail: null, name: null, role: null, avatar: null },
    blocks: project.blocks.map(toBlock),
    // The home collage shows featured projects (capped at 4) and the grid sorts
    // by `order`; the source array is the intended order.
    featured: project.featured,
    order,
  };
}

function toPostData(post: (typeof postContent)[number]): PostData {
  return {
    title: post.title,
    slug: post.slug,
    description: post.description,
    category: postCategory(post.categoryKey),
    publishedAt: post.publishedAt,
    image: post.image ? mediaId(post.image) : null,
    body: post.body,
    tools: [...post.tools],
    relatedProjects: post.relatedProjects.map(({ slug }) => projectId(slug)),
    discussion: post.discussion.map(({ platform, url }) => ({ platform, url })),
    aiAssisted: post.aiAssisted,
    _status: "published",
  };
}

function toSiteData(): SiteData {
  return {
    name: site.name,
    role: site.role,
    tagline: site.tagline,
    availabilityStatus: site.availabilityStatus,
    availabilityNote: site.availabilityNote,
    email: site.email,
    avatar: mediaId(site.avatar),
    resume: site.resume ? mediaId(site.resume) : null,
    followerCount: site.followerCount,
    socials: site.socials.map(({ platform, url }) => ({ platform, url })),
    workHistory: workHistory.map(({ company, role, dates }) => ({ company, role, dates })),
    // No testimonial: an empty quote hides the BigQuote section.
    bigQuote: { text: null, bold: null, tail: null, name: null, role: null, avatar: null },
    seo: { title: site.seo.title, description: site.seo.description },
    copyright: site.copyright,
  };
}

// --- Passes -----------------------------------------------------------------

async function seedMedia(): Promise<Counts> {
  const sourcePaths = await seedSources();
  const files = [...sourcePaths.keys()];
  const sources = new Set(files);

  const existing = await payload.find({ collection: "media", pagination: false, depth: 0 });
  const rows = new Map<string, Media>();
  for (const doc of existing.docs) {
    if (doc.filename) rows.set(doc.filename, doc);
  }

  let created = 0;
  let restored = 0;

  for (const filename of files) {
    const source = sourcePaths.get(filename) ?? "";
    const target = path.join(MEDIA_DIR, filename);
    const row = rows.get(filename);

    if (row) {
      mediaIds.set(filename, row.id);
      if ((await filesMissing(row)).length === 0) continue;

      // The record survived but its file did not. Re-upload the original bytes
      // under the same name so every stored relation keeps resolving.
      const updated = await payload.update({
        collection: "media",
        id: row.id,
        data: { alt: row.alt },
        filePath: source,
        overwriteExistingFiles: true,
      });
      if (updated.filename !== filename || (await filesMissing(updated)).length > 0) {
        throw new Error(
          `Media record #${row.id} ("${filename}") could not be re-uploaded to ${whereFiles}. ` +
            `Delete that one record in the admin and re-run the seed.`,
        );
      }
      restored += 1;
      continue;
    }

    // Locally, a file without a record would be overwritten or renamed; on R2
    // the upload simply replaces the object under the same key.
    if ("local" in FILE_MODE && (await fileExists(target))) {
      throw new Error(
        `${target} has no Media record. Delete that single file and re-run the seed — ` +
          `never delete the ./media directory, which would orphan the other records.`,
      );
    }

    const doc = await payload.create({
      collection: "media",
      data: { alt: path.parse(filename).name },
      filePath: source,
    });
    if (doc.filename !== filename) {
      throw new Error(
        `Media "${filename}" was stored as "${doc.filename ?? "(no filename)"}". ` +
          `Delete that renamed file from ${MEDIA_DIR} and its record, then re-run the seed.`,
      );
    }
    mediaIds.set(filename, doc.id);
    created += 1;
  }

  // A record whose source image is gone cannot be restored automatically.
  for (const row of rows.values()) {
    if (!row.filename || sources.has(row.filename)) continue;
    if ((await filesMissing(row)).length === 0) continue;
    throw new Error(
      `Media record #${row.id} ("${row.filename}") has no file in ${whereFiles} and no source in ` +
        `${IMG_DIR} or ${FILES_DIR}. Restore one of them or re-upload the file in the admin.`,
    );
  }

  return { total: files.length, created, updated: 0, restored };
}

async function seedProjects(): Promise<Counts> {
  let created = 0;
  let updated = 0;

  for (const [index, project] of projectContent.entries()) {
    const data = toProjectData(project, index + 1);
    const found = await payload.find({
      collection: "projects",
      where: { slug: { equals: project.slug } },
      limit: 1,
      depth: 0,
      pagination: false,
    });

    if (found.docs[0]) {
      const updatedDoc = await payload.update({ collection: "projects", id: found.docs[0].id, data });
      projectIds.set(project.slug, updatedDoc.id);
      updated += 1;
    } else {
      const createdDoc = await payload.create({ collection: "projects", data });
      projectIds.set(project.slug, createdDoc.id);
      created += 1;
    }
  }

  return { total: projectContent.length, created, updated, restored: 0 };
}

async function seedPosts(): Promise<Counts> {
  let created = 0;
  let updated = 0;

  for (const post of postContent) {
    const data = toPostData(post);
    const found = await payload.find({
      collection: "posts",
      where: { slug: { equals: post.slug } },
      limit: 1,
      depth: 0,
      pagination: false,
    });

    if (found.docs[0]) {
      await payload.update({ collection: "posts", id: found.docs[0].id, data });
      updated += 1;
    } else {
      await payload.create({ collection: "posts", data });
      created += 1;
    }
  }

  return { total: postContent.length, created, updated, restored: 0 };
}

async function seedSkills(): Promise<Counts> {
  let created = 0;
  let updated = 0;

  for (const skill of [...rowSkills, ...tileSkills]) {
    const found = await payload.find({
      collection: "skills",
      where: { name: { equals: skill.name } },
      limit: 1,
      depth: 0,
      pagination: false,
    });

    if (found.docs[0]) {
      await payload.update({ collection: "skills", id: found.docs[0].id, data: skill });
      updated += 1;
    } else {
      await payload.create({ collection: "skills", data: skill });
      created += 1;
    }
  }

  return { total: rowSkills.length + tileSkills.length, created, updated, restored: 0 };
}

async function seedFaqs(): Promise<Counts> {
  let created = 0;
  let updated = 0;

  for (const faq of faqs) {
    const data: FaqData = {
      question: faq.q,
      answer: faq.a,
      category: faq.category,
      order: Number.parseInt(faq.n, 10),
    };
    const found = await payload.find({
      collection: "faqs",
      where: { question: { equals: faq.q } },
      limit: 1,
      depth: 0,
      pagination: false,
    });

    if (found.docs[0]) {
      await payload.update({ collection: "faqs", id: found.docs[0].id, data });
      updated += 1;
    } else {
      await payload.create({ collection: "faqs", data });
      created += 1;
    }
  }

  return { total: faqs.length, created, updated, restored: 0 };
}

/**
 * Writes the seed identity only into an empty global. Once `name` is set the
 * owner has made it theirs, and a re-run must not overwrite it. Section copy is
 * not seeded: every copy field defaults to the shipped text on its own.
 */
async function seedSiteSettings(): Promise<"written" | "skipped"> {
  const existing = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  if (existing.name && process.env.SEED_FORCE_SETTINGS !== "true") {
    console.log("site-settings exists, skipped");
    return "skipped";
  }
  await payload.updateGlobal({ slug: "site-settings", data: toSiteData() });
  return "written";
}

/**
 * Image resizing only runs when `sharp` is passed to `buildConfig`. `sizes.card`
 * existing proves nothing — the field is present in the schema either way — so
 * compare the resized URL against the original one.
 */
async function verifyMedia(): Promise<void> {
  const sources = [...(await seedSources()).keys()];
  const all = await payload.find({ collection: "media", pagination: false, depth: 0 });
  // Only the seed's own records are checked; uploads made in the admin are the owner's.
  const docs = all.docs.filter((doc) => doc.filename && sources.includes(doc.filename));

  const count = countSeededMedia(docs, sources);
  if (count.found !== count.expected) {
    throw new Error(
      `Expected ${count.expected} seeded Media records, found ${count.found}; missing: ${count.missing.join(", ")}`,
    );
  }

  // A record without its files serves a 404, so check the bytes (every size), not the row.
  const missing: string[] = [];
  for (const doc of docs) {
    for (const file of await filesMissing(doc)) missing.push(`#${doc.id} ${file}`);
  }
  if (missing.length > 0) {
    throw new Error(
      `Media file(s) missing from ${whereFiles}: ${missing.join(", ")}. ` +
        `Re-run \`npm run seed\` to re-upload them from public/img and public/files.`,
    );
  }

  // Only images are resized; the CV and any other PDF carry no sizes.
  const images = docs.filter((doc) => doc.mimeType?.startsWith("image/"));
  const sample = images.find((doc) => doc.sizes?.card?.url && doc.sizes?.hero?.url);
  if (!sample) {
    throw new Error("No Media record carries both sizes.card and sizes.hero; check that sharp is passed to buildConfig.");
  }

  const resized = images.filter((doc) => doc.url && doc.sizes?.card?.url && doc.sizes.card.url !== doc.url);
  if (resized.length === 0) {
    throw new Error("sizes.card.url equals url on every Media record; sharp produced no resized files.");
  }

  const example = resized[0];
  console.log(
    `media resize: ${resized.length}/${images.length} image records have sizes.card.url !== url ` +
      `(e.g. ${example.filename}: ${example.url} -> ${example.sizes?.card?.url})`,
  );
}

/**
 * Creates the first admin from SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD
 * while the users collection is empty, so a fresh /admin is never left open
 * for anyone to claim. The password is never printed.
 */
async function seedAdmin(): Promise<"created" | "exists" | "not requested"> {
  const { totalDocs } = await payload.count({ collection: "users" });
  if (totalDocs > 0) return "exists";
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return "not requested";
  await payload.create({ collection: "users", data: { email, password } });
  return "created";
}

/**
 * Postgres never pushes its schema, so seeding before `payload migrate`
 * would hit missing tables. Refuse with the command to run instead.
 */
async function assertMigrated(): Promise<void> {
  if (!(process.env.DATABASE_URI ?? "").startsWith("postgres")) return;
  let applied: string[] = [];
  try {
    const { docs } = await payload.find({ collection: "payload-migrations", pagination: false, depth: 0 });
    applied = docs.map((doc) => String((doc as { name?: string }).name));
  } catch {
    applied = [];
  }
  const pending = pendingMigrations(applied, migrations.map((m) => m.name));
  if (pending.length > 0) {
    throw new Error(
      `This database has not run ${pending.length} migration(s) (${pending.join(", ")}). ` +
        "Run `npx payload migrate` against it first, then seed.",
    );
  }
}

async function main(): Promise<void> {
  try {
    await assertMigrated();
    const admin = await seedAdmin();
    const media = await seedMedia();
    const projects = await seedProjects();
    const posts = await seedPosts();
    const skills = await seedSkills();
    const faq = await seedFaqs();
    const settings = await seedSiteSettings();

    await verifyMedia();

    console.log(
      `seeded ${media.total} media, ${projects.total} projects, ${posts.total} posts, ` +
        `${skills.total} skills (${rowSkills.length} row, ${tileSkills.length} tile), ${faq.total} faqs; ` +
        `site-settings ${settings}; admin user ${admin}; media files checked in ${whereFiles}`,
    );
    console.log(
      `created ${media.created + projects.created + posts.created + skills.created + faq.created}, ` +
        `updated ${projects.updated + posts.updated + skills.updated + faq.updated}, ` +
        `media files restored ${media.restored}`,
    );
  } finally {
    await payload.destroy();
  }
}

await main();
