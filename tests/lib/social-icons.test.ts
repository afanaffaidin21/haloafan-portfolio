import { expect, test } from "vitest";
import { IconExternal, IconX } from "../../src/components/icons";
import { SOCIAL_KEYS, SOCIAL_LABELS, resolveSocialIcon, socialIconFor } from "../../src/lib/social-icons";

test("the closed key list is the registry, in order", () => {
  expect(SOCIAL_KEYS).toEqual(["x", "github", "linkedin", "instagram", "threads", "dribbble", "behance"]);
  expect(SOCIAL_KEYS).toEqual(Object.keys(socialIconFor));
  expect(Object.keys(SOCIAL_LABELS)).toEqual(SOCIAL_KEYS);
});
test("known keys resolve to their icon", () => {
  expect(resolveSocialIcon("x")).toBe(IconX);
  for (const key of SOCIAL_KEYS) expect(resolveSocialIcon(key)).toBe(socialIconFor[key]);
});
test("unknown keys fall back to a neutral icon instead of undefined", () => {
  expect(resolveSocialIcon("myspace")).toBe(IconExternal);
  expect(resolveSocialIcon("toString")).toBe(IconExternal);
});
