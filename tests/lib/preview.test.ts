import { describe, expect, test } from "vitest";
import { Posts } from "../../src/collections/Posts";
import { isValidSlug, previewTarget, previewUrl } from "../../src/lib/preview";

describe("isValidSlug", () => {
  test("accepts lowercase kebab-case slugs", () => {
    expect(isValidSlug("ai-notes")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
    expect(isValidSlug("post-2026-v2")).toBe(true);
  });

  test("rejects empty, traversal, protocol-relative, spaces, slashes, uppercase, and non-strings", () => {
    for (const bad of ["", "//evil.com", "../x", "A b", "a/b", 123, null, undefined, "-a", "a-", "a--b", "ai_notes"]) {
      expect(isValidSlug(bad), `expected ${JSON.stringify(bad)} to be rejected`).toBe(false);
    }
  });
});

describe("preview URL helpers", () => {
  test("previewTarget builds the trailing-slash blog path", () => {
    expect(previewTarget("ai-notes")).toBe("/blog/ai-notes/");
  });

  test("previewUrl builds the full preview URL with trailing slash", () => {
    expect(previewUrl("https://haloafan.com", "ai-notes")).toBe("https://haloafan.com/preview/?slug=ai-notes");
    expect(previewUrl("https://haloafan.com/", "ai-notes")).toBe("https://haloafan.com/preview/?slug=ai-notes");
  });
});

describe("Posts.admin.preview", () => {
  test("returns a preview URL for a valid slug using the request host/proto", async () => {
    const preview = Posts.admin?.preview;
    expect(preview).toBeTypeOf("function");
    const req = {
      headers: new Headers({
        "x-forwarded-host": "haloafan.com",
        "x-forwarded-proto": "https",
      }),
    };
    const url = await preview?.({ slug: "ai-notes" }, { locale: "en", req: req as never, token: null });
    expect(url).toBe("https://haloafan.com/preview/?slug=ai-notes");
  });

  test("returns null when the slug is missing or invalid", async () => {
    const preview = Posts.admin?.preview;
    const req = { headers: new Headers({ host: "localhost:3100" }) };
    expect(await preview?.({}, { locale: "en", req: req as never, token: null })).toBeNull();
    expect(await preview?.({ slug: "//evil.com" }, { locale: "en", req: req as never, token: null })).toBeNull();
  });
});
