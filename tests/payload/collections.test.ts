import { expect, test } from "vitest";
import type { TextFieldSingleValidation } from "payload";
import { Posts } from "../../src/collections/Posts";
import { Skills } from "../../src/collections/Skills";
import { Projects } from "../../src/collections/Projects";
import { POST_CATEGORIES } from "../../src/lib/post-meta";
import { ICON_KEYS, TOOL_KEYS } from "../../src/lib/skill-icons";
import { SOCIAL_KEYS } from "../../src/lib/social-icons";

test("skills expose variant plus closed icon and tool selects", () => {
  const names = Skills.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(expect.arrayContaining(["name", "group", "variant", "icon", "tool", "strength", "order"]));
  const opts = (n: string) => {
    const f = Skills.fields.find((x) => "name" in x && x.name === n);
    if (!f || !("options" in f)) throw new Error(`missing select field ${n}`);
    return f.options.map((o) => (typeof o === "string" ? o : o.value));
  };
  expect(opts("icon")).toEqual([...ICON_KEYS]);
  expect(opts("tool")).toEqual([...TOOL_KEYS]);
});
test("projects carry blocks and a pull quote", () => {
  const names = Projects.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(expect.arrayContaining(["name", "slug", "kind", "heading", "quote", "blocks"]));
});

test("posts collection enables drafts and has no free-text date", async () => {
  expect(Posts.versions).toBeTruthy();
  expect(typeof Posts.versions === "object" && Posts.versions.drafts).toBeTruthy();

  const names = Posts.fields.map((f) => ("name" in f ? f.name : "")).filter(Boolean);
  expect(names).toEqual(
    expect.arrayContaining(["publishedAt", "tools", "relatedProjects", "discussion", "aiAssisted"]),
  );
  expect(names).not.toContain("date");

  const category = Posts.fields.find((f) => "name" in f && f.name === "category");
  if (!category || category.type !== "select") throw new Error("posts.category must be a select");
  expect(category.required).toBe(true);
  expect(category.options.map((o) => (typeof o === "string" ? o : o.value))).toEqual(
    POST_CATEGORIES.map((c) => c.value),
  );

  const publishedAt = Posts.fields.find((f) => "name" in f && f.name === "publishedAt");
  if (!publishedAt || publishedAt.type !== "date") throw new Error("posts.publishedAt must be a date");
  expect(publishedAt.required).toBe(true);
  expect(publishedAt.admin?.date?.pickerAppearance).toBe("dayOnly");

  const discussion = Posts.fields.find((f) => "name" in f && f.name === "discussion");
  if (!discussion || discussion.type !== "array") throw new Error("posts.discussion must be an array");
  const platform = discussion.fields.find((f) => "name" in f && f.name === "platform");
  if (!platform || platform.type !== "select") throw new Error("posts.discussion.platform must be a select");
  expect(platform.options.map((o) => (typeof o === "string" ? o : o.value))).toEqual(SOCIAL_KEYS);

  const url = discussion.fields.find((f) => "name" in f && f.name === "url");
  if (!url || url.type !== "text" || !url.validate) throw new Error("posts.discussion.url must validate https");
  const validate = url.validate as TextFieldSingleValidation;
  const args = { required: true, req: { payload: { config: {} }, t: (key: string) => key } } as never;
  expect(await validate("https://www.threads.com/@afanaffaidin/post/1", args)).toBe(true);
  expect(await validate("http://example.com", args)).toBeTypeOf("string");
  expect(await validate("", args)).toBeTypeOf("string");
});
