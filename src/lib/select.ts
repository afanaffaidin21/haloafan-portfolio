/** Featured projects in explicit order, capped for the grid. */
export function featuredProjects<T extends { featured?: boolean | null; order?: number | null }>(
  items: T[],
  cap = 4,
): T[] {
  return items
    .filter((item) => item.featured)
    .sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY))
    .slice(0, cap);
}

/**
 * Newest posts first. Dates are display strings ("Mar 6, 2025"), so they are
 * compared by parsed time — never lexicographically.
 */
export function latestPosts<T extends { date: string }>(items: T[], cap = 6): T[] {
  const time = (date: string) => {
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  };

  return [...items].sort((a, b) => time(b.date) - time(a.date)).slice(0, cap);
}

/** First three posts drive the featured / second / third article slots. */
export function articlesLayout<T>(items: T[]): { featured: T; second: T; third: T } | null {
  if (items.length < 3) return null;
  const [featured, second, third] = items;
  return { featured, second, third };
}

/** Measured work-history card geometry: card 77, pitch 89, button block 105. */
export function workHistoryHeight(count: number, expanded: boolean): number {
  if (count <= 0) return 0;
  return expanded ? count * 77 + (count - 1) * 12 + 105 : 77 + (count - 1) * 8 + 46;
}

/**
 * The hero headline is two lines, the first muted. Split the single-line
 * tagline at its midpoint word so any copy keeps that shape; under four words
 * it stays one line. An empty tagline falls back to the name, so the page
 * never ships an empty <h1>.
 */
export function heroLines(tagline: string, name: string): string[] {
  const text = tagline.trim() || name.trim();
  const words = text.split(/\s+/);
  if (!tagline.trim() || words.length < 4) return [text];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
