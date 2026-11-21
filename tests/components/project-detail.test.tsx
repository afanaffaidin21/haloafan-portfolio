import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectBlocks, ProjectHero, ProjectQuote } from "../../src/components/project-detail";
import { toProjectView } from "../../src/lib/content";

const hero = (doc: Parameters<typeof toProjectView>[0]) =>
  renderToStaticMarkup(<ProjectHero project={toProjectView({ slug: "s", name: "Mango", ...doc })} />);
const quote = (doc: Parameters<typeof toProjectView>[0]["quote"]) =>
  renderToStaticMarkup(<ProjectQuote quote={toProjectView({ quote: doc }).quote} />);

test("a project with only a name renders no empty link, label, or paragraph", () => {
  const html = hero({});
  expect(html).not.toContain("View Live Site");
  expect(html).not.toContain("View Code");
  expect(html).not.toContain('href=""');
  expect(html).not.toContain("Year");
  expect(html).not.toContain("Scope of Work");
  expect(html).not.toContain("Tech");
  expect(html).not.toContain("<p class=\"t-body max-w-[580px] text-ink-2\">");
  // The heading and the client fall back to the name, so neither is blank.
  expect(html).toContain('<h1 class="t-h1 max-w-[580px]">Mango</h1>');
  expect(html).toContain('<span class="font-semibold">Mango</span>');
});

test("the client field wins over the name", () => {
  expect(hero({ client: "Acme" })).toContain('<span class="font-semibold">Acme</span>');
});

test("live and repo links sit in one row; either alone stays a bare link", () => {
  const both = hero({ liveUrl: "https://mango.example", repoUrl: "https://github.com/a/mango" });
  expect(both).toContain('<div class="flex flex-wrap items-center justify-center gap-[18px]"><a href="https://mango.example"');
  expect(both).toContain("View Code");
  const codeOnly = hero({ repoUrl: "https://github.com/a/mango" });
  expect(codeOnly).toContain('href="https://github.com/a/mango"');
  expect(codeOnly).not.toContain("View Live Site");
  expect(codeOnly).not.toContain("gap-[18px]");
});

test("tech renders as scope-styled chips under its own label, duplicates included", () => {
  const html = hero({ scope: ["Brand", "Brand"], tech: ["Next.js", "Payload"] });
  expect(html).toContain('<p class="t-body text-ink-2">Tech</p>');
  expect(html.match(/t-micro rounded-full bg-surface px-3 py-2 shadow-card/g)).toHaveLength(4);
  expect(html.indexOf("Scope of Work")).toBeLessThan(html.indexOf(">Tech<"));
});

test("a quote with neither text nor bold renders no section", () => {
  expect(quote({ name: "Theo", role: "Founder", avatar: "/t.jpg" })).toBe("");
});

test("the quote renders text, bold, and tail like the big quote", () => {
  const html = quote({ text: "Our cans sell out ", bold: "before the boxes open", tail: ", every time." });
  expect(html).toContain('Our cans sell out <strong class="font-semibold">before the boxes open</strong>, every time.</p>');
});

test("quote attribution hides when it has nothing to show", () => {
  const bare = quote({ text: "Text only." });
  expect(bare).not.toContain("flex items-center gap-3");
  expect(bare).not.toContain("<img");
  const named = quote({ text: "Text.", name: "Theo" });
  expect(named).toContain('<p class="t-label whitespace-pre">Theo</p>');
  expect(named).not.toContain("t-micro text-ink-2");
});

test("block descriptions hide their empty parts, and no blocks means no section", () => {
  const view = toProjectView({ blocks: [{ layout: "full", tiles: [], description: { text: "Only text." } }] });
  const html = renderToStaticMarkup(<ProjectBlocks blocks={view.blocks} />);
  expect(html).toContain('<p class="t-body">Only text.</p>');
  expect(html).not.toContain("<h2");
  expect(html).not.toContain("grid gap-2");
  expect(renderToStaticMarkup(<ProjectBlocks blocks={[]} />)).toBe("");
});

test("an experiment without a client says it is a personal project instead of naming itself the client", () => {
  const html = hero({ kind: "experiment" });
  expect(html).toContain('<span class="font-semibold">Personal project</span>');
  expect(html).not.toContain('<span class="text-ink-2">Client</span>');
  expect(html).not.toContain('<span class="font-semibold">Mango</span>');
});

test("client work keeps the client line", () => {
  const html = hero({ kind: "client", client: "Acme" });
  expect(html).toContain('<span class="text-ink-2">Client</span>');
  expect(html).not.toContain("Personal project");
});

const blocks = (tile: Record<string, unknown>) =>
  renderToStaticMarkup(<ProjectBlocks blocks={[{ layout: "full", tiles: [tile as never] }]} />);

test("a tile with a mobile image swaps it in below 768px through <picture>", () => {
  const html = blocks({ kind: "image", src: "/pair.jpg", alt: "Two phones", mobileSrc: "/single.jpg" });
  expect(html).toContain('<picture class="contents"><source media="(max-width: 767px)" srcSet="/single.jpg"/><img src="/pair.jpg" alt="Two phones"');
  expect(html.match(/<img/g)).toHaveLength(1);
});

test("a tile without a mobile image keeps the plain <img> markup", () => {
  const html = blocks({ kind: "image", src: "/pair.jpg", alt: "Two phones" });
  expect(html).not.toContain("<picture");
  expect(html).not.toContain("<source");
  expect(html).toContain('<div class="relative overflow-hidden rounded-[16px] bg-surface-muted"><img src="/pair.jpg" alt="Two phones"');
});
