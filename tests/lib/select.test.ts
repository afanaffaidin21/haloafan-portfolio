import { expect, test } from "vitest";
import { articlesLayout, featuredProjects, heroLines, latestPosts, workHistoryHeight } from "../../src/lib/select";

test("keeps featured only, ordered, capped at 4", () => {
  const items = [
    { order: 3, featured: true, id: "c" },
    { order: 1, featured: true, id: "a" },
    { order: 2, featured: false, id: "b" },
    { order: 4, featured: true, id: "d" },
    { order: 5, featured: true, id: "e" },
    { order: 6, featured: true, id: "f" },
  ];
  expect(featuredProjects(items).map((i) => i.id)).toEqual(["a", "c", "d", "e"]);
});
test("empty project list stays empty", () => {
  expect(featuredProjects([])).toEqual([]);
});
test("latest posts sort newest first and cap at 6", () => {
  const items = Array.from({ length: 8 }, (_, i) => ({ date: `Mar ${i + 1}, 2025`, id: i }));
  expect(latestPosts(items)).toHaveLength(6);
  expect(latestPosts([{ date: "Mar 6, 2025" }, { date: "Apr 2, 2025" }])[0].date).toBe("Apr 2, 2025");
});
test("articles layout needs three posts", () => {
  expect(articlesLayout([{ id: 1 }, { id: 2 }])).toBeNull();
  expect(articlesLayout([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual({ featured: { id: 1 }, second: { id: 2 }, third: { id: 3 } });
});
test("work history height derives from count", () => {
  expect(workHistoryHeight(3, true)).toBe(360);
  expect(workHistoryHeight(3, false)).toBe(139);
  expect(workHistoryHeight(1, true)).toBe(182);
  expect(workHistoryHeight(0, true)).toBe(0);
});

test("hero lines split a tagline of four or more words at its midpoint word", () => {
  expect(heroLines("Web developer for WordPress and Next.js", "Afan")).toEqual([
    "Web developer for",
    "WordPress and Next.js",
  ]);
  expect(heroLines("  Design that delivers results.  ", "Afan")).toEqual(["Design that", "delivers results."]);
});
test("a short tagline stays one line", () => {
  expect(heroLines("Hello there", "Afan")).toEqual(["Hello there"]);
});
test("an empty tagline falls back to the name as one line", () => {
  expect(heroLines("", "Afan Affaidin Web Developer Surabaya")).toEqual(["Afan Affaidin Web Developer Surabaya"]);
  expect(heroLines("   ", "Afan")).toEqual(["Afan"]);
});
