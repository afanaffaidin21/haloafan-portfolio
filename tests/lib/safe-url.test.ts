import { describe, expect, test } from "vitest";
import { safeHref } from "../../src/lib/safe-url";

describe("safeHref", () => {
  test("allows https URLs, root-relative paths, and fragment hashes", () => {
    expect(safeHref("https://a.com")).toBe("https://a.com");
    expect(safeHref("https://github.com/user/repo?tab=readme#top")).toBe(
      "https://github.com/user/repo?tab=readme#top",
    );
    expect(safeHref("  https://a.com  ")).toBe("https://a.com");
    expect(safeHref("/blog/")).toBe("/blog/");
    expect(safeHref("/img/a.jpg")).toBe("/img/a.jpg");
    expect(safeHref("/")).toBe("/");
    expect(safeHref("#x")).toBe("#x");
    expect(safeHref("#section-1")).toBe("#section-1");
  });

  test("rejects unsafe protocols, protocol-relative URLs, http, and malformed inputs", () => {
    const blocked = [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "  javascript:alert(1)  ",
      "java\tscript:alert(1)",
      "java\nscript:alert(1)",
      "//evil.com",
      "///evil.com",
      "/\\evil.com",
      "data:text/html,x",
      "vbscript:msgbox(1)",
      "http://a.com",
      "ftp://a.com",
      "mailto:hello@example.com",
      "https://",
      "https:a.com",
      "https://a.com\nfoo",
      "https://a.com foo",
      "/blog/\nbar",
      "#foo bar",
      "relative/path",
      "",
      "   ",
    ];

    for (const input of blocked) {
      expect(safeHref(input), `expected ${JSON.stringify(input)} to be null`).toBeNull();
    }
  });
});
