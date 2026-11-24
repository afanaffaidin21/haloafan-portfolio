import { expect, test } from "vitest";
import { toFaqView, toPostView, toProjectCardView, toProjectView, toSiteSettingsView } from "../../src/lib/content";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";

test("project view flattens media to urls and keeps the card props", () => {
  const view = toProjectView({
    slug: "mango", name: "Mango", type: "Branding", heading: "H", year: "2026",
    description: "d", scope: ["Brand Identity"], liveUrl: "https://x",
    thumbnail: { url: "/a.jpg" }, quote: { text: "t", bold: "b", name: "n", role: "r" },
    blocks: [{ layout: "full", tiles: [{ kind: "image", image: { url: "/b.jpg" }, alt: "alt" }] }],
  });
  expect(view.thumbnail).toBe("/a.jpg");
  expect(view.blocks[0].tiles[0].src).toBe("/b.jpg");
});
test("a project without a thumbnail yields an empty string, never undefined", () => {
  const view = toProjectView({ slug: "s", name: "n", blocks: [] } as never);
  expect(view.thumbnail).toBe("");
  expect(view.blocks).toEqual([]);
});
test("video tiles keep src and flatten the poster", () => {
  const view = toProjectView({
    slug: "v", name: "v",
    blocks: [{ layout: "two", tiles: [{ kind: "video", src: "/v.mp4", poster: { url: "/p.jpg" }, alt: "" }] }],
  } as never);
  expect(view.blocks[0].tiles[0]).toEqual({ kind: "video", src: "/v.mp4", poster: "/p.jpg", alt: "" });
});

test("the card view resolves the thumb size and carries what the card renders", () => {
  const card = toProjectCardView({
    slug: "s", name: "n", type: "t",
    thumbnail: { url: "/c.jpg", sizes: { card: { url: "/c-card.jpg" }, thumb: { url: "/c-thumb.jpg" } } },
  } as never);
  expect(card).toEqual({ slug: "s", name: "n", type: "t", thumbnail: "/c-thumb.jpg" });
});

const sized = (name: string) => ({
  url: `/${name}.jpg`,
  sizes: { card: { url: `/${name}-card.jpg` }, hero: { url: `/${name}-hero.jpg` }, thumb: { url: `/${name}-thumb.jpg` }, wide: { url: `/${name}-wide.jpg` } },
});

test("project images pick the size they are shown at: thumb for cards, wide for full tiles, hero for columns", () => {
  const view = toProjectView({
    slug: "s", name: "n", thumbnail: sized("t"),
    blocks: [
      { layout: "full", tiles: [{ kind: "image", image: sized("f"), alt: "" }] },
      { layout: "two", tiles: [{ kind: "image", image: sized("a"), alt: "" }, { kind: "image", image: sized("b"), alt: "" }] },
      { layout: "three", tiles: [{ kind: "image", image: sized("c"), alt: "" }] },
    ],
  });
  expect(view.thumbnail).toBe("/t-thumb.jpg");
  expect(view.blocks.map((b) => b.tiles.map((t) => t.src))).toEqual([["/f-wide.jpg"], ["/a-hero.jpg", "/b-hero.jpg"], ["/c-hero.jpg"]]);
});

test("an image without the new sizes yet falls back to its original url", () => {
  const view = toProjectView({
    slug: "s", name: "n", thumbnail: { url: "/t.jpg", sizes: { card: { url: "/t-card.jpg" } } },
    blocks: [{ layout: "full", tiles: [{ kind: "image", image: { url: "/f.jpg", sizes: { hero: { url: "/f-hero.jpg" } } }, alt: "" }] }],
  });
  expect(view.thumbnail).toBe("/t.jpg");
  expect(view.blocks[0].tiles[0].src).toBe("/f.jpg");
});

test("the big quote avatar is a media relation, so it resolves; empties stay strings", () => {
  const view = toSiteSettingsView({
    name: "n", email: "e",
    bigQuote: { avatar: { url: "/q.jpg", sizes: { card: { url: "/q-card.jpg" } } } },
  } as never);
  expect(view.bigQuote.avatar).toBe("/q-card.jpg");
  expect(view.role).toBe("");
  expect(view.resume).toBe("");
  expect(view.bigQuote.text).toBe("");
});

