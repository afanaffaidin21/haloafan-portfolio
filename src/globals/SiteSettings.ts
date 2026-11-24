import type {
  Field,
  GlobalConfig,
  SelectFieldSingleValidation,
  TextFieldSingleValidation,
  UploadFieldSingleValidation,
  Where,
} from "payload";
import { select, text } from "payload/shared";

import { ownerOnly } from "../access/roles";
import { COPY_DEFAULTS, type TwoLine } from "../lib/copy-defaults";
import { revalidateSite } from "../lib/revalidate";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "../lib/social-icons";

const pdfOnly: Where = { mimeType: { equals: "application/pdf" } };
const imageOnly: Where = { mimeType: { like: "image/" } };

/** Upload validation that checks the referenced Media doc's mime type. */
function mediaOfType(accepts: (mimeType: string) => boolean, message: string): UploadFieldSingleValidation {
  return async (value, { req }) => {
    if (value === null || value === undefined) return true;
    const id = typeof value === "object" && "id" in value ? value.id : value;
    if (typeof id !== "number" && typeof id !== "string") return message;
    const { docs } = await req.payload.find({
      collection: "media",
      where: { id: { equals: id } },
      limit: 1,
      depth: 0,
    });
    return accepts(docs[0]?.mimeType ?? "") ? true : message;
  };
}

const validateResume = mediaOfType((type) => type === "application/pdf", "Resume must reference an uploaded PDF file.");
const validateSignature = mediaOfType((type) => type.startsWith("image/"), "Signature must reference an uploaded image.");

const validateHttps: TextFieldSingleValidation = (value, args) => {
  const base = text(value, args);
  if (base !== true) return base;
  return typeof value === "string" && value.startsWith("https://") ? true : "Use a full URL that starts with https://.";
};

/** New rows must pick a platform; legacy rows still carry their `label`. */
const validatePlatform: SelectFieldSingleValidation = (value, args) => {
  const legacyLabel = (args.siblingData as { label?: string | null } | undefined)?.label;
  if (!value && !legacyLabel) return "Pick a platform.";
  return select(value, args);
};

// --- Copy fields ------------------------------------------------------------

/**
 * The repo default is a placeholder, not a `defaultValue`: a stored default
 * would freeze today's text into the database on the first save, and later
 * edits to `src/lib/copy-defaults.ts` would never reach the site.
 */
function copyText(name: string, text: string, type: "text" | "textarea" = "text"): Field {
  const admin = { placeholder: text };
  return type === "textarea" ? { name, type, admin } : { name, type, admin };
}

/** A `{ line1, line2 }` heading. Which line is muted is decided by the component. */
function twoLine(name: string, defaults: TwoLine, description?: string): Field {
  return {
    name,
    type: "group",
    ...(description ? { admin: { description } } : {}),
    fields: [copyText("line1", defaults.line1), copyText("line2", defaults.line2)],
  };
}

