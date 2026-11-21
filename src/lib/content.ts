/**
 * Read side of the Payload CMS.
 *
 * Every getter fetches with `depth: 1`, applies the collection's order, and
 * hands each document to a pure `toXView` mapper. The mappers own the
 * translation from Payload relations into the strings the components render,
 * so they are testable without a database and schema drift fails `tsc`
 * instead of turning into a broken `<img src>` in the browser.
 */
import type { ProjectCardData } from "@/components/project-card";
import type { Post } from "@/content/posts";
import type { MediaTile, Project } from "@/content/projects";
import type { Faq, Media, Post as PostDoc, Project as ProjectDoc, SiteSetting, Skill } from "@/payload-types";

import { COPY_DEFAULTS, type SiteCopy } from "./copy-defaults";
import { mediaUrl, type MediaRef } from "./media";
import { isSocialKey, type SocialKey } from "./social-icons";

/** A stored upload: the related Media doc at depth 1, or a legacy public path. */
export type MediaUpload = Media | MediaRef;

const str = (value: string | null | undefined): string => value ?? "";

const byOrder = (a: { order?: number | null }, b: { order?: number | null }): number =>
  (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY);

/** Display dates are strings ("Mar 6, 2025"), so they are compared by parsed time. */
const byDateDesc = (a: { date?: string | null }, b: { date?: string | null }): number => {
  const time = (date: string | null | undefined) => {
    const parsed = Date.parse(date ?? "");
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  };
  return time(b.date) - time(a.date);
};

// --- Projects ---------------------------------------------------------------

type TileDoc = {
  kind?: "image" | "video" | null;
  image?: MediaUpload | null;
  mobileImage?: MediaUpload | null;
  src?: string | null;
  poster?: MediaUpload | null;
  alt?: string | null;
};

type BlockDoc = {
  layout?: "full" | "two" | "three" | null;
  tiles?: TileDoc[] | null;
  description?: { heading?: string | null; bold?: string | null; text?: string | null } | null;
};

export type ProjectDocInput = {
  slug?: string | null;
  kind?: "client" | "experiment" | null;
  name?: string | null;
  type?: string | null;
  heading?: string | null;
  year?: string | null;
  description?: string | null;
  client?: string | null;
  scope?: string[] | null;
  tech?: string[] | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  thumbnail?: MediaUpload | null;
  quote?: {
    text?: string | null;
    bold?: string | null;
    tail?: string | null;
    name?: string | null;
    role?: string | null;
    avatar?: string | null;
  } | null;
  blocks?: BlockDoc[] | null;
  featured?: boolean | null;
  order?: number | null;
};

/**
 * A `Project` plus the two ordering fields `src/lib/select.ts` filters on and
 * the detail-page fields the seed type does not carry. The intersection stays
 * assignable to `Project`, so cards and the collage keep working unchanged.
 *
 * `client`, `repoUrl`, `tech`, and `quote.tail` are left out when empty: list
 * pages hand these rows to client components, so every key is serialized
 * into the page payload, and an absent key costs nothing there.
 */
export type ProjectRow = Project & {
  kind: "client" | "experiment";
  featured: boolean | null;
  order: number | null;
  client?: string;
  repoUrl?: string;
  tech?: string[];
  quote: { tail?: string };
};

/** `{ [key]: value }` for a non-empty value, `{}` otherwise. */
const ifSet = <K extends string, V extends string | string[]>(key: K, value: V): Partial<Record<K, V>> =>
  value.length > 0 ? ({ [key]: value } as Record<K, V>) : {};

/** A tile with nothing to play or show renders as an empty box, so it is dropped. */
const hasSource = (tile: MediaTile): boolean => tile.src !== "";

/**
 * The Media size each image is shown at: cards about 490px wide, full-width
 * tiles across the 1080px container, column tiles at half or a third of it.
 * Sizes are ~2x the rendered width so they stay sharp on retina screens.
 */
const TILE_SIZE = { full: "wide", two: "hero", three: "hero" } as const;
const THUMB_SIZE = "thumb";

