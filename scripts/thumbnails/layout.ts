/**
 * Pure layout math for the project image generator. Every number the
 * renderer in `build.ts` draws comes from here, so the geometry is tested
 * without touching an image.
 */

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

/** No important element may sit in this share of each canvas edge. */
export const SAFE_EDGE = 0.08;

/** The soft shadow under every frame and phone screen. */
export const SHADOW = { blur: 40, opacity: 0.22, offsetY: 18 } as const;

export const THUMB_CANVAS: Size = { width: 1600, height: 1200 };
export const PAIR_CANVAS: Size = { width: 2400, height: 1500 };
/**
 * The phone-only image for screens below 768px. Tall enough that one phone
 * at 88% of the height is ~73% of the width, so in the 302px tile of a 390px
 * viewport the phone screen renders at least 220px wide.
 */
export const SINGLE_CANVAS: Size = { width: 1200, height: 2160 };

/** The inner rectangle that keeps `SAFE_EDGE` clear on every side. */
export function safeArea(canvas: Size, edge = SAFE_EDGE): Rect {
  const x = Math.round(canvas.width * edge);
  const y = Math.round(canvas.height * edge);
  return { x, y, width: canvas.width - 2 * x, height: canvas.height - 2 * y };
}

export function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export type BrowserFrame = {
  /** The whole window: top bar plus screenshot. */
  frame: Rect;
  /** The screenshot area inside the window, under the top bar. */
  screen: Rect;
  barHeight: number;
  radius: number;
  /** Centres of the three window dots, relative to the frame. */
  dots: { cx: number; cy: number; r: number }[];
  /** Source pixels to keep, from the top of the screenshot, before resizing to `screen`. */
  crop: Size;
};

/**
 * A browser window 80% of the canvas wide, centred, starting at y=168. The
 * screenshot is scaled to the window width and cut from the top, and the
 * window ends inside the safe area instead of running off the canvas.
 */
export function browserFrame(
  canvas: Size,
  source: Size,
  opts: { widthShare?: number; top?: number; barHeight?: number; radius?: number } = {},
): BrowserFrame {
  const { widthShare = 0.8, top = 168, barHeight = 40, radius = 18 } = opts;
  const width = Math.round(canvas.width * widthShare);
  const x = Math.round((canvas.width - width) / 2);
  const safe = safeArea(canvas);
  const maxScreen = safe.y + safe.height - top - barHeight;
  const scale = width / source.width;
  const screenHeight = Math.min(Math.round(source.height * scale), maxScreen);
  const crop = { width: source.width, height: Math.min(source.height, Math.round(screenHeight / scale)) };
  const dotR = 6;
  return {
    frame: { x, y: top, width, height: barHeight + screenHeight },
    screen: { x, y: top + barHeight, width, height: screenHeight },
    barHeight,
    radius,
    dots: [0, 1, 2].map((i) => ({ cx: 22 + i * 20, cy: barHeight / 2, r: dotR })),
    crop,
  };
}

/**
 * Two phone screens side by side: each ~84% of the canvas height, ~6% of
 * the canvas width apart, the pair centred on the canvas.
 */
export function phonePair(
  canvas: Size,
  source: Size,
  opts: { heightShare?: number; gapShare?: number; radius?: number } = {},
): { screens: [Rect, Rect]; radius: number } {
  const { heightShare = 0.84, gapShare = 0.06, radius = 44 } = opts;
  const height = Math.round(canvas.height * heightShare);
  const width = Math.round((height * source.width) / source.height);
  const gap = Math.round(canvas.width * gapShare);
  const x = Math.round((canvas.width - (2 * width + gap)) / 2);
  const y = Math.round((canvas.height - height) / 2);
  return {
    screens: [
      { x, y, width, height },
      { x: x + width + gap, y, width, height },
    ],
    radius,
  };
}

/** One phone screen centred on the canvas, ~88% of its height. */
export function phoneSingle(
  canvas: Size,
  source: Size,
  opts: { heightShare?: number; radius?: number } = {},
): { screen: Rect; radius: number } {
  const { heightShare = 0.88, radius = 44 } = opts;
  const height = Math.round(canvas.height * heightShare);
  const width = Math.round((height * source.width) / source.height);
  return {
    screen: { x: Math.round((canvas.width - width) / 2), y: Math.round((canvas.height - height) / 2), width, height },
    radius,
  };
}

/** Where a rect's shadow is drawn before blurring. */
export function shadowRect(rect: Rect, offsetY: number = SHADOW.offsetY): Rect {
  return { ...rect, y: rect.y + offsetY };
}

export type Rgb = [number, number, number];

export function parseHex(hex: string): Rgb {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`"${hex}" is not a #rrggbb colour`);
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** The colour `share` darker: each channel scaled by `1 - share`. */
export function darken([r, g, b]: Rgb, share: number): Rgb {
  const k = 1 - share;
  return [Math.round(r * k), Math.round(g * k), Math.round(b * k)];
}

/** Row colour of a vertical gradient from `top` (t=0) to `bottom` (t=1). */
export function mix(top: Rgb, bottom: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => top[i] + (bottom[i] - top[i]) * t) as Rgb;
}

/** mulberry32: a small seeded PRNG, so the grain is identical on every build. */
export function seededNoise(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Raw RGB pixels of the background: the accent alone (variant A), or a
 * vertical gradient to 10% darker plus monochrome grain (variant B).
 */
export function backgroundPixels(
  canvas: Size,
  accent: Rgb,
  variant: "A" | "B",
  grain = { amplitude: 3, seed: 20261121 },
): Uint8Array {
  const { width, height } = canvas;
  const px = new Uint8Array(width * height * 3);
  const bottom = variant === "B" ? darken(accent, 0.1) : accent;
  const noise = seededNoise(grain.seed);
  for (let y = 0; y < height; y++) {
    const row = mix(accent, bottom, height > 1 ? y / (height - 1) : 0);
    for (let x = 0; x < width; x++) {
      const n = variant === "B" ? Math.round((noise() * 2 - 1) * grain.amplitude) : 0;
      const i = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) px[i + c] = Math.max(0, Math.min(255, Math.round(row[c]) + n));
    }
  }
  return px;
}
