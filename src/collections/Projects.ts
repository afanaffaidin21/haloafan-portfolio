import type { CollectionConfig } from "payload";

import { revalidateSite } from "../lib/revalidate";

export const Projects: CollectionConfig = {
  slug: "projects",
  versions: { drafts: false },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "client",
      admin: { description: 'An experiment without a client shows "Personal project" in place of the client line.' },
      options: [
        { label: "Client", value: "client" },
        { label: "Experiment", value: "experiment" },
      ],
    },
    { name: "type", type: "text" },
    { name: "heading", type: "text" },
    { name: "year", type: "text" },
    { name: "client", type: "text" },
    { name: "description", type: "textarea" },
    { name: "scope", type: "text", hasMany: true },
    {
      name: "disciplines",
      type: "select",
      hasMany: true,
      admin: { description: "Not shown on the site yet." },
      options: [
        { label: "Design", value: "design" },
        { label: "Build", value: "build" },
        { label: "AI Automation", value: "ai-automation" },
        { label: "Generative AI", value: "generative-ai" },
      ],
    },
    { name: "tech", type: "text", hasMany: true },
    { name: "liveUrl", type: "text" },
    { name: "repoUrl", type: "text" },
    { name: "thumbnail", type: "upload", relationTo: "media" },
    {
      name: "quote",
      type: "group",
      fields: [
        { name: "text", type: "text" },
        { name: "bold", type: "text" },
        { name: "tail", type: "text" },
        { name: "name", type: "text" },
        { name: "role", type: "text" },
        { name: "avatar", type: "text" },
      ],
    },
    {
      name: "blocks",
      type: "array",
      fields: [
        {
          name: "layout",
          type: "select",
          required: true,
          defaultValue: "full",
          options: [
            { label: "Full width", value: "full" },
            { label: "Two columns", value: "two" },
            { label: "Three columns", value: "three" },
          ],
        },
        {
          name: "tiles",
          type: "array",
          fields: [
            {
              name: "kind",
              type: "select",
              required: true,
              defaultValue: "image",
              options: [
                { label: "Image", value: "image" },
                { label: "Video", value: "video" },
              ],
            },
            { name: "image", type: "upload", relationTo: "media" },
            {
              name: "mobileImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Shown instead of the image on screens below 768px." },
            },
            { name: "src", type: "text" },
            { name: "poster", type: "upload", relationTo: "media" },
            { name: "alt", type: "text" },
          ],
        },
        {
          name: "description",
          type: "group",
          fields: [
            { name: "heading", type: "text" },
            { name: "bold", type: "text" },
            { name: "text", type: "textarea" },
          ],
        },
      ],
    },
    { name: "featured", type: "checkbox", defaultValue: false },
    { name: "order", type: "number" },
  ],
};
