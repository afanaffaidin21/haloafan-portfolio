import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content";

export const revalidate = 3600;

/**
 * The default share card, 1200x630, in the invert block of design.md:
 * --color-invert background, the name in --color-invert-ink, the role in
 * --color-invert-ink-2, the stack and domain in --color-invert-ink-3. Used
 * when Site Settings has no OG image.
 */
export async function GET() {
  const { name, role } = await getSiteSettings();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 80, background: "#000000" }}>
        <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -3, lineHeight: 1, color: "#ffffff" }}>{name}</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#828282" }}>{role}</div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#b8b8b8" }}>{"WordPress & Next.js · haloafan.com"}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
