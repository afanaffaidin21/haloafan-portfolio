/**
 * Builds the project card thumbnails (`<slug>-thumb.jpg`), the phone-pair
 * images (`<slug>-mobile-pair.jpg`), and the phone-only images for small
 * screens (`<slug>-mobile-single.jpg`) from the project screenshots.
 *
 *   npm run thumbs                          # VARIANT from config, into public/img
 *   npm run thumbs -- --variant=B --out=D:/tmp/thumbs/B --only=thumbs   (thumbs|pairs|singles)
 *
 * Geometry lives in ./layout.ts; this file only draws it with sharp.
 */
import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { SOURCES_DIR, THUMBNAILS, VARIANT } from "./config";
import {
  PAIR_CANVAS,
  SHADOW,
  SINGLE_CANVAS,
  THUMB_CANVAS,
  backgroundPixels,
  browserFrame,
  parseHex,
  phonePair,
  phoneSingle,
  shadowRect,
  type Rect,
  type Size,
} from "./layout";

const IMG_DIR = path.join(process.cwd(), "public", "img");

const arg = (name: string): string | undefined =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const variant = (arg("variant") ?? VARIANT) as "A" | "B";
if (variant !== "A" && variant !== "B") throw new Error(`--variant must be A or B, got "${variant}"`);
const outDir = arg("out") ?? IMG_DIR;
const only = arg("only");

const JPEG = { quality: 82, progressive: true, mozjpeg: true } as const;

function background(canvas: Size, accent: string) {
  const pixels = backgroundPixels(canvas, parseHex(accent), variant);
  return sharp(Buffer.from(pixels), { raw: { width: canvas.width, height: canvas.height, channels: 3 } });
}

/** One blurred layer holding the shadow of every rect. */
async function shadowLayer(canvas: Size, rects: Rect[], radius: number): Promise<Buffer> {
  const shapes = rects
    .map((r) => shadowRect(r))
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${radius}" fill="#000" fill-opacity="${SHADOW.opacity}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">${shapes}</svg>`;
  return sharp(Buffer.from(svg)).blur(SHADOW.blur / 2).png().toBuffer();
}

const roundedMask = (size: Size, radius: number): Buffer =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}"><rect width="${size.width}" height="${size.height}" rx="${radius}" fill="#fff"/></svg>`,
  );

async function thumbnail(slug: string, accent: string, source: string): Promise<string> {
  const file = path.join(IMG_DIR, source);
  const meta = await sharp(file).metadata();
  const layout = browserFrame(THUMB_CANVAS, { width: meta.width ?? 0, height: meta.height ?? 0 });
  const { frame, screen, barHeight, radius, dots, crop } = layout;

  const bar = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${barHeight}"><rect width="100%" height="100%" fill="#f4f4f4"/>${dots
      .map((d) => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="#cfcfcf"/>`)
      .join("")}</svg>`,
  );
  const shot = await sharp(file)
    .extract({ left: 0, top: 0, width: crop.width, height: crop.height })
    .resize(screen.width, screen.height)
    .toBuffer();
  const window = await sharp({ create: { width: frame.width, height: frame.height, channels: 4, background: "#f4f4f4" } })
    .composite([
      { input: bar, left: 0, top: 0 },
      { input: shot, left: 0, top: barHeight },
      { input: roundedMask(frame, radius), blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  const out = path.join(outDir, `${slug}-thumb.jpg`);
  await background(THUMB_CANVAS, accent)
    .composite([
      { input: await shadowLayer(THUMB_CANVAS, [frame], radius), left: 0, top: 0 },
      { input: window, left: frame.x, top: frame.y },
    ])
    .jpeg(JPEG)
    .toFile(out);
  return out;
}

const mobileSource = (slug: string, n: 1 | 2): string =>
  path.join(process.cwd(), SOURCES_DIR, `${slug}-mobile-${n}.jpg`);

async function mobilePair(slug: string, accent: string): Promise<string> {
  const files = [mobileSource(slug, 1), mobileSource(slug, 2)];
  const meta = await sharp(files[0]).metadata();
  const { screens, radius } = phonePair(PAIR_CANVAS, { width: meta.width ?? 0, height: meta.height ?? 0 });

  const phones = await Promise.all(
    screens.map((rect, i) =>
      sharp(files[i])
        .resize(rect.width, rect.height, { fit: "cover", position: "top" })
        .composite([{ input: roundedMask(rect, radius), blend: "dest-in" }])
        .png()
        .toBuffer(),
    ),
  );

  const out = path.join(outDir, `${slug}-mobile-pair.jpg`);
  await background(PAIR_CANVAS, accent)
    .composite([
      { input: await shadowLayer(PAIR_CANVAS, screens, radius), left: 0, top: 0 },
      ...screens.map((rect, i) => ({ input: phones[i], left: rect.x, top: rect.y })),
    ])
    .jpeg(JPEG)
    .toFile(out);
  return out;
}

/** The first phone screenshot alone, for the tile shown below 768px. */
async function mobileSingle(slug: string, accent: string): Promise<string> {
  const file = mobileSource(slug, 1);
  const meta = await sharp(file).metadata();
  const { screen, radius } = phoneSingle(SINGLE_CANVAS, { width: meta.width ?? 0, height: meta.height ?? 0 });
  const phone = await sharp(file)
    .resize(screen.width, screen.height, { fit: "cover", position: "top" })
    .composite([{ input: roundedMask(screen, radius), blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = path.join(outDir, `${slug}-mobile-single.jpg`);
  await background(SINGLE_CANVAS, accent)
    .composite([
      { input: await shadowLayer(SINGLE_CANVAS, [screen], radius), left: 0, top: 0 },
      { input: phone, left: screen.x, top: screen.y },
    ])
    .jpeg(JPEG)
    .toFile(out);
  return out;
}

const wanted = (kind: "thumbs" | "pairs" | "singles"): boolean => !only || only === kind;

await fs.mkdir(outDir, { recursive: true });
for (const [slug, { accent, source }] of Object.entries(THUMBNAILS)) {
  const written: string[] = [];
  if (wanted("thumbs")) written.push(await thumbnail(slug, accent, source));
  if (wanted("pairs")) written.push(await mobilePair(slug, accent));
  if (wanted("singles")) written.push(await mobileSingle(slug, accent));
  for (const file of written) {
    const { size } = await fs.stat(file);
    console.log(`${path.basename(file)}  ${Math.round(size / 1024)} KB  (variant ${variant})`);
  }
}
