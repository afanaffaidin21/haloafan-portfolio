import { revalidatePath } from "next/cache";

/**
 * Drop the cached copy of every page under the site layout so the next request
 * renders the content that was just saved. `"layout"` covers the five public
 * routes at once, including the dynamic `[slug]` entries.
 *
 * The Payload hooks that call this also fire outside a Next request — the seed
 * script writes through the local API in its own process. There is no build
 * store to record the invalidation against, so Next throws. That one failure is
 * expected in that context and ignored; anything else still surfaces.
 */
export function revalidateSite(): void {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    if (!isMissingStaticGenerationStore(error)) throw error;
  }
}

/** `Invariant: static generation store missing in revalidatePath(...)`. */
function isMissingStaticGenerationStore(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.startsWith("Invariant: static generation store missing")
  );
}
