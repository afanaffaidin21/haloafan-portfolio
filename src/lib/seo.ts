import type { MetadataRoute } from "next";

/** The public origin, without a trailing slash. */
export function siteOrigin(env: string | undefined = process.env.NEXT_PUBLIC_SERVER_URL): string {
  return (env || "http://localhost:3100").replace(/\/+$/, "");
}

/** Site paths end with a slash: `next.config.ts` sets `trailingSlash: true`. */
const page = (origin: string, path: string) => `${origin}${path.endsWith("/") ? path : `${path}/`}`;

export function sitemapEntries(
  origin: string,
  projectSlugs: string[],
  postSlugs: string[],
): MetadataRoute.Sitemap {
  return [
    { url: page(origin, "/"), changeFrequency: "monthly", priority: 1 },
    { url: page(origin, "/projects"), changeFrequency: "monthly", priority: 0.9 },
    ...projectSlugs.map((slug) => ({ url: page(origin, `/projects/${slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: page(origin, "/blog"), changeFrequency: "weekly", priority: 0.6 },
    ...postSlugs.map((slug) => ({ url: page(origin, `/blog/${slug}`), changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}

export function robotsRules(origin: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}

/** "<page> | <name>", or the name alone when the page has no title. */
export const pageTitle = (title: string, name: string): string => (title ? `${title} | ${name}` : name);

/** The generated 1200x630 card, used whenever Site Settings has no OG image. */
export const DEFAULT_OG_IMAGE = "/og.png";
