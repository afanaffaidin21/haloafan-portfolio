import { expect, test } from "vitest";
import { DEFAULT_OG_IMAGE, pageTitle, robotsRules, siteOrigin, sitemapEntries } from "../../src/lib/seo";

test("the origin drops a trailing slash and falls back to the local dev server", () => {
  expect(siteOrigin("https://haloafan.com/")).toBe("https://haloafan.com");
  expect(siteOrigin(undefined)).toBe("http://localhost:3100");
});

test("the sitemap lists home, projects, every project, blog, and every post with trailing slashes", () => {
  const urls = sitemapEntries("https://haloafan.com", ["jejak-puncak", "menulis-id"], ["first-post"]).map((e) => e.url);
  expect(urls).toEqual([
    "https://haloafan.com/",
    "https://haloafan.com/projects/",
    "https://haloafan.com/projects/jejak-puncak/",
    "https://haloafan.com/projects/menulis-id/",
    "https://haloafan.com/blog/",
    "https://haloafan.com/blog/first-post/",
  ]);
});

test("robots allows everything but /admin and /api and points at the sitemap", () => {
  expect(robotsRules("https://haloafan.com")).toEqual({
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: "https://haloafan.com/sitemap.xml",
  });
});

test("page titles read '<page> | <name>'", () => {
  expect(pageTitle("Jejak Puncak", "Afan Affaidin")).toBe("Jejak Puncak | Afan Affaidin");
  expect(pageTitle("", "Afan Affaidin")).toBe("Afan Affaidin");
  expect(DEFAULT_OG_IMAGE).toBe("/og.png");
});
