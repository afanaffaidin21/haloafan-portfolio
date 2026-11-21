/**
 * Permanent redirects from the old haloafan.com portfolio (docs/legacy-urls.md).
 * The old site had an unprefixed default locale (en) and an /id prefix; this
 * site has neither. Destinations end with a slash because next.config sets
 * `trailingSlash: true`, so a redirect lands in one hop.
 *
 * Paths the old and new sites share (/, /projects, /blog,
 * /projects/menulis-id, /projects/universitas-sunan-gresik) are not
 * redirected: they already serve this site. /api/contact and
 * /api/revalidate/cms are left to 404.
 */
export type LegacyRedirect = { source: string; destination: string; permanent: true };

const L = ":locale(en|id)";

/** Old project and experiment slugs that exist here under a new or the same slug. */
export const LEGACY_PROJECTS: Record<string, string> = {
  "karyapratama-packaging": "karya-pratama-packaging",
  "menulis-id": "menulis-id",
  "universitas-sunan-gresik": "universitas-sunan-gresik",
};
export const LEGACY_EXPERIMENTS: Record<string, string> = {
  "jejak-puncak": "jejak-puncak",
  "rangkul-cerita": "rangkul-cerita",
};
/**
 * The owner's old blog posts, by old slug. They will move to this blog; until
 * a post exists here it points at the blog index. When one is published,
 * change its value to "/blog/<new-slug>/".
 */
export const LEGACY_POSTS: Record<string, string> = {
  "building-layouts-without-elementor": "/blog/",
  "understanding-block-theme-structure-theme-json": "/blog/",
  "understanding-gutenberg-editor-more-deeply": "/blog/",
  "understanding-the-philosophy-behind-gutenberg-modern-wordpress": "/blog/",
};

const to = (source: string, destination: string): LegacyRedirect => ({ source, destination, permanent: true });

/** First match wins, so specific rules come before the catch-alls. */
export const legacyRedirects: LegacyRedirect[] = [
  to(`/${L}`, "/"),
  to(`/${L}/about`, "/"),
  to("/about", "/"),
  to(`/${L}/contact`, "/#contact"),
  to("/contact", "/#contact"),
  ...Object.entries(LEGACY_EXPERIMENTS).map(([old, slug]) => to(`/${L}?/experiments/${old}`, `/projects/${slug}/`)),
  to(`/${L}?/experiments/:rest*`, "/projects/"),
  to("/projects/karyapratama-packaging", "/projects/karya-pratama-packaging/"),
  ...Object.entries(LEGACY_PROJECTS).map(([old, slug]) => to(`/${L}/projects/${old}`, `/projects/${slug}/`)),
  to(`/${L}/projects/:rest*`, "/projects/"),
  ...Object.entries(LEGACY_POSTS).flatMap(([old, destination]) => [
    to(`/blog/${old}`, destination),
    to(`/${L}/blog/${old}`, destination),
  ]),
  to(`/${L}/blog/:rest*`, "/blog/"),
];