test("faqs carry the zero-padded display number from order", () => {
  expect(toFaqView({ order: 1, question: "q", answer: "a" })).toEqual({ n: "01", q: "q", a: "a" });
  expect(toFaqView({ order: 12, question: "q", answer: "a" }).n).toBe("12");
  expect(toFaqView({ question: "q" }, 2).n).toBe("03");
  expect(toFaqView({ question: "q" }).a).toBe("");
});

test("the project row carries the featured and order fields select.ts filters on", () => {
  const view = toProjectView({ slug: "s", name: "n", featured: true, order: 3 } as never);
  expect(typeof view.featured).toBe("boolean");
  expect(view.featured).toBe(true);
  expect(typeof view.order).toBe("number");
  expect(view.order).toBe(3);
});

test("an empty settings doc renders every section with the default copy", () => {
  const view = toSiteSettingsView({});
  expect(view.copy).toEqual(COPY_DEFAULTS);
  expect(view.signature).toBe("");
  expect(view.socials).toEqual([]);
});

test("nulls, blanks, and empty lists left by older rows fall back field by field", () => {
  const view = toSiteSettingsView({
    copy: {
      hero: { subcopyLead: null, subcopyBody: "   " },
      skills: { heading: { line1: "", line2: null } },
      about: { paragraphs: [] },
      footer: { cycleWords: [""] },
    },
  });
  expect(view.copy).toEqual(COPY_DEFAULTS);
});

test("copy saved in the CMS wins over the defaults", () => {
  const view = toSiteSettingsView({
    copy: {
      hero: { subcopyLead: "Lead.", subcopyBody: "Body." },
      faq: { heading: { line1: "Ask", line2: null } },
      about: { paragraphs: [{ lead: "One.", body: "Two." }, { lead: "", body: null }] },
      footer: { cycleWords: ["ship", "", "learn"] },
      contactCta: { line1: "Hiring?", line2: "Write me." },
    },
  });
  expect(view.copy.hero).toEqual({ subcopyLead: "Lead.", subcopyBody: "Body." });
  expect(view.copy.faq.heading).toEqual({ line1: "Ask", line2: COPY_DEFAULTS.faq.heading.line2 });
  expect(view.copy.about.paragraphs).toEqual([{ lead: "One.", body: "Two." }]);
  expect(view.copy.footer.cycleWords).toEqual(["ship", "learn"]);
  expect(view.copy.contactCta).toEqual({ line1: "Hiring?", line2: "Write me." });
  expect(view.copy.blog).toEqual(COPY_DEFAULTS.blog);
});

test("socials resolve by platform, fall back to the legacy label, and drop what cannot render", () => {
  const view = toSiteSettingsView({
    socials: [
      { platform: "github", url: "https://github.com/a" },
      { label: "X", url: "https://x.com/a" },
      { label: "Twitter", url: "https://twitter.com/a" },
      { platform: "myspace", url: "https://myspace.com/a" },
      { label: "Mastodon", url: "https://mastodon.social/@a" },
      { platform: "linkedin", url: "" },
    ],
  });
  expect(view.socials).toEqual([
    { platform: "github", url: "https://github.com/a" },
    { platform: "x", url: "https://x.com/a" },
    { platform: "x", url: "https://twitter.com/a" },
  ]);
});

test("the signature resolves from the about upload", () => {
  const view = toSiteSettingsView({ about: { signature: { url: "/s.png", sizes: { card: { url: "/s-card.png" } } } } });
  expect(view.signature).toBe("/s-card.png");
});

test("each view gets its own copy of the default lists", () => {
  const a = toSiteSettingsView({});
  const b = toSiteSettingsView({});
  expect(a.copy.footer.cycleWords).toEqual(b.copy.footer.cycleWords);
  expect(a.copy.footer.cycleWords).not.toBe(b.copy.footer.cycleWords);
  expect(a.copy.about.paragraphs).not.toBe(COPY_DEFAULTS.about.paragraphs);
});

test("the project view maps client, repo, tech, and the quote tail", () => {
  const view = toProjectView({
    slug: "s", name: "n", client: "Acme", repoUrl: "https://github.com/a/b", tech: ["Next.js", " ", "Payload"],
    quote: { text: "t", bold: "b", tail: " after." },
  });
  expect(view.client).toBe("Acme");
  expect(view.repoUrl).toBe("https://github.com/a/b");
  expect(view.tech).toEqual(["Next.js", "Payload"]);
  expect(view.quote.tail).toBe(" after.");
});

