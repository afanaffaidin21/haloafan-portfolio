import type { CollectionConfig } from "payload";

import { revalidateSite } from "../lib/revalidate";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  versions: { drafts: false },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea" },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Availability", value: "availability" },
        { label: "Role", value: "role" },
        { label: "Process", value: "process" },
        { label: "General", value: "general" },
      ],
    },
    { name: "order", type: "number" },
  ],
};
