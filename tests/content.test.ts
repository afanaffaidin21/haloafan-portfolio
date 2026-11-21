import { existsSync } from "node:fs";
import { expect, test } from "vitest";

import { projects } from "../src/content/projects";
import { posts } from "../src/content/posts";
import { faqs, services, site, techStack, workHistory } from "../src/content/site";
import { COPY_DEFAULTS } from "../src/lib/copy-defaults";
import { ICON_KEYS, TOOL_KEYS } from "../src/lib/skill-icons";

/** Every string leaf with its path. */
function leaves(node: unknown, path = ""): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => leaves(v, `${path}.${k}`));
  return [];
}

test("the copy defaults carry no empty string", () => {
  expect(leaves(COPY_DEFAULTS).filter(([, text]) => text.trim() === "").map(([at]) => at)).toEqual([]);
});

test("no shipped copy uses an em dash", () => {
  const all = leaves({ COPY_DEFAULTS, site, faqs, workHistory, services, projects });
  expect(all.filter(([, text]) => text.includes("—")).map(([at]) => at)).toEqual([]);
});

test("every skill row and tile resolves through the closed icon registries", () => {
  expect(services.map((s) => s.icon).filter((key) => !ICON_KEYS.includes(key))).toEqual([]);
  expect(techStack.filter((name) => !TOOL_KEYS.includes(name))).toEqual([]);
});

test("every image and file the seed references exists in public/", () => {
  const paths = [
    site.avatar,
    site.resume,
    ...projects.flatMap((p) => [
      p.thumbnail,
      ...p.blocks.flatMap((b) => b.tiles.flatMap((t) => [t.src, t.kind === "image" ? (t.mobileSrc ?? "") : ""])),
    ]),
  ].filter(Boolean);
  expect(paths.filter((p) => !existsSync(`public${p}`))).toEqual([]);
});

test("projects: unique slugs, four featured, a client only on client work", () => {
  expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  expect(projects.filter((p) => p.featured).map((p) => p.slug)).toEqual(projects.slice(0, 4).map((p) => p.slug));
  for (const p of projects) expect(Boolean(p.client), p.slug).toBe(p.kind === "client");
});

test("there are no posts yet, and the About stack fits its three cards", () => {
  expect(posts).toEqual([]);
  expect(workHistory.length).toBeLessThanOrEqual(3);
});

test("each project shows its two phone screens as one full-width mobile-pair tile", () => {
  for (const p of projects) {
    const pairs = p.blocks.filter((b) => b.tiles.some((t) => t.src === `/img/${p.slug}-mobile-pair.jpg`));
    expect(pairs.map((b) => [b.layout, b.tiles.length]), p.slug).toEqual([["full", 1]]);
    expect(pairs[0].description?.heading, p.slug).toBeTruthy();
    const loose = p.blocks.flatMap((b) => b.tiles).filter((t) => /-mobile-[12]\.jpg$/.test(t.src));
    expect(loose, p.slug).toEqual([]);
    expect(p.thumbnail).toBe(`/img/${p.slug}-thumb.jpg`);
  }
});

test("each mobile-pair tile swaps in the project's single-phone image on small screens", () => {
  for (const p of projects) {
    const tile = p.blocks.flatMap((b) => b.tiles).find((t) => t.src === `/img/${p.slug}-mobile-pair.jpg`);
    expect(tile && tile.kind === "image" ? tile.mobileSrc : undefined, p.slug).toBe(`/img/${p.slug}-mobile-single.jpg`);
  }
});

test("Karya Pratama tells the 2024 WordPress build and the 2026 headless rebuild", () => {
  const kpp = projects.find((p) => p.slug === "karya-pratama-packaging");
  expect(kpp).toBeDefined();
  const text = JSON.stringify(kpp);
  expect(text).not.toContain("built in WordPress with Elementor and Astra");
  expect(kpp?.tech).toEqual(expect.arrayContaining(["Next.js", "WPGraphQL", "WordPress", "Elementor"]));
  expect(kpp?.year).toBe("2024-2026");
  // The deployed repo is private, so no code link.
  expect(kpp?.repoUrl).toBe("");
});
