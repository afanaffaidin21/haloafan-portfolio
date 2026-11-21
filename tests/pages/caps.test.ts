import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Articles } from "../../src/components/articles";
import { ProjectShowcase } from "../../src/components/project-showcase";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import type { Post } from "../../src/content/posts";
import type { Project } from "../../src/content/projects";
import { articlesLayout, featuredProjects } from "../../src/lib/select";

const project = (slug: string): Project => ({
  slug,
  name: slug,
  type: "Design",
  heading: "",
  year: "2025",
  description: "",
  scope: [],
  liveUrl: "",
  thumbnail: `/img/${slug}.png`,
  quote: { text: "", bold: "", name: "", role: "", avatar: "" },
  blocks: [],
});

const post = (slug: string): Post => ({
  slug,
  title: slug,
  description: "",
  category: "Design",
  date: "Mar 6, 2025",
  image: `/img/${slug}.png`,
  body: "",
});

test("five featured projects still yield four collage slots", () => {
  const five = Array.from({ length: 5 }, (_, i) => ({ order: i, featured: true }));
  expect(featuredProjects(five)).toHaveLength(4);
});

test("a fifth project joins the grid without taking a collage slot", () => {
  const five = ["a", "b", "c", "d", "e"].map(project);
  const html = renderToStaticMarkup(
    createElement(ProjectShowcase, { projects: five, collage: five.slice(0, 4) }),
  );
  // Card 4 would reuse offsets[0] and overlap card 0 without the cap.
  expect(html.match(/z-index:/g)).toHaveLength(4);
  expect(html.match(/aria-label="/g)).toHaveLength(5);
});

test("a featured card keeps its grid cell's offset, not its featured rank", () => {
  const four = ["a", "b", "c", "d"].map(project);
  const html = renderToStaticMarkup(
    createElement(ProjectShowcase, { projects: four, collage: [four[1], four[3]] }),
  );
  // Cell 0 is not featured → no offset; cell 1 → offsets[1] (z 0);
  // cell 3 → offsets[3] (z 2), not offsets[1] / featured rank 1.
  expect(html.match(/z-index:(\d)/g)).toEqual(["z-index:0", "z-index:2"]);
});

test("articles render nothing below three posts", () => {
  expect(articlesLayout([{ id: 1 }])).toBeNull();
  expect(
    renderToStaticMarkup(createElement(Articles, { posts: [post("a"), post("b")], author: "Test", copy: COPY_DEFAULTS.articles })),
  ).toBe("");
});

test("articles still render the three newest posts", () => {
  const html = renderToStaticMarkup(
    createElement(Articles, { posts: [post("a"), post("b"), post("c")], author: "Test", copy: COPY_DEFAULTS.articles }),
  );
  expect(html).toContain('href="/blog/a"');
  expect(html).toContain('href="/blog/b"');
  expect(html).toContain('href="/blog/c"');
});

test("zero projects render the Projects grid with no cards", () => {
  const html = renderToStaticMarkup(
    createElement(ProjectShowcase, { projects: [], collage: [] }),
  );
  expect(html).toContain("md:grid-cols-2");
  expect(html).not.toContain("aria-label=");
});
