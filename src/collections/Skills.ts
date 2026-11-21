import type { CollectionConfig, Field } from "payload";

import { revalidateSite } from "../lib/revalidate";
import { ICON_KEYS, TOOL_KEYS } from "../lib/skill-icons";

const toOptions = (values: readonly string[]) => values.map((value) => ({ label: value, value }));

const skillFields: Field[] = [
  { name: "name", type: "text", required: true },
  {
    name: "group",
    type: "select",
    required: true,
    options: [
      { label: "Design", value: "design" },
      { label: "Build", value: "build" },
      { label: "AI Automation", value: "ai-automation" },
      { label: "Generative AI", value: "generative-ai" },
    ],
  },
  {
    name: "variant",
    type: "select",
    required: true,
    defaultValue: "row",
    options: [
      { label: "Row", value: "row" },
      { label: "Tile", value: "tile" },
    ],
  },
  {
    name: "icon",
    type: "select",
    options: toOptions(ICON_KEYS),
    admin: { condition: (data) => data?.variant === "row", description: "Row variant only." },
  },
  {
    name: "tool",
    type: "select",
    options: toOptions(TOOL_KEYS),
    admin: { condition: (data) => data?.variant === "tile", description: "Tile variant only." },
  },
  {
    name: "strength",
    type: "select",
    options: [
      { label: "Working", value: "working" },
      { label: "Strong", value: "strong" },
      { label: "Expert", value: "expert" },
    ],
  },
  { name: "note", type: "text" },
  { name: "order", type: "number" },
];

export const Skills: CollectionConfig = {
  slug: "skills",
  versions: { drafts: false },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: skillFields,
};
