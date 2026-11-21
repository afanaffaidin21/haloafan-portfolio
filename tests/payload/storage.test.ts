import { afterEach, expect, test } from "vitest";
import { r2FileUrl, storageEnabled } from "../../src/lib/storage";

const KEYS = ["R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ENDPOINT", "R2_PUBLIC_URL"] as const;
const full = { R2_BUCKET: "b", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_ENDPOINT: "https://r2", R2_PUBLIC_URL: "https://media.example.com" };

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});
test("storage stays off without credentials", () => {
  expect(storageEnabled()).toBe(false);
});
test("storage turns on with the full credential set and the public URL", () => {
  Object.assign(process.env, full);
  expect(storageEnabled()).toBe(true);
});
test("without the public URL storage stays off, so files are never served from a guessed host", () => {
  Object.assign(process.env, { ...full, R2_PUBLIC_URL: "" });
  expect(storageEnabled()).toBe(false);
});
test("an empty string counts as absent", () => {
  Object.assign(process.env, { ...full, R2_ENDPOINT: "" });
  expect(storageEnabled()).toBe(false);
});
test("a partial credential set keeps storage off", () => {
  Object.assign(process.env, { R2_BUCKET: "b", R2_ACCESS_KEY_ID: "k" });
  expect(storageEnabled()).toBe(false);
});
test("public file URLs are the custom domain plus the object key", () => {
  expect(r2FileUrl("https://media.example.com", "a.jpg")).toBe("https://media.example.com/a.jpg");
  expect(r2FileUrl("https://media.example.com/", "a b.jpg", "")).toBe("https://media.example.com/a%20b.jpg");
  expect(r2FileUrl("https://media.example.com", "a.jpg", "/uploads/2026/")).toBe("https://media.example.com/uploads/2026/a.jpg");
  expect(r2FileUrl("https://media.example.com", "a-400x300.jpg", null)).toBe("https://media.example.com/a-400x300.jpg");
});

test("with R2 on, Media checks name clashes in an empty temp dir instead of ./media", async () => {
  const { vi } = await import("vitest");
  vi.resetModules();
  expect((await import("../../src/collections/Media")).Media.upload).toMatchObject({ staticDir: "media" });
  Object.assign(process.env, full);
  vi.resetModules();
  const staticDir = ((await import("../../src/collections/Media")).Media.upload as { staticDir: string }).staticDir;
  expect(staticDir).not.toBe("media");
  expect(staticDir).toMatch(/payload-media-r2$/);
});
