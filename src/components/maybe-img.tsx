import type { ComponentProps } from "react";

/**
 * An `<img>` that renders only when it has a source. An empty CMS upload
 * leaves its frame in place instead of a broken-image icon, because the
 * wrapper owns the size, radius, and aspect ratio. Every prop is passed
 * through untouched, alt text included.
 */
export function MaybeImg(props: ComponentProps<"img">) {
  if (!props.src) return null;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />;
}

/**
 * Class suffix for a wrapper the image normally covers: with no image it gets
 * the muted surface so the empty frame still reads as a frame. With an image
 * it returns "" and the wrapper's classes stay exactly as they were.
 */
export function emptyFrame(src: string | null | undefined): string {
  return src ? "" : " bg-surface-muted";
}
