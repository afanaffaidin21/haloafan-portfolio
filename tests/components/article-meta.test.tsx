import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleMeta, DiscussionLinks } from "../../src/components/article-meta";
import { Articles } from "../../src/components/articles";
import { BlogList } from "../../src/components/blog-list";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import type { Post } from "../../src/content/posts";

const basePost = (overrides: Partial<Post> = {}): Post => ({
  slug: "building-with-agents",
  title: "Building with agents",
  description: "Notes on shipping with AI.",
  category: "AI Workflow",
  categoryKey: "ai-workflow",
  date: "Nov 24, 2026",
  publishedAt: "2026-11-24T00:00:00.000Z",
  image: "",
  body: "## Heading\n\nBody.",
  tools: [],
  relatedProjects: [],
  discussion: [],
  aiAssisted: false,
  ...overrides,
});

test("ArticleMeta renders tools, related project links, and AI disclosure when present", () => {
  const html = renderToStaticMarkup(
    <ArticleMeta
      post={basePost({
        tools: ["Claude", "Codex"],
        relatedProjects: [{ slug: "jejak-puncak", name: "Jejak Puncak" }],
        aiAssisted: true,
      })}
      copy={COPY_DEFAULTS.blog}
    />,
  );

  expect(html).toContain("Tools: Claude, Codex");
  expect(html).toContain("Related project");
  // next/link strips trailing slashes outside a Next build where trailingSlash is injected.
  expect(html).toMatch(/href="\/projects\/jejak-puncak\/?"/);
  expect(html).toContain("Jejak Puncak");
  expect(html).toContain(COPY_DEFAULTS.blog.aiDisclosure);
});

test("ArticleMeta renders multiple related projects with links", () => {
  const html = renderToStaticMarkup(
    <ArticleMeta
      post={basePost({
        relatedProjects: [
          { slug: "jejak-puncak", name: "Jejak Puncak" },
          { slug: "namaka", name: "Namaka" },
        ],
      })}
      copy={COPY_DEFAULTS.blog}
    />,
  );

  expect(html).toMatch(/href="\/projects\/jejak-puncak\/?"/);
  expect(html).toMatch(/href="\/projects\/namaka\/?"/);
});

test("ArticleMeta hides tools and related project labels when empty, and renders nothing when all empty", () => {
  const empty = renderToStaticMarkup(
    <ArticleMeta post={basePost({ tools: [], relatedProjects: [], aiAssisted: false })} copy={COPY_DEFAULTS.blog} />,
  );
  expect(empty).toBe("");

  const disclosureOnly = renderToStaticMarkup(
    <ArticleMeta post={basePost({ tools: [], relatedProjects: [], aiAssisted: true })} copy={COPY_DEFAULTS.blog} />,
  );
  expect(disclosureOnly).not.toContain(COPY_DEFAULTS.blog.toolsLabel);
  expect(disclosureOnly).not.toContain(COPY_DEFAULTS.blog.relatedLabel);
  expect(disclosureOnly).toContain(COPY_DEFAULTS.blog.aiDisclosure);
});

test("ArticleMeta hides the disclosure when aiAssisted is false", () => {
  const html = renderToStaticMarkup(
    <ArticleMeta post={basePost({ tools: ["Claude"], aiAssisted: false })} copy={COPY_DEFAULTS.blog} />,
  );

  expect(html).toContain("Tools: Claude");
  expect(html).not.toContain(COPY_DEFAULTS.blog.aiDisclosure);
});

test("DiscussionLinks renders nothing for an empty list", () => {
  expect(renderToStaticMarkup(<DiscussionLinks items={[]} label={COPY_DEFAULTS.blog.discussedOn} />)).toBe("");
});

test("DiscussionLinks renders platform icon links with accessible labels", () => {
  const url = "https://www.threads.com/@afanaffaidin/post/1";
  const html = renderToStaticMarkup(
    <DiscussionLinks
      items={[
        { platform: "threads", url },
        { platform: "youtube", url: "https://www.youtube.com/watch?v=1" },
      ]}
      label={COPY_DEFAULTS.blog.discussedOn}
    />,
  );

  expect(html).toContain(COPY_DEFAULTS.blog.discussedOn);
  expect(html).toContain(`href="${url}"`);
  expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  expect(html).toMatch(/aria-label="[^"]*Threads[^"]*"/);
  expect(html).toMatch(/aria-label="[^"]*YouTube[^"]*"/);
  expect(html).toContain("<svg");
});

test("blog cards and home articles cards display the category label when present", () => {
  const posts = [
    basePost({ slug: "one", title: "One", category: "AI Workflow" }),
    basePost({ slug: "two", title: "Two", category: "Experiments" }),
    basePost({ slug: "three", title: "Three", category: "AI in Products" }),
  ];

  const listHtml = renderToStaticMarkup(<BlogList posts={posts} author="Afan" />);
  expect(listHtml).toContain('<p class="t-micro text-ink-2">AI Workflow</p>');
  expect(listHtml).toContain('<p class="t-micro text-ink-2">Experiments</p>');
  expect(listHtml).toContain('<option value="AI Workflow">AI Workflow</option>');

  const articlesHtml = renderToStaticMarkup(
    <Articles posts={posts} author="Afan" copy={COPY_DEFAULTS.articles} />,
  );
  expect(articlesHtml).toContain('<p class="t-micro text-ink-2">AI Workflow</p>');
  expect(articlesHtml).toContain('<p class="t-micro text-ink-2">Experiments</p>');
  expect(articlesHtml).toContain('<p class="t-micro text-ink-2">AI in Products</p>');

  const uncategorized = renderToStaticMarkup(
    <BlogList posts={[basePost({ slug: "bare", category: "" })]} author="Afan" />,
  );
  expect(uncategorized).not.toContain('<p class="t-micro text-ink-2"></p>');
});

test("blog and articles copy defaults match the AI notes framing", () => {
  expect(COPY_DEFAULTS.blog.toolsLabel).toBe("Tools");
  expect(COPY_DEFAULTS.blog.relatedLabel).toBe("Related project");
  expect(COPY_DEFAULTS.blog.aiDisclosure).toBe(
    "Written with AI assistance. The ideas, tests, and decisions are mine.",
  );
  expect(COPY_DEFAULTS.blog.discussedOn).toBe("Discussed on");
  expect(COPY_DEFAULTS.blog.title).toBe("Notes on web development and AI");
  expect(COPY_DEFAULTS.blog.intro).toBe(
    "Experiments, workflows, and lessons from building websites and web apps with AI.",
  );
  expect(COPY_DEFAULTS.articles.heading.line2).toBe("notes on web and AI.");
});