const copy: Field = {
  name: "copy",
  type: "group",
  admin: {
    description:
      "Leave a field empty to use the default text from the repo (src/lib/copy-defaults.ts). Fill it only to override.",
  },
  fields: [
    {
      name: "hero",
      type: "group",
      admin: { description: "Subcopy under the hero headline." },
      fields: [
        copyText("subcopyLead", COPY_DEFAULTS.hero.subcopyLead),
        copyText("subcopyBody", COPY_DEFAULTS.hero.subcopyBody, "textarea"),
      ],
    },
    {
      name: "home",
      type: "group",
      fields: [copyText("latestProjectsHeading", COPY_DEFAULTS.home.latestProjectsHeading)],
    },
    {
      name: "skills",
      type: "group",
      fields: [
        twoLine("heading", COPY_DEFAULTS.skills.heading),
        copyText("techStackLabel", COPY_DEFAULTS.skills.techStackLabel),
      ],
    },
    {
      name: "about",
      type: "group",
      fields: [
        twoLine("heading", COPY_DEFAULTS.about.heading),
        {
          name: "paragraphs",
          type: "array",
          admin: { description: "Leave empty to use the default paragraphs from the repo." },
          fields: [
            { name: "lead", type: "text" },
            { name: "body", type: "textarea" },
          ],
        },
      ],
    },
    {
      name: "faq",
      type: "group",
      fields: [
        twoLine("heading", COPY_DEFAULTS.faq.heading),
        twoLine("cardHeading", COPY_DEFAULTS.faq.cardHeading),
        copyText("cardBody", COPY_DEFAULTS.faq.cardBody, "textarea"),
      ],
    },
    {
      name: "articles",
      type: "group",
      fields: [twoLine("heading", COPY_DEFAULTS.articles.heading)],
    },
    {
      name: "blog",
      type: "group",
      fields: [
        copyText("title", COPY_DEFAULTS.blog.title),
        copyText("intro", COPY_DEFAULTS.blog.intro, "textarea"),
        copyText("empty", COPY_DEFAULTS.blog.empty),
        copyText("followTitle", COPY_DEFAULTS.blog.followTitle),
        copyText("followBody", COPY_DEFAULTS.blog.followBody, "textarea"),
        copyText("moreHeading", COPY_DEFAULTS.blog.moreHeading),
        copyText("previewBar", COPY_DEFAULTS.blog.previewBar),
        copyText("previewExit", COPY_DEFAULTS.blog.previewExit),
        copyText("toolsLabel", COPY_DEFAULTS.blog.toolsLabel),
        copyText("relatedLabel", COPY_DEFAULTS.blog.relatedLabel),
        copyText("aiDisclosure", COPY_DEFAULTS.blog.aiDisclosure, "textarea"),
        copyText("discussedOn", COPY_DEFAULTS.blog.discussedOn),
      ],
    },
    {
      name: "projects",
      type: "group",
      fields: [
        twoLine("title", COPY_DEFAULTS.projects.title),
        copyText("subtitle", COPY_DEFAULTS.projects.subtitle),
      ],
    },
    {
      name: "project",
      type: "group",
      admin: { description: "Project detail pages." },
      fields: [
        copyText("relatedNotesHeading", COPY_DEFAULTS.project.relatedNotesHeading),
        copyText("moreHeading", COPY_DEFAULTS.project.moreHeading),
        copyText("placeholderCard", COPY_DEFAULTS.project.placeholderCard, "textarea"),
      ],
    },
    twoLine("contactCta", COPY_DEFAULTS.contactCta, "Closing card on /projects and every project page."),
    {
      name: "footer",
      type: "group",
      fields: [
        copyText("lead", COPY_DEFAULTS.footer.lead),
        {
          name: "cycleWords",
          type: "text",
          hasMany: true,
          admin: { description: "Leave empty to use the default words from the repo." },
        },
        copyText("line2", COPY_DEFAULTS.footer.line2),
      ],
    },
  ],
};

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    update: ownerOnly,
  },
  hooks: {
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      // Unnamed tabs are presentational: every field keeps its root path and
      // its existing database column.
      type: "tabs",
      tabs: [
        {
          label: "Identity",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "role", type: "text", required: true },
            { name: "email", type: "email", required: true },
            { name: "avatar", type: "upload", relationTo: "media" },
            {
              name: "resume",
              type: "upload",
              relationTo: "media",
              filterOptions: pdfOnly,
              validate: validateResume,
            },
          ],
        },
        {
          label: "Hero",
          description: "The subcopy under the headline is under Sections → Copy → Hero.",
          fields: [
            { name: "tagline", type: "text" },
            {
              name: "availabilityStatus",
              type: "select",
              required: true,
              defaultValue: "open",
              options: [
                { label: "Open to work", value: "open" },
                { label: "Selective", value: "selective" },
                { label: "Closed", value: "closed" },
              ],
            },
            { name: "availabilityNote", type: "text" },
          ],
        },
        {
          label: "About",
          fields: [
            {
              name: "workHistory",
              type: "array",
              fields: [
                { name: "company", type: "text", required: true },
                { name: "role", type: "text", required: true },
                { name: "dates", type: "text", required: true },
              ],
            },
            {
              name: "about",
              type: "group",
              fields: [
                {
                  name: "signature",
                  type: "upload",
                  relationTo: "media",
                  filterOptions: imageOnly,
                  validate: validateSignature,
                  admin: { description: "Shown under the About paragraphs. Hidden when empty." },
                },
              ],
            },
          ],
        },
        {
          label: "Sections",
          fields: [
            {
              name: "bigQuote",
              type: "group",
              admin: { description: "Leave text and bold empty to hide the quote section." },
              fields: [
                { name: "text", type: "textarea", required: false },
                { name: "bold", type: "text", required: false },
                { name: "tail", type: "textarea", required: false },
                { name: "name", type: "text", required: false },
                { name: "role", type: "text", required: false },
                { name: "avatar", type: "upload", relationTo: "media" },
              ],
            },
            copy,
          ],
        },
        {
          label: "Socials",
          fields: [
            {
              name: "socials",
              type: "array",
              fields: [
                {
                  name: "platform",
                  type: "select",
                  options: SOCIAL_KEYS.map((value) => ({ label: SOCIAL_LABELS[value], value })),
                  validate: validatePlatform,
                },
                // Legacy: rows saved before `platform` existed carry only this
                // free-text label ("X"). The view layer still reads it as a
                // fallback, so the column stays; new rows never set it.
                { name: "label", type: "text", required: false, admin: { hidden: true } },
                { name: "url", type: "text", required: true, validate: validateHttps },
              ],
            },
            {
              name: "followerCount",
              type: "text",
              admin: { description: "Shown on the X chip only." },
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            {
              name: "footerWordmark",
              type: "text",
              admin: { description: "Defaults to your first name when empty." },
            },
            { name: "copyright", type: "text" },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "description", type: "textarea" },
                { name: "ogImage", type: "upload", relationTo: "media" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
