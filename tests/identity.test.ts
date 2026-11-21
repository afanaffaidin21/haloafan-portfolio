import { expect, test } from "vitest";
import { globSync, readFileSync } from "node:fs";

// Leftovers of the template's identity, projects, testimonials, and posts,
// collected from src/content before the owner's content replaced it. No source
// file may carry them, the seed sources and copy defaults included.
const TEMPLATE = [
  // identity and socials
  "Joseph",
  "JosephAlexWeb",
  '"JOSEPH"',
  "launchnow",
  "miratemplate",
  "Full-stack Designer",
  "Full-Stack Designer",
  "Framer Development",
  '"https://www.instagram.com/"',
  '"https://www.linkedin.com/"',
  '"https://dribbble.com/"',
  '"https://www.behance.net/"',
  // work history
  "KYMA",
  "Mugen",
  "Axiom",
  // projects and their quotes
  "Mango",
  "Kora",
  "Adèle Roche",
  "adele-roche",
  "Studio Roche",
  "The Rocha",
  "the-rocha",
  "Rui Rocha",
  "Theo Laurent",
  "Maya Okafor",
  "puma.example.com",
  // testimonials and the big quote
  "Thomas Weber",
  "Martina Martinez",
  "SupportEase",
  "Zazzle",
  "Ben Harper",
  "Michael Wong",
  "DataSphere",
  "Natalie Rivera",
  "UnityBrands",
  "Emma Kraft",
  "TechVista",
  // posts
  "how-designers-and-developers-can-actually-collaborate",
  "the-design-subscription-model",
  "the-science-of-first-impressions",
  "the-psychology-of-white-space",
  "building-brands-that-scale",
];

// Claims the owner ruled out: the experience claim is "since 2021", and no
// phone number is published anywhere on the site.
const RULED_OUT = ["5+ years"];
const PHONE = [/\+62[\s-]?\d/, /\b08\d{2}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/];

const sources = () =>
  globSync("{src,scripts}/**/*.{ts,tsx}")
    .map((f) => f.replaceAll("\\", "/"))
    .map((f) => ({ f, text: readFileSync(f, "utf8") }));

test("no source file carries the template identity, content, or placeholder social roots", () => {
  const offenders = sources().flatMap(({ f, text }) =>
    [...TEMPLATE, ...RULED_OUT].filter((needle) => text.includes(needle)).map((needle) => `${f}: ${needle}`),
  );
  expect(offenders).toEqual([]);
});

test("no source file carries a phone number", () => {
  const offenders = sources().flatMap(({ f, text }) =>
    PHONE.filter((pattern) => pattern.test(text)).map((pattern) => `${f}: ${pattern}`),
  );
  expect(offenders).toEqual([]);
});

test("the phone patterns catch Indonesian numbers in both formats", () => {
  for (const sample of ["+62 812-3456-7890", "+6281234567890", "0812-3456-7890", "0812 3456 789"]) {
    expect(PHONE.some((pattern) => pattern.test(sample)), sample).toBe(true);
  }
  expect(PHONE.some((pattern) => pattern.test("since 2021, UTC+7"))).toBe(false);
});
