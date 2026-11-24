import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RelatedNotes } from "../../src/components/related-notes";
import type { Post } from "../../src/content/posts";

const basePost = (overrides: Partial<Post> = {}): Post => ({
  slug: "note-one",
  title: "Note one",
  description: "Notes on shipping with AI.",
  category: "AI Workflow",
  categoryKey: "ai-workflow",
  date: "Nov 24, 2026",
  publishedAt: "2026-11-24T00:00:00.000Z",
  image: "",
  body: "Body.",
  tools: [],
  relatedProjects: [],
  discussion: [],
  aiAssisted: false,
  ...overrides,
});

const plainText = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/\u00a0|&#xA0;|&nbsp;/g, " ");

test("RelatedNotes renders nothing when posts is empty", () => {
  expect(renderToStaticMarkup(<RelatedNotes posts={[]} heading="Related notes" />)).toBe("");
});

test("RelatedNotes renders heading, links to /blog/<slug>/, titles, and dates for 2 posts", () => {
  const html = renderToStaticMarkup(
    <RelatedNotes
      heading="Related notes"
      posts={[
        basePost({ slug: "first-note", title: "First note", date: "Nov 20, 2026" }),
        basePost({ slug: "second-note", title: "Second note", date: "Nov 24, 2026" }),
      ]}
    />,
  );

  expect(plainText(html)).toContain("Related notes");
  expect(html).toMatch(/href="\/blog\/first-note\/?"/);
  expect(html).toMatch(/href="\/blog\/second-note\/?"/);
  expect(html).toContain("First note");
  expect(html).toContain("Second note");
  expect(html).toContain("Nov 20, 2026");
  expect(html).toContain("Nov 24, 2026");
  expect(html.match(/<a /g)).toHaveLength(2);
});

test("RelatedNotes renders at most 3 links when 4 posts are passed", () => {
  const posts = [
    basePost({ slug: "one", title: "One" }),
    basePost({ slug: "two", title: "Two" }),
    basePost({ slug: "three", title: "Three" }),
    basePost({ slug: "four", title: "Four" }),
  ];

  const html = renderToStaticMarkup(<RelatedNotes posts={posts} heading="Related notes" />);

  expect(html.match(/<a /g)).toHaveLength(3);
  expect(html).toMatch(/href="\/blog\/one\/?"/);
  expect(html).toMatch(/href="\/blog\/two\/?"/);
  expect(html).toMatch(/href="\/blog\/three\/?"/);
  expect(html).not.toMatch(/href="\/blog\/four\/?"/);
  expect(html).not.toContain("Four");
});

test("RelatedNotes drops empty image and empty date", () => {
  const html = renderToStaticMarkup(
    <RelatedNotes posts={[basePost({ slug: "bare", title: "Bare note", date: "", image: "" })]} heading="Related notes" />,
  );

  expect(html).not.toContain("<img");
  expect(html).not.toContain('src=""');
  expect(html).not.toContain("<time");
  expect(html).toContain("Bare note");
});

