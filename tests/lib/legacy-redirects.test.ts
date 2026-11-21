import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "vitest";

import { projects } from "../../src/content/projects";
import { LEGACY_POSTS, legacyRedirects } from "../../src/lib/legacy-redirects";

// The matcher Next itself compiles redirect sources with.
const { pathToRegexp } = createRequire(import.meta.url)("next/dist/compiled/path-to-regexp") as {
  pathToRegexp: (path: string, keys?: unknown[], options?: { strict?: boolean; sensitive?: boolean }) => RegExp;
};
const matchers = legacyRedirects.map((r) => ({ ...r, re: pathToRegexp(r.source, [], { strict: false }) }));
const resolve = (path: string) => matchers.find((m) => m.re.test(path));

const legacyPaths = [...readFileSync("docs/legacy-urls.md", "utf8").matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1]);
const newSlugs = projects.map((p) => p.slug);
/** Paths this site serves itself; a redirect must never shadow them. */
const sitePaths = ["/", "/projects", "/blog", ...newSlugs.map((s) => `/projects/${s}`), "/sitemap.xml", "/robots.txt", "/og.png"];

/** Where each old URL must end up, by the rules the owner approved. */
function expected(path: string): string {
  const bare = path.replace(/^\/(en|id)(?=\/|$)/, "") || "/";
  if (bare === "/" || bare === "/about") return "/";
  if (bare === "/contact") return "/#contact";
  const exp = /^\/experiments\/([^/]+)$/.exec(bare);
  if (exp) return newSlugs.includes(exp[1]) ? `/projects/${exp[1]}/` : "/projects/";
  if (bare === "/experiments" || bare === "/projects") return "/projects/";
  const proj = /^\/projects\/([^/]+)$/.exec(bare);
  if (proj) return proj[1] === "karyapratama-packaging" ? "/projects/karya-pratama-packaging/" : `/projects/${proj[1]}/`;
  const post = /^\/blog\/([^/]+)$/.exec(bare);
  if (post) return LEGACY_POSTS[post[1]] ?? "/blog/";
  if (bare === "/blog") return "/blog/";
  throw new Error(`no rule for ${path}`);
}

test("the legacy URL list was read", () => {
  expect(legacyPaths.length).toBe(51);
});

test("every old URL is redirected to its new page, or already is one", () => {
  const wrong: string[] = [];
  for (const path of legacyPaths) {
    const want = expected(path);
    const hit = resolve(path);
    const lands = hit ? hit.destination : `${path === "/" ? "/" : `${path}/`}`;
    if (!hit && !sitePaths.includes(path)) wrong.push(`${path}: no redirect and not a page here`);
    else if (lands !== want && !(lands === "/" && want === "/")) wrong.push(`${path}: lands on ${lands}, want ${want}`);
  }
  expect(wrong).toEqual([]);
});

test("redirects are permanent and never touch the admin, the API, Next assets, or this site's own pages", () => {
  expect(legacyRedirects.every((r) => r.permanent)).toBe(true);
  const guarded = ["/admin", "/admin/collections/projects", "/api/media/file/a.jpg", "/api/contact", "/api/revalidate/cms", "/_next/static/chunk.js", ...sitePaths];
  expect(guarded.filter((p) => resolve(p)).map((p) => `${p} -> ${resolve(p)?.destination}`)).toEqual([]);
});

test("each old post redirects on its own line, prefixed or not, so it can move to its new slug", () => {
  for (const old of Object.keys(LEGACY_POSTS)) {
    for (const path of [`/blog/${old}`, `/id/blog/${old}`, `/en/blog/${old}`]) {
      expect(resolve(path)?.source, path).toMatch(new RegExp(`/blog/${old}$`));
    }
  }
});

test("every destination is a page this site serves", () => {
  const pages = new Set(["/", "/#contact", "/projects/", "/blog/", ...newSlugs.map((s) => `/projects/${s}/`), ...Object.values(LEGACY_POSTS)]);
  expect(legacyRedirects.filter((r) => !pages.has(r.destination)).map((r) => r.destination)).toEqual([]);
});
