import { expect, test } from "vitest";
import { POST_CATEGORIES, categoryLabel, formatPostDate } from "../../src/lib/post-meta";

test("POST_CATEGORIES lists the four post categories in order", () => {
  expect(POST_CATEGORIES).toEqual([
    { value: "ai-workflow", label: "AI Workflow" },
    { value: "ai-in-products", label: "AI in Products" },
    { value: "experiments", label: "Experiments" },
    { value: "wordpress", label: "WordPress" },
  ]);
});

test("categoryLabel maps known categories and returns empty string otherwise", () => {
  expect(categoryLabel("ai-workflow")).toBe("AI Workflow");
  expect(categoryLabel("ai-in-products")).toBe("AI in Products");
  expect(categoryLabel("experiments")).toBe("Experiments");
  expect(categoryLabel("wordpress")).toBe("WordPress");
  expect(categoryLabel("nope")).toBe("");
  expect(categoryLabel("")).toBe("");
  expect(categoryLabel(null)).toBe("");
  expect(categoryLabel(undefined)).toBe("");
});

test("formatPostDate formats ISO strings in UTC and rejects empty or invalid values", () => {
  expect(formatPostDate("2025-03-06T00:00:00.000Z")).toBe("Mar 6, 2025");
  expect(formatPostDate("2025-03-06T23:30:00.000Z")).toBe("Mar 6, 2025");
  expect(formatPostDate("")).toBe("");
  expect(formatPostDate("   ")).toBe("");
  expect(formatPostDate("x")).toBe("");
  expect(formatPostDate(null)).toBe("");
  expect(formatPostDate(undefined)).toBe("");
});
