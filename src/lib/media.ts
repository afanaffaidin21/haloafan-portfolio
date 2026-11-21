export type MediaRef =
  | string
  | number
  | null
  | undefined
  | { url?: string | null; sizes?: Record<string, { url?: string | null } | null> | null };

/**
 * Payload's upload URLs pick up Next's `trailingSlash`, producing
 * `/api/media/file/<name>/`, which only 308-redirects to the real file.
 * Strip it so every image loads in one request.
 */
const normalize = (url: string): string =>
  url.replace(/(\/api\/media\/file\/[^/]+)\/$/, "$1");

/**
 * Resolve a Payload Media doc, or a legacy public path, to an image URL.
 * Prefers the requested size when the doc exposes it, then the original url.
 */
export function mediaUrl(ref: MediaRef, size?: string): string | null {
  if (typeof ref === "string") return ref ? normalize(ref) : null;
  if (!ref || typeof ref !== "object") return null;

  if (size) {
    const sized = ref.sizes?.[size]?.url;
    if (sized) return normalize(sized);
  }

  return ref.url ? normalize(ref.url) : null;
}
