import { expect, test } from "vitest";
import { flattenTopLevelFields, type Field, type TextFieldSingleValidation } from "payload";
import { SiteSettings } from "../../src/globals/SiteSettings";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import { SOCIAL_KEYS } from "../../src/lib/social-icons";

function namedFields(fields: Field[]) {
  return fields.filter(
    (field): field is Extract<Field, { name: string }> => "name" in field && typeof field.name === "string",
  );
}

/** Data fields at their storage path: unnamed tabs are presentational. */
const rootFields = () => namedFields(flattenTopLevelFields(SiteSettings.fields) as Field[]);

function get(fields: Field[], name: string) {
  const field = namedFields(fields).find((f) => f.name === name);
  if (!field) throw new Error(`missing field ${name}`);
  return field;
}

function group(fields: Field[], name: string) {
  const field = get(fields, name);
  if (field.type !== "group") throw new Error(`${name} must be a group`);
  return field.fields;
}

test("site settings expose identity, availability, and cv fields", () => {
  const names = rootFields().map((f) => f.name);
  expect(names).toEqual(expect.arrayContaining(["name", "role", "tagline", "availabilityStatus", "email", "avatar", "followerCount", "resume", "workHistory", "bigQuote", "copyright", "footerWordmark"]));
});

test("the admin is split into unnamed tabs, so no field moves to a new path", () => {
  const [tabs] = SiteSettings.fields;
  if (tabs?.type !== "tabs") throw new Error("site settings must open with a tabs field");
  expect(SiteSettings.fields).toHaveLength(1);
  expect(tabs.tabs.map((tab) => tab.label)).toEqual(["Identity", "Hero", "About", "Sections", "Socials", "Footer", "SEO"]);
  for (const tab of tabs.tabs) expect("name" in tab).toBe(false);
});

test("site settings pin availability, resume, work history, big quote, and seo shapes", () => {
  const fields = rootFields();

  const availability = get(fields, "availabilityStatus");
  if (availability.type !== "select") throw new Error("availabilityStatus must be a select");
  expect(availability.options.map((o) => (typeof o === "string" ? o : o.value))).toEqual(["open", "selective", "closed"]);

  const resume = get(fields, "resume");
  if (resume.type !== "upload") throw new Error("resume must be an upload");
  expect(resume.relationTo).toBe("media");
  expect(resume.filterOptions).toMatchObject({ mimeType: { equals: "application/pdf" } });
  expect(resume.validate).toBeTypeOf("function");

  const workHistory = get(fields, "workHistory");
  if (workHistory.type !== "array") throw new Error("workHistory must be an array");
  expect(namedFields(workHistory.fields).map((f) => f.name).sort()).toEqual(["company", "dates", "role"]);

  expect(namedFields(group(fields, "bigQuote")).map((f) => f.name).sort()).toEqual(["avatar", "bold", "name", "role", "tail", "text"]);
  expect(namedFields(group(fields, "seo")).map((f) => f.name).sort()).toEqual(["description", "ogImage", "title"]);
});

test("the big quote is optional, so the owner can leave it empty and the section hides", () => {
  const quote = namedFields(group(rootFields(), "bigQuote"));
  expect(quote.filter((f) => "required" in f && f.required).map((f) => f.name)).toEqual([]);
});

test("the copy group carries one sub-group per section", () => {
  const copy = group(rootFields(), "copy");
  expect(namedFields(copy).map((f) => f.name)).toEqual(Object.keys(COPY_DEFAULTS));
  expect(namedFields(group(group(copy, "skills"), "heading")).map((f) => f.name)).toEqual(["line1", "line2"]);
  // Every copy field is optional: an empty one falls back instead of failing validation.
  expect(JSON.stringify(copy)).not.toContain('"required":true');
});

/**
 * Walk the copy group next to COPY_DEFAULTS. Text fields show their repo
 * default as a placeholder and store nothing on their own; list fields carry
 * no default either. Every default must be reached, so a new copy key without
 * a field (or a field without a default) fails here.
 */
