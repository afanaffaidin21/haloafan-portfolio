import { expect, test } from "vitest";
import { Skills } from "../../src/collections/Skills";
import { Projects } from "../../src/collections/Projects";
import { ICON_KEYS, TOOL_KEYS } from "../../src/lib/skill-icons";

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
