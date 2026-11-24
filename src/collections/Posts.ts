import type { CollectionConfig, TextFieldSingleValidation } from "payload";
import { text } from "payload/shared";

import { POST_CATEGORIES } from "../lib/post-meta";
import { revalidateSite, shouldRevalidatePost } from "../lib/revalidate";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "../lib/social-icons";

const validateHttps: TextFieldSingleValidation = (value, args) => {
  const base = text(value, args);
  if (base !== true) return base;
  return typeof value === "string" && value.startsWith("https://")
    ? true
    : "Use a full URL that starts with https://.";
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (shouldRevalidatePost({ doc, previousDoc })) revalidateSite();
      },
    ],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea" },
    {
      name: "category",
      type: "select",
      required: true,
      options: POST_CATEGORIES.map(({ value, label }) => ({ label, value })),
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "body", type: "textarea" },
    { name: "tools", type: "text", hasMany: true },
    { name: "relatedProjects", type: "relationship", relationTo: "projects", hasMany: true },
    {
      name: "discussion",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: SOCIAL_KEYS.map((value) => ({ label: SOCIAL_LABELS[value], value })),
        },
        { name: "url", type: "text", required: true, validate: validateHttps },
      ],
    },
    { name: "aiAssisted", type: "checkbox", defaultValue: true },
  ],
};