test("copy fields store nothing by default and show the repo text as a placeholder", () => {
  const visited: string[] = [];

  function walk(fields: Field[], defaults: Record<string, unknown>, path: string) {
    for (const field of namedFields(fields)) {
      const at = `${path}.${field.name}`;
      const expected = defaults[field.name];
      expect(expected, `${at} has no entry in COPY_DEFAULTS`).toBeDefined();
      expect("defaultValue" in field && field.defaultValue, `${at} defaultValue`).toBeFalsy();
      expect("hooks" in field && field.hooks?.afterRead?.length, `${at} afterRead`).toBeFalsy();

      if (field.type === "group") {
        walk(field.fields, expected as Record<string, unknown>, at);
      } else if ((field.type === "text" && !field.hasMany) || field.type === "textarea") {
        expect(field.admin?.placeholder, `${at} placeholder`).toBe(expected);
        visited.push(at);
      } else if (field.type === "array" || (field.type === "text" && field.hasMany)) {
        expect(Array.isArray(expected), `${at} default is a list`).toBe(true);
        visited.push(at);
      } else {
        throw new Error(`${at}: unexpected ${field.type} field in copy`);
      }
    }
  }

  walk(group(rootFields(), "copy"), COPY_DEFAULTS, "copy");

  const leaves: string[] = [];
  (function collect(node: Record<string, unknown>, path: string) {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" || Array.isArray(value)) leaves.push(`${path}.${key}`);
      else collect(value as Record<string, unknown>, `${path}.${key}`);
    }
  })(COPY_DEFAULTS, "copy");
  expect(visited.sort()).toEqual(leaves.sort());
});

test("the list copy fields say an empty list uses the repo defaults", () => {
  const copy = group(rootFields(), "copy");
  const paragraphs = get(group(copy, "about"), "paragraphs");
  const words = get(group(copy, "footer"), "cycleWords");
  if (paragraphs.type !== "array" || words.type !== "text") throw new Error("unexpected list field types");
  expect(words.hasMany).toBe(true);
  expect(paragraphs.admin?.description).toBe("Leave empty to use the default paragraphs from the repo.");
  expect(words.admin?.description).toBe("Leave empty to use the default words from the repo.");
});

test("socials pick a platform from the closed icon set; the legacy label stays but is hidden", () => {
  const socials = get(rootFields(), "socials");
  if (socials.type !== "array") throw new Error("socials must be an array");

  const platform = get(socials.fields, "platform");
  if (platform.type !== "select") throw new Error("platform must be a select");
  expect(platform.options.map((o) => (typeof o === "string" ? o : o.value))).toEqual(SOCIAL_KEYS);

  const label = get(socials.fields, "label");
  if (label.type !== "text") throw new Error("label must be a text field");
  expect(label.required).toBe(false);
  expect(label.admin?.hidden).toBe(true);

  const url = get(socials.fields, "url");
  if (url.type !== "text") throw new Error("url must be a text field");
  expect(url.validate).toBeTypeOf("function");
});

test("the signature is an image-only upload under about", () => {
  const signature = get(group(rootFields(), "about"), "signature");
  if (signature.type !== "upload") throw new Error("signature must be an upload");
  expect(signature.relationTo).toBe("media");
  expect(signature.filterOptions).toMatchObject({ mimeType: { like: "image/" } });
});

test("the footer wordmark describes its first-name fallback", () => {
  const wordmark = get(rootFields(), "footerWordmark");
  if (wordmark.type !== "text") throw new Error("footerWordmark must be a text field");
  expect(wordmark.admin?.description).toBe("Defaults to your first name when empty.");
});

test("social urls must be absolute https links", async () => {
  const socials = get(rootFields(), "socials");
  if (socials.type !== "array") throw new Error("socials must be an array");
  const url = get(socials.fields, "url");
  if (url.type !== "text" || !url.validate) throw new Error("url must validate");
  const validate = url.validate as TextFieldSingleValidation;
  const args = { required: true, req: { payload: { config: {} }, t: (key: string) => key } } as never;
  expect(await validate("https://github.com/afan", args)).toBe(true);
  expect(await validate("http://github.com/afan", args)).toBeTypeOf("string");
  expect(await validate("github.com/afan", args)).toBeTypeOf("string");
  expect(await validate("", args)).toBeTypeOf("string");
});
