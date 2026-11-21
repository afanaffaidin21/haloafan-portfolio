import { expect, test } from "vitest";
import { ICON_KEYS, TOOL_KEYS, iconFor, resolveIcon, resolveTool, toolFor } from "../../src/lib/skill-icons";

test("the row icon registry carries exactly the portfolio's icons", () => {
  expect([...ICON_KEYS]).toEqual(["wordpress", "webapp", "ai", "ux", "support", "performance"]);
});
test("the tool registry carries exactly the portfolio's tech stack logos", () => {
  expect([...TOOL_KEYS]).toEqual([
    "WordPress",
    "Elementor",
    "WooCommerce",
    "PHP",
    "Next.js",
    "React",
    "TypeScript",
    "Supabase",
    "Figma",
    "Gemini",
    "ChatGPT",
    "Claude",
  ]);
});
test("every known key resolves to its own component, not the fallback", () => {
  for (const key of ICON_KEYS) expect(resolveIcon(key)).toBe(iconFor[key as keyof typeof iconFor]);
  for (const key of TOOL_KEYS) expect(resolveTool(key)).toBe(toolFor[key]);
  expect(new Set(ICON_KEYS.map(resolveIcon)).size).toBe(ICON_KEYS.length);
  expect(new Set(TOOL_KEYS.map(resolveTool)).size).toBe(TOOL_KEYS.length);
});
test("unknown keys fall back instead of returning undefined", () => {
  expect(resolveIcon("not-a-real-icon")).toBeDefined();
  expect(resolveIcon("framer")).toBeDefined();
});
test("unknown tool names fall back instead of returning undefined", () => {
  expect(resolveTool("NotATool")).toBeDefined();
  expect(resolveTool("Webflow")).toBeDefined();
});
