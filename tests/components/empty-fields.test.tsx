import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { Articles } from "../../src/components/articles";
import { BigQuote } from "../../src/components/big-quote";
import { BlogList } from "../../src/components/blog-list";
import { Faq } from "../../src/components/faq";
import { Nav } from "../../src/components/nav";
import { ProjectCard } from "../../src/components/project-card";
import { ProjectShowcase } from "../../src/components/project-showcase";
import { ProjectHero, ProjectQuote } from "../../src/components/project-detail";
import { toProjectView } from "../../src/lib/content";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import type { Post } from "../../src/content/posts";

/** Every surface the CMS feeds, rendered with all of its media fields empty. */
const post = (slug: string): Post => ({ slug, title: slug, description: "", category: "", date: "", image: "", body: "" });

const bareProject = toProjectView({ slug: "p", name: "P", quote: { text: "Quote.", name: "Theo" } });

const surfaces: Record<string, ReactElement> = {
  ProjectHero: <ProjectHero project={bareProject} />,
  ProjectQuote: <ProjectQuote quote={bareProject.quote} />,
  Nav: <Nav avatar="" name="Afan" email="me@example.com" />,
  Faq: <Faq faqs={[]} avatar="" email="me@example.com" resume="" copy={COPY_DEFAULTS.faq} />,
  BigQuote: <BigQuote text="Quote " bold="bold" tail="" name="" role="" avatar="" />,
  ProjectCard: <ProjectCard project={{ slug: "p", name: "P", type: "", thumbnail: "" }} />,
  Articles: <Articles posts={[post("a"), post("b"), post("c")]} author="Afan" copy={COPY_DEFAULTS.articles} />,
};

for (const [name, element] of Object.entries(surfaces)) {
  test(`${name} renders no empty src or href when its media is empty`, () => {
    const html = renderToStaticMarkup(element);
    expect(html).not.toBe("");
    expect(html).not.toContain('src=""');
    expect(html).not.toContain('href=""');
    expect(html).not.toContain("<img");
  });
}

test("an empty image frame keeps its geometry and shows the muted surface", () => {
  const html = renderToStaticMarkup(surfaces.ProjectCard);
  expect(html).toContain("relative aspect-[484/363] w-full overflow-hidden rounded-[16px] bg-surface-muted");
});

test("a big quote with neither text nor bold renders nothing", () => {
  expect(renderToStaticMarkup(<BigQuote text="" bold="" tail="tail" name="Theo" role="Founder" avatar="/t.jpg" />)).toBe("");
});

test("big quote attribution drops whatever is empty", () => {
  const html = renderToStaticMarkup(<BigQuote text="Quote." bold="" tail="" name="Theo" role="" avatar="" />);
  expect(html).toContain('<p class="t-label whitespace-pre">Theo</p>');
  expect(html).not.toContain("t-micro text-ink-2");
  expect(html).not.toContain("<strong");
  const bare = renderToStaticMarkup(<BigQuote text="Quote." bold="" tail="" name="" role="" avatar="" />);
  expect(bare).not.toContain("flex items-center gap-3");
});

test("article and blog cards hide an empty date; the blog filter skips blank categories", () => {
  const articles = renderToStaticMarkup(surfaces.Articles);
  expect(articles).not.toContain("<time");
  const list = renderToStaticMarkup(<BlogList posts={[post("a"), post("b")]} author="Afan" />);
  expect(list).not.toContain("<time");
  expect(list).not.toContain('<option value="">');
  expect(list).not.toContain('<p class="t-body-sm text-ink-2"></p>');
});

test("a project card without a type drops the empty type line", () => {
  expect(renderToStaticMarkup(surfaces.ProjectCard)).not.toContain('<p class="t-micro text-ink-2"></p>');
});

test("a blog card without a description drops the empty paragraph", () => {
  const list = renderToStaticMarkup(<BlogList posts={[post("a"), post("b")]} author="Afan" />);
  expect(list).not.toContain("line-clamp-3");
});

test("a collage card without a type or thumbnail keeps a clean label and no image", () => {
  const html = renderToStaticMarkup(<ProjectShowcase projects={[bareProject]} collage={[]} />);
  expect(html).toContain('aria-label="P"');
  expect(html).not.toContain("<img");
  expect(html).not.toContain('<p class="t-micro text-ink-2"></p>');
});

test("a project card without a type uses the name alone as its image alt", () => {
  const card = (type: string) =>
    renderToStaticMarkup(<ProjectCard project={{ slug: "p", name: "Namaka", type, thumbnail: "/img/p.jpg" }} />);
  expect(card("")).toContain('alt="Namaka"');
  expect(card("")).not.toContain(" — ");
  expect(card("Booking system")).toContain('alt="Namaka — Booking system"');
});

test("the blog list with no posts shows the empty message and no filters", () => {
  const html = renderToStaticMarkup(<BlogList posts={[]} author="Afan" empty="No articles yet." />);
  expect(html).toContain("No articles yet.");
  expect(html).not.toContain("<input");
  expect(html).not.toContain("<select");
  expect(html).not.toContain('href="/blog/');
});

test("the blog list with posts never shows the empty message", () => {
  const html = renderToStaticMarkup(<BlogList posts={[post("a")]} author="Afan" empty="No articles yet." />);
  expect(html).not.toContain("No articles yet.");
});

test("a project card name may wrap below 768px instead of pushing View Project off screen", () => {
  const html = renderToStaticMarkup(<ProjectCard project={{ slug: "u", name: "Universitas Sunan Gresik", type: "University website", thumbnail: "" }} />);
  expect(html).toContain('<p class="t-h4 whitespace-pre max-md:whitespace-normal">Universitas Sunan Gresik</p>');
});