function toTileView(tile: TileDoc, layout: keyof typeof TILE_SIZE): MediaTile {
  const alt = str(tile.alt);

  if (tile.kind === "video") {
    // A video tile keeps its text `src`; only the poster is an upload.
    const poster = mediaUrl(tile.poster, "hero") ?? "";
    const view = { kind: "video" as const, src: str(tile.src), poster, alt };
    // `alt` rides along for parity with image tiles; the <video> element ignores it.
    return view;
  }

  return {
    kind: "image",
    src: mediaUrl(tile.image, TILE_SIZE[layout]) ?? str(tile.src),
    alt,
    // Shown below 768px, where a tile is at most ~680px wide.
    ...ifSet("mobileSrc", mediaUrl(tile.mobileImage, "hero") ?? ""),
  };
}

function toBlockView(block: BlockDoc): Project["blocks"][number] {
  const heading = str(block.description?.heading);
  const bold = str(block.description?.bold);
  const text = str(block.description?.text);
  const hasDescription = Boolean(heading || bold || text);

  const layout = block.layout ?? "full";
  return {
    layout,
    tiles: (block.tiles ?? []).map((tile) => toTileView(tile, layout)).filter(hasSource),
    ...(hasDescription ? { description: { heading, bold, text } } : {}),
  };
}

export function toProjectView(doc: ProjectDocInput): ProjectRow {
  return {
    slug: str(doc.slug),
    name: str(doc.name),
    type: str(doc.type),
    heading: str(doc.heading),
    year: str(doc.year),
    description: str(doc.description),
    scope: doc.scope ?? [],
    liveUrl: str(doc.liveUrl),
    thumbnail: mediaUrl(doc.thumbnail, THUMB_SIZE) ?? "",
    quote: {
      text: str(doc.quote?.text),
      bold: str(doc.quote?.bold),
      name: str(doc.quote?.name),
      role: str(doc.quote?.role),
      // `Projects.quote.avatar` is a text path, not a relation: pass it through.
      avatar: str(doc.quote?.avatar),
      ...ifSet("tail", str(doc.quote?.tail)),
    },
    // A block left with no media and no description would render an empty row.
    blocks: (doc.blocks ?? []).map(toBlockView).filter((block) => block.tiles.length > 0 || block.description),
    kind: doc.kind ?? "client",
    featured: doc.featured ?? null,
    order: doc.order ?? null,
    ...ifSet("client", str(doc.client)),
    ...ifSet("repoUrl", str(doc.repoUrl)),
    ...ifSet("tech", (doc.tech ?? []).filter((item) => item.trim() !== "")),
  };
}

/** The subset `ProjectCard` renders, with the card-sized image resolved. */
export function toProjectCardView(doc: ProjectDocInput): ProjectCardData {
  return {
    slug: str(doc.slug),
    name: str(doc.name),
    type: str(doc.type),
    thumbnail: mediaUrl(doc.thumbnail, THUMB_SIZE) ?? "",
  };
}

// --- Site settings ----------------------------------------------------------

/** A social chip the site can render: a closed platform key and a non-empty url. */
export type SocialLink = { platform: SocialKey; url: string };

/** The stored shape of a `SiteCopy` value: every leaf optional and nullable. */
type CopyDocInput<T> = T extends string
  ? string | null
  : T extends (infer Item)[]
    ? CopyDocInput<Item>[] | null
    : { [K in keyof T]?: CopyDocInput<T[K]> | null };

const hasText = (value: unknown): boolean =>
  typeof value === "string"
    ? value.trim() !== ""
    : typeof value === "object" && value !== null && Object.values(value).some(hasText);

/**
 * Walk the defaults and take the stored value wherever it has text. An empty
 * string, a null left by a row saved before the field existed, or a list with
 * no filled rows all resolve to the default, so the site never renders a blank
 * heading. List rows are kept as written; only a wholly empty list falls back.
 */
