import type { MetadataRoute } from "next";

import { getPosts, getProjects } from "@/lib/content";
import { siteOrigin, sitemapEntries } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return sitemapEntries(siteOrigin(), projects.map((p) => p.slug), posts.map((p) => p.slug));
}
