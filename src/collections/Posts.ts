import type { CollectionConfig } from "payload";

import { revalidateSite } from "../lib/revalidate";

export const Posts: CollectionConfig = {
  slug: "posts",
  versions: { drafts: false },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea" },
    { name: "category", type: "text" },
    { name: "date", type: "text" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "body", type: "textarea" },
  ],
};