function fillCopy<T>(value: unknown, fallback: T): T {
  if (typeof fallback === "string") return (hasText(value) ? value : fallback) as T;

  if (Array.isArray(fallback)) {
    const rows = Array.isArray(value) ? value.filter(hasText) : [];
    // A copy per call: a shared default array would be one object in both the
    // layout's and the page's settings, and React would serialize it by reference.
    if (rows.length === 0) return structuredClone(fallback);
    const [shape] = fallback;
    return rows.map((row) =>
      typeof shape === "object" && shape !== null
        ? Object.fromEntries(Object.keys(shape).map((key) => [key, str((row as Record<string, string | null>)[key])]))
        : row,
    ) as T;
  }

  const stored = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    Object.entries(fallback as Record<string, unknown>).map(([key, nested]) => [key, fillCopy(stored[key], nested)]),
  ) as T;
}

/** Rows saved before `platform` existed only carry a free-text label ("X"). */
function legacyPlatform(label: string | null | undefined): string {
  const key = str(label).trim().toLowerCase();
  return key === "twitter" ? "x" : key;
}

function toSocialLinks(rows: SiteSettingsDocInput["socials"]): SocialLink[] {
  return (rows ?? []).flatMap((row) => {
    const platform = row.platform || legacyPlatform(row.label);
    const url = str(row.url).trim();
    return isSocialKey(platform) && url ? [{ platform, url }] : [];
  });
}

export type SiteSettingsView = {
  name: string;
  role: string;
  tagline: string;
  availabilityStatus: SiteSetting["availabilityStatus"];
  availabilityNote: string;
  email: string;
  avatar: string;
  avatarHero: string;
  followerCount: string;
  resume: string;
  socials: SocialLink[];
  workHistory: { company: string; role: string; dates: string }[];
  bigQuote: {
    text: string;
    bold: string;
    tail: string;
    name: string;
    role: string;
    avatar: string;
  };
  seo: { title: string; description: string; ogImage: string };
  copyright: string;
  footerWordmark: string;
  /** About signature image url, or "" when none is uploaded. */
  signature: string;
  copy: SiteCopy;
};

export type SiteSettingsDocInput = {
  name?: string | null;
  role?: string | null;
  tagline?: string | null;
  availabilityStatus?: SiteSetting["availabilityStatus"] | null;
  availabilityNote?: string | null;
  email?: string | null;
  avatar?: MediaUpload | null;
  followerCount?: string | null;
  resume?: MediaUpload | null;
  socials?: { platform?: string | null; label?: string | null; url?: string | null }[] | null;
  workHistory?: { company?: string | null; role?: string | null; dates?: string | null }[] | null;
  bigQuote?: {
    text?: string | null;
    bold?: string | null;
    tail?: string | null;
    name?: string | null;
    role?: string | null;
    avatar?: MediaUpload | null;
  } | null;
  seo?: { title?: string | null; description?: string | null; ogImage?: MediaUpload | null } | null;
  copyright?: string | null;
  footerWordmark?: string | null;
  about?: { signature?: MediaUpload | null } | null;
  copy?: CopyDocInput<SiteCopy> | null;
};

export function toSiteSettingsView(doc: SiteSettingsDocInput): SiteSettingsView {
  const quote = doc.bigQuote;

  return {
    name: str(doc.name),
    role: str(doc.role),
    tagline: str(doc.tagline),
    availabilityStatus: doc.availabilityStatus ?? "open",
    availabilityNote: str(doc.availabilityNote),
    email: str(doc.email),
    avatar: mediaUrl(doc.avatar, "card") ?? "",
    avatarHero: mediaUrl(doc.avatar, "hero") ?? "",
    followerCount: str(doc.followerCount),
    resume: mediaUrl(doc.resume) ?? "",
    socials: toSocialLinks(doc.socials),
    workHistory: (doc.workHistory ?? []).map((entry) => ({
      company: str(entry.company),
      role: str(entry.role),
      dates: str(entry.dates),
    })),
    bigQuote: {
      text: str(quote?.text),
      bold: str(quote?.bold),
      tail: str(quote?.tail),
      name: str(quote?.name),
      role: str(quote?.role),
      // `SiteSettings.bigQuote.avatar` is a Media relation, unlike a project quote.
      avatar: mediaUrl(quote?.avatar, "card") ?? "",
    },
    seo: {
      title: str(doc.seo?.title),
      description: str(doc.seo?.description),
      ogImage: mediaUrl(doc.seo?.ogImage, "hero") ?? "",
    },
    copyright: str(doc.copyright),
    footerWordmark: str(doc.footerWordmark),
    signature: mediaUrl(doc.about?.signature, "card") ?? "",
    copy: fillCopy(doc.copy, COPY_DEFAULTS),
  };
}

