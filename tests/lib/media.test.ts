import { expect, test } from "vitest";
import { mediaUrl } from "../../src/lib/media";

test("passes through a legacy public path", () => {
  expect(mediaUrl("/img/a.jpg")).toBe("/img/a.jpg");
});
test("returns null for missing media", () => {
  expect(mediaUrl(null)).toBeNull();
  expect(mediaUrl(5)).toBeNull();
});
test("prefers the requested size", () => {
  expect(mediaUrl({ url: "/a.jpg", sizes: { card: { url: "/a-card.jpg" } } }, "card")).toBe("/a-card.jpg");
});
test("falls back to the original url when the size is absent", () => {
  expect(mediaUrl({ url: "/a.jpg", sizes: {} }, "card")).toBe("/a.jpg");
});
test("strips the trailing slash Payload adds to upload urls", () => {
  expect(mediaUrl({ url: "/api/media/file/a.jpg/" })).toBe("/api/media/file/a.jpg");
  expect(
    mediaUrl({ url: "/api/media/file/a.jpg/", sizes: { hero: { url: "/api/media/file/a-1200x800.jpg/" } } }, "hero"),
  ).toBe("/api/media/file/a-1200x800.jpg");
});
test("leaves non-upload urls untouched", () => {
  expect(mediaUrl("/img/folder/")).toBe("/img/folder/");
});