test("empty detail fields stay off the row, so list payloads keep their shape", () => {
  const view = toProjectView({ slug: "s", name: "n", client: "", repoUrl: null, tech: [], quote: { tail: "" } });
  expect(view).not.toHaveProperty("client");
  expect(view).not.toHaveProperty("repoUrl");
  expect(view).not.toHaveProperty("tech");
  expect(view.quote).not.toHaveProperty("tail");
});

test("tiles with nothing to show and blocks left empty are dropped", () => {
  const view = toProjectView({
    slug: "s", name: "n",
    blocks: [
      { layout: "two", tiles: [{ kind: "image", image: null, src: "" }, { kind: "image", image: { url: "/a.jpg" }, alt: "a" }] },
      { layout: "full", tiles: [{ kind: "video", src: "", poster: { url: "/p.jpg" } }] },
      { layout: "full", tiles: [{ kind: "image" }], description: { heading: "Kept for its text" } },
      { layout: "three", tiles: [] },
    ],
  });
  expect(view.blocks).toHaveLength(2);
  expect(view.blocks[0].tiles).toEqual([{ kind: "image", src: "/a.jpg", alt: "a" }]);
  expect(view.blocks[1]).toEqual({ layout: "full", tiles: [], description: { heading: "Kept for its text", bold: "", text: "" } });
});

test("an empty project doc maps without throwing", () => {
  const view = toProjectView({});
  expect(view.slug).toBe("");
  expect(view.blocks).toEqual([]);
  expect(view.quote).toEqual({ text: "", bold: "", name: "", role: "", avatar: "" });
});

test("the blog empty message falls back to the repo copy", () => {
  expect(toSiteSettingsView({ copy: { blog: { empty: "" } } }).copy.blog.empty).toBe(COPY_DEFAULTS.blog.empty);
  expect(toSiteSettingsView({ copy: { blog: { empty: "Soon." } } }).copy.blog.empty).toBe("Soon.");
});

test("an image tile carries mobileSrc (hero size) only when a mobile image is set", () => {
  const view = toProjectView({
    slug: "s", name: "n",
    blocks: [
      { layout: "full", tiles: [{ kind: "image", image: sized("p"), mobileImage: sized("m"), alt: "a" }] },
      { layout: "full", tiles: [{ kind: "image", image: sized("q"), mobileImage: null, alt: "b" }] },
    ],
  });
  expect(view.blocks[0].tiles[0]).toEqual({ kind: "image", src: "/p-wide.jpg", alt: "a", mobileSrc: "/m-hero.jpg" });
  expect(view.blocks[1].tiles[0]).toEqual({ kind: "image", src: "/q-wide.jpg", alt: "b" });
  expect("mobileSrc" in view.blocks[1].tiles[0]).toBe(false);
});

test("toPostView maps the new fields", () => {
  const view = toPostView({
    slug: "claude-workflow",
    title: "Claude Workflow",
    description: "Notes on shipping with AI.",
    category: "ai-workflow",
    publishedAt: "2026-11-24T00:00:00.000Z",
    image: sized("post"),
    body: "## Heading\n\nBody text.",
    tools: ["Claude"],
    relatedProjects: [{ slug: "jejak-puncak", name: "Jejak Puncak" }, 42],
    discussion: [
      { platform: "threads", url: "https://www.threads.com/@afanaffaidin/post/1" },
      { platform: "nope", url: "https://x" },
    ],
    aiAssisted: true,
  });

  expect(view.category).toBe("AI Workflow");
  expect(view.categoryKey).toBe("ai-workflow");
  expect(view.date).toBe("Nov 24, 2026");
  expect(view.publishedAt).toBe("2026-11-24T00:00:00.000Z");
  expect(view.image).toBe("/post-hero.jpg");
  expect(view.tools).toEqual(["Claude"]);
  expect(view.relatedProjects).toEqual([{ slug: "jejak-puncak", name: "Jejak Puncak" }]);
  expect(view.relatedProjects[0].slug).toBe("jejak-puncak");
  expect(view.discussion).toEqual([
    { platform: "threads", url: "https://www.threads.com/@afanaffaidin/post/1" },
  ]);
  expect(view.aiAssisted).toBe(true);
});

test("toPostView tolerates an empty doc", () => {
  const view = toPostView({});
  expect(view).toEqual({
    slug: "",
    title: "",
    description: "",
    category: "",
    categoryKey: "",
    date: "",
    publishedAt: "",
    image: "",
    body: "",
    tools: [],
    relatedProjects: [],
    discussion: [],
    aiAssisted: false,
  });
});
