const CONTROL_OR_SPACE = /[\u0000-\u001f\u007f\s]/;

/**
 * Allows only `https://…`, root-relative `/…` (excluding `//…` and `/\…`),
 * and `#…` fragment targets. Returns `null` for everything else, including
 * `http://`, `javascript:`, `data:`, and control/whitespace tricks.
 */
export function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || CONTROL_OR_SPACE.test(trimmed)) return null;

  if (trimmed.startsWith("#")) return trimmed;

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return null;
    return trimmed;
  }

  if (!/^https:\/\//i.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" || !parsed.hostname) return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function isExternalHref(href: string): boolean {
  return /^https:\/\//i.test(href);
}
