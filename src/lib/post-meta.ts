export type PostCategory = "ai-workflow" | "ai-in-products" | "experiments" | "wordpress";

/** Editorial categories available for blog posts and notes. */
export const POST_CATEGORIES: readonly { value: PostCategory; label: string }[] = [
  { value: "ai-workflow", label: "AI Workflow" },
  { value: "ai-in-products", label: "AI in Products" },
  { value: "experiments", label: "Experiments" },
  { value: "wordpress", label: "WordPress" },
];

const postDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Display label for a post category value, or empty string if unknown. */
export function categoryLabel(value: string | null | undefined): string {
  if (!value) return "";
  return POST_CATEGORIES.find((category) => category.value === value)?.label ?? "";
}

/** Format an ISO timestamp as a UTC display date (e.g. "Mar 6, 2025"), or empty string if invalid. */
export function formatPostDate(iso: string | null | undefined): string {
  if (!iso || !iso.trim()) return "";
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return "";
  return postDateFormatter.format(new Date(timestamp));
}
