import { APIError } from "payload";
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionConfig,
  TextFieldSingleValidation,
} from "payload";
import { text } from "payload/shared";

import { isAgent, ownerOnly, ownerOrAgent } from "../access/roles";
import { POST_CATEGORIES } from "../lib/post-meta";
import { isValidSlug, previewUrl } from "../lib/preview";
import { revalidateSite, shouldRevalidatePost } from "../lib/revalidate";
import { siteOrigin } from "../lib/seo";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "../lib/social-icons";

function previewOrigin(req?: { headers?: Headers; host?: string; protocol?: string }): string {
  const host =
    req?.headers?.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req?.headers?.get("host")?.trim() ||
    req?.host;
  if (host) {
    const proto =
      req?.headers?.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      req?.protocol?.replace(/:$/, "") ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return siteOrigin();
}

const validateHttps: TextFieldSingleValidation = (value, args) => {
  const base = text(value, args);
  if (base !== true) return base;
  return typeof value === "string" && value.startsWith("https://")
    ? true
    : "Use a full URL that starts with https://.";
};

const guardAgentPostOperation: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === "create" || operation === "update" || operation === "restoreVersion") {
    const opArgs = args as {
      draft?: boolean;
      publishAllLocales?: boolean;
      unpublishAllLocales?: boolean;
      data?: { _status?: unknown };
    };
    const isDraftSave = Boolean(opArgs?.draft);
    req.context.postDraftSave = isDraftSave;
    if (isAgent(req.user)) {
      if (!isDraftSave) {
        throw new APIError("Agents must save posts as drafts (draft: true).", 403);
      }
      if (opArgs?.publishAllLocales || opArgs?.unpublishAllLocales) {
        throw new APIError("Agents cannot publish or unpublish posts.", 403);
      }
      if ((operation === "create" || operation === "update") && opArgs?.data?._status === "published") {
        throw new APIError("Agents cannot publish posts.", 403);
      }
    }
  }
  return args;
};

export const rejectAgentPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!isAgent(req.user)) return data;
  if (data?._status === "published") {
    throw new APIError("Agents cannot publish posts.", 403);
  }
  const isDraftSave =
    req.context?.postDraftSave !== undefined
      ? req.context.postDraftSave === true
      : req.query?.draft === "true" || req.query?.draft === true;
  if (!isDraftSave) {
    throw new APIError("Agents must save posts as drafts and cannot publish, unpublish, or live-edit posts.", 403);
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    preview: (doc, { req }) => {
      if (!isValidSlug(doc?.slug)) return null;
      return previewUrl(previewOrigin(req), doc.slug);
    },
  },
  access: {
    create: ownerOrAgent,
    update: ownerOrAgent,
    delete: ownerOnly,
  },
  versions: { drafts: true },
  hooks: {
    beforeOperation: [guardAgentPostOperation],
    beforeChange: [rejectAgentPublish],
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
