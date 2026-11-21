import { expect, test } from "vitest";
import { navLinks } from "../src/lib/nav";

test("nav exposes work, skills, blog and contact", () => {
  expect(navLinks.map((l) => l.label)).toEqual(["Work", "Skills", "Blog", "Contact"]);
});

test("skills anchors to the renamed section", () => {
  expect(navLinks.find((l) => l.label === "Skills")!.href).toBe("/#skills");
});

test("no link points at the removed sections", () => {
  const hrefs = navLinks.map((l) => l.href);
  expect(hrefs).not.toContain("/#services");
  expect(hrefs).not.toContain("/#pricing");
});
