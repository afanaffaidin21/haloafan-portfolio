import type { SocialKey } from "@/lib/social-icons";

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** Display label for the category (e.g. "AI Workflow"). */
  category: string;
  /** Raw category option value (e.g. "ai-workflow"). */
  categoryKey: string;
  /** Formatted display date from `publishedAt` (e.g. "Nov 24, 2026"). */
  date: string;
  /** ISO date string stored on the post. */
  publishedAt: string;
  image: string;
  body: string;
  tools: string[];
  relatedProjects: { slug: string; name: string }[];
  discussion: { platform: SocialKey; url: string }[];
  aiAssisted: boolean;
};

/** No articles yet: /blog shows its empty state until the owner adds one. */
export const posts: Post[] = [];
