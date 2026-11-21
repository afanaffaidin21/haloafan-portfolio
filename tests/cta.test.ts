import { expect, test } from "vitest";
import { globSync, readFileSync } from "node:fs";

test("no source file references the booking url", () => {
  const offenders = globSync("src/**/*.{ts,tsx}").filter((f) => {
    const text = readFileSync(f, "utf8");
    return text.includes("bookUrl") || text.includes("cal.com");
  });
  expect(offenders).toEqual([]);
});

test("the cv download is wired on the hero, footer and sticky bar", () => {
  for (const f of [
    "src/app/(site)/page.tsx",
    "src/components/footer.tsx",
    "src/components/chrome.tsx",
  ]) {
    expect(readFileSync(f, "utf8"), f).toContain("resume");
  }
});