// --- Posts ------------------------------------------------------------------

export type PostDocInput = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  date?: string | null;
  image?: MediaUpload | null;
  body?: string | null;
};

/**
 * Seeded post bodies repeat the article header — H1, date, byline, summary —
 * that the detail page already renders from the record's own fields, so the
 * page showed both. Drop everything before the body's first `## ` section.
 */
function stripBodyHeader(md: string): string {
  if (md.startsWith("## ")) return md;
  const i = md.indexOf("\n## ");
  return i === -1 ? md : md.slice(i + 1);
}

export function toPostView(doc: PostDocInput): Post {
  return {
    slug: str(doc.slug),
    title: str(doc.title),
    description: str(doc.description),
    category: str(doc.category),
    date: str(doc.date),
    image: mediaUrl(doc.image, "hero") ?? "",
    body: stripBodyHeader(str(doc.body)),
  };
}

// --- Skills -----------------------------------------------------------------

/** One list for both shapes; `variant` tells the renderer which arm to take. */
export type SkillView = {
  name: string;
  group: string;
  variant: "row" | "tile";
  icon?: string | null;
  tool?: string | null;
  strength?: string | null;
  note?: string | null;
  order?: number | null;
};

export type SkillDocInput = {
  name?: string | null;
  group?: string | null;
  variant?: "row" | "tile" | null;
  icon?: string | null;
  tool?: string | null;
  strength?: string | null;
  note?: string | null;
  order?: number | null;
};

export function toSkillView(doc: SkillDocInput): SkillView {
  return {
    name: str(doc.name),
    group: str(doc.group),
    variant: doc.variant ?? "row",
    icon: doc.icon ?? null,
    tool: doc.tool ?? null,
    strength: doc.strength ?? null,
    note: doc.note ?? null,
    order: doc.order ?? null,
  };
}

// --- FAQs -------------------------------------------------------------------

/** The accordion's shape: the display number is derived, never stored. */
export type FaqView = { n: string; q: string; a: string };

export type FaqDocInput = {
  question?: string | null;
  answer?: string | null;
  order?: number | null;
};

/** `order` is the display number; the position is only a fallback when it is unset. */
export function toFaqView(doc: FaqDocInput, index = 0): FaqView {
  return {
    n: String(doc.order ?? index + 1).padStart(2, "0"),
    q: str(doc.question),
    a: str(doc.answer),
  };
}

// --- Getters ----------------------------------------------------------------
// Loaded lazily so importing this module (the mappers, mostly) never boots the
// CMS and never opens a database connection.

async function payloadClient() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("../payload.config"),
  ]);
  return getPayload({ config });
}

export async function getSiteSettings(): Promise<SiteSettingsView> {
  const payload = await payloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
  return toSiteSettingsView(settings);
}

export async function getProjects(): Promise<ProjectRow[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "projects", depth: 1, pagination: false });
  return [...(docs as ProjectDoc[])].sort(byOrder).map(toProjectView);
}

export async function getProject(slug: string): Promise<ProjectRow | null> {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  const doc = docs[0];
  return doc ? toProjectView(doc) : null;
}

export async function getPosts(): Promise<Post[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "posts", depth: 1, pagination: false });
  return [...(docs as PostDoc[])].sort(byDateDesc).map(toPostView);
}

export async function getPost(slug: string): Promise<Post | null> {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  const doc = docs[0];
  return doc ? toPostView(doc) : null;
}

export async function getSkills(): Promise<SkillView[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "skills", depth: 1, pagination: false });
  return [...(docs as Skill[])].sort(byOrder).map(toSkillView);
}

export async function getFaqs(): Promise<FaqView[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "faqs", depth: 1, pagination: false });
  return [...(docs as Faq[])].sort(byOrder).map((doc, index) => toFaqView(doc, index));
}
