const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG_RE.test(slug);
}

export function previewTarget(slug: string): string {
  return `/blog/${slug}/`;
}

export function previewUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, "")}/preview/?slug=${encodeURIComponent(slug)}`;
}
