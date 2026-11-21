import { existsSync } from "node:fs";
import { expect, test } from "vitest";

import { readdirSync } from "node:fs";

import { SOURCES_DIR, THUMBNAILS, VARIANT } from "../../scripts/thumbnails/config";
import {
  PAIR_CANVAS,
  SINGLE_CANVAS,
  THUMB_CANVAS,
  backgroundPixels,
  browserFrame,
  contains,
  darken,
  parseHex,
  phonePair,
  phoneSingle,
  safeArea,
  seededNoise,
  shadowRect,
} from "../../scripts/thumbnails/layout";
import { projects } from "../../src/content/projects";

const DESKTOP_2X = { width: 2880, height: 1800 };
const MOBILE_2X = { width: 780, height: 1688 };

test("the config carries all six project slugs with valid #rrggbb accents", () => {
  expect(Object.keys(THUMBNAILS).sort()).toEqual(projects.map((p) => p.slug).sort());
  expect(Object.keys(THUMBNAILS)).toHaveLength(6);
  for (const [slug, { accent, source }] of Object.entries(THUMBNAILS)) {
    expect(accent, slug).toMatch(/^#[0-9a-f]{6}$/i);
    expect(source).toBe(`${slug}-desktop-1.jpg`);
    expect(existsSync(`public/img/${source}`), source).toBe(true);
    for (const file of [`${slug}-mobile-1.jpg`, `${slug}-mobile-2.jpg`]) {
      expect(existsSync(`${SOURCES_DIR}/${file}`), file).toBe(true);
    }
  }
  expect(["A", "B"]).toContain(VARIANT);
});

test("the safe area keeps 8% clear on every edge", () => {
  expect(safeArea(THUMB_CANVAS)).toEqual({ x: 128, y: 96, width: 1344, height: 1008 });
  expect(safeArea(PAIR_CANVAS)).toEqual({ x: 192, y: 120, width: 2016, height: 1260 });
});

test("the browser frame is 80% wide, centred, starts at y=168, and shows the whole 2x screenshot", () => {
  const f = browserFrame(THUMB_CANVAS, DESKTOP_2X);
  expect(f.frame).toEqual({ x: 160, y: 168, width: 1280, height: 840 });
  expect(f.screen).toEqual({ x: 160, y: 208, width: 1280, height: 800 });
  expect(f.crop).toEqual(DESKTOP_2X);
  expect(f.radius).toBe(18);
  expect(f.barHeight).toBe(40);
  expect(f.dots).toHaveLength(3);
  expect(contains(safeArea(THUMB_CANVAS), f.frame)).toBe(true);
});

test("a tall screenshot is cut from the top so the frame never runs off the canvas", () => {
  const f = browserFrame(THUMB_CANVAS, { width: 2880, height: 6000 });
  const safe = safeArea(THUMB_CANVAS);
  expect(f.frame.y + f.frame.height).toBe(safe.y + safe.height);
  expect(f.screen.height).toBe(896);
  expect(f.crop).toEqual({ width: 2880, height: Math.round(896 / (1280 / 2880)) });
  expect(contains(safe, f.frame)).toBe(true);
});

test("the phone pair is 84% tall, 6% apart, centred, and inside the safe area", () => {
  const { screens, radius } = phonePair(PAIR_CANVAS, MOBILE_2X);
  const [a, b] = screens;
  expect(radius).toBe(44);
  expect(a.height).toBe(1260);
  expect(a.width).toBe(Math.round((1260 * 780) / 1688));
  expect(b.x - (a.x + a.width)).toBe(144);
  expect(a.x).toBe(PAIR_CANVAS.width - (b.x + b.width));
  expect(a.y).toBe((PAIR_CANVAS.height - a.height) / 2);
  for (const s of screens) expect(contains(safeArea(PAIR_CANVAS), s)).toBe(true);
});

test("colours parse from hex and darken by a share of each channel", () => {
  expect(parseHex("#3f5b4e")).toEqual([63, 91, 78]);
  expect(darken([100, 200, 50], 0.1)).toEqual([90, 180, 45]);
  expect(() => parseHex("3f5b4e")).toThrow();
});

test("the grain is deterministic and stays small", () => {
  const a = seededNoise(7);
  const b = seededNoise(7);
  const seq = Array.from({ length: 5 }, () => a());
  expect(Array.from({ length: 5 }, () => b())).toEqual(seq);
  for (const n of seq) expect(n >= 0 && n < 1).toBe(true);

  const size = { width: 4, height: 3 };
  const flat = backgroundPixels(size, [100, 100, 100], "A");
  expect(new Set(flat)).toEqual(new Set([100]));
  const b1 = backgroundPixels(size, [100, 100, 100], "B");
  expect(backgroundPixels(size, [100, 100, 100], "B")).toEqual(b1);
  // Top row near the accent, bottom row near 10% darker, never more than the grain away.
  for (let i = 0; i < 12; i++) expect(Math.abs(b1[i] - 100)).toBeLessThanOrEqual(3);
  for (let i = 24; i < 36; i++) expect(Math.abs(b1[i] - 90)).toBeLessThanOrEqual(3);
  // Monochrome: the three channels of a pixel move together.
  for (let i = 0; i < b1.length; i += 3) expect(b1[i]).toBe(b1[i + 2]);
});

test("the shadow sits 18px under its rect with the same size", () => {
  const rect = { x: 160, y: 168, width: 1280, height: 840 };
  expect(shadowRect(rect)).toEqual({ ...rect, y: 186 });
  expect([rect].map((r) => shadowRect(r))).toEqual([{ ...rect, y: 186 }]);
});

test("the single phone is 88% tall, centred, with the pair's radius", () => {
  const { screen, radius } = phoneSingle(SINGLE_CANVAS, MOBILE_2X);
  expect(radius).toBe(44);
  expect(screen.height).toBe(Math.round(2160 * 0.88));
  expect(screen.width).toBe(Math.round((screen.height * 780) / 1688));
  // Centred to the pixel: an odd leftover splits one pixel unevenly.
  expect(Math.abs(screen.x - (SINGLE_CANVAS.width - (screen.x + screen.width)))).toBeLessThanOrEqual(1);
  expect(Math.abs(screen.y - (SINGLE_CANVAS.height - (screen.y + screen.height)))).toBeLessThanOrEqual(1);
});

test("in the 302px tile of a 390px viewport the single phone renders at least 220px wide", () => {
  const { screen } = phoneSingle(SINGLE_CANVAS, MOBILE_2X);
  expect((screen.width / SINGLE_CANVAS.width) * 302).toBeGreaterThanOrEqual(220);
});

test("generator-only sources stay out of public/img, so the seed never uploads them", () => {
  expect(readdirSync("public/img").filter((f) => /-mobile-[12]\.jpg$/.test(f))).toEqual([]);
  expect(readdirSync(SOURCES_DIR).sort()).toEqual(
    Object.keys(THUMBNAILS).flatMap((slug) => [`${slug}-mobile-1.jpg`, `${slug}-mobile-2.jpg`]).sort(),
  );
});
