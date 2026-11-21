/**
 * Project image generator input. `accent` is only used here: it paints the
 * card thumbnail and the phone-pair background and is not stored in Payload.
 *
 * A new project needs an entry below, `public/img/<slug>-desktop-1.jpg`
 * (also shown on the project page), and `<slug>-mobile-1.jpg` and
 * `<slug>-mobile-2.jpg` in `SOURCES_DIR`, then `npm run thumbs`.
 */
/**
 * Screenshots only the generator reads. They live outside public/, so they
 * are not served, not deployed, and not uploaded by the seed.
 */
export const SOURCES_DIR = "scripts/thumbnails/sources";

export type ThumbnailSource = { accent: `#${string}`; source: string };

export const THUMBNAILS: Record<string, ThumbnailSource> = {
  "jejak-puncak": { accent: "#3f5b4e", source: "jejak-puncak-desktop-1.jpg" },
  "namaka-photography": { accent: "#d4a89a", source: "namaka-photography-desktop-1.jpg" },
  "karya-pratama-packaging": { accent: "#b39d84", source: "karya-pratama-packaging-desktop-1.jpg" },
  "universitas-sunan-gresik": { accent: "#2f5f8a", source: "universitas-sunan-gresik-desktop-1.jpg" },
  "rangkul-cerita": { accent: "#6f9a86", source: "rangkul-cerita-desktop-1.jpg" },
  "menulis-id": { accent: "#bdb4a6", source: "menulis-id-desktop-1.jpg" },
};

/** Background style: A is the flat accent, B a gradient to 10% darker with fine grain. */
/** Chosen by the owner on 2026-11-21. */
export const VARIANT: "A" | "B" = "A";
