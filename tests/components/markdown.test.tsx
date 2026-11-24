import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "../../src/components/markdown";

const render = (source: string) => renderToStaticMarkup(<Markdown source={source} />);

describe("Markdown", () => {
  test("preserves headings, blockquotes, bold, italic, and skips h1", () => {
    const html = render(
      [
        "# Ignored title",
        "",
        "## Section",
        "",
        "### Subsection",
        "",
        "Some **bold** and *italic* text.",
        "",
        "> A **quoted** thought.",
      ].join("\n"),
    );

    expect(html).not.toContain("Ignored title");
    expect(html).toContain('<h2 class="t-h3 mt-8">Section</h2>');
    expect(html).toContain('<h3 class="t-h4 mt-6">Subsection</h3>');
    expect(html).toContain(
      '<p class="t-body">Some <strong class="font-semibold">bold</strong> and <em>italic</em> text.</p>',
    );
    expect(html).toContain(
      '<blockquote class="my-2 border-l-2 border-ink pl-6"><p class="t-h4">A <strong class="font-semibold">quoted</strong> thought.</p></blockquote>',
    );
  });

  test("renders safe external, relative, hash, and standalone links", () => {
    const ext = render("[Repo](https://github.com/x)");
    expect(ext).toContain('href="https://github.com/x"');
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noopener noreferrer"');
    expect(ext).toContain(">Repo</a>");

    const internal = render("Read [the blog](/blog/) or [jump](#top).");
    expect(internal).toContain('<a href="/blog/"');
    expect(internal).toContain('<a href="#top"');
    expect(internal).not.toContain('target="_blank"');
    expect(internal).not.toContain('rel="noopener noreferrer"');
  });

  test("strips unsafe link URLs down to plain text without href", () => {
    for (const url of [
      "javascript:alert(1)",
      "http://a.com",
      "//evil.com",
      "data:text/html,x",
    ]) {
      const html = render(`[x](${url})`);
      expect(html).toContain('<p class="t-body">x</p>');
      expect(html).not.toContain("<a");
      expect(html).not.toContain("href=");
    }
  });

  test("renders inline code without parsing formatting or links inside it", () => {
    const html = render(
      "Run `**bold** *italic* [link](https://a.com)` in your shell.",
    );
    expect(html).toContain("<code");
    expect(html).toContain("font-mono");
    expect(html).toContain("**bold** *italic* [link](https://a.com)</code>");
    expect(html).not.toContain("<strong");
    expect(html).not.toContain("<em");
    expect(html).not.toContain("<a");
  });

  test("renders unordered and ordered lists with one nesting level", () => {
    const ul = render("- a\n- b");
    expect(ul).toContain("<ul");
    expect(ul.match(/<li/g)).toHaveLength(2);
    expect(ul).toContain("<li>a</li>");
    expect(ul).toContain("<li>b</li>");

    const ol = render("1. a\n2. b");
    expect(ol).toContain("<ol");
    expect(ol.match(/<li/g)).toHaveLength(2);
    expect(ol).toContain("<li>a</li>");
    expect(ol).toContain("<li>b</li>");

    const nested = render(
      ["- parent", "  - child one", "  - child two", "- sibling"].join("\n"),
    );
    expect(nested.match(/<ul/g)).toHaveLength(2);
    expect(nested).toContain("<li>parent<ul");
    expect(nested).toContain("<li>child one</li>");
    expect(nested).toContain("<li>child two</li>");
    expect(nested).toContain("<li>sibling</li>");

    const nestedOrdered = render(
      ["1. first", "\t1. sub one", "\t2. sub two", "2. second"].join("\n"),
    );
    expect(nestedOrdered.match(/<ol/g)).toHaveLength(2);
    expect(nestedOrdered).toContain("<li>first<ol");
    expect(nestedOrdered).toContain("<li>sub one</li>");
    expect(nestedOrdered).toContain("<li>sub two</li>");
  });

  test("renders fenced code blocks with optional language label and handles unclosed fences", () => {
    const fenced = render("```ts\nconst x = 1;\n```");
    expect(fenced).toContain(">ts</div>");
    expect(fenced).toContain("<pre");
    expect(fenced).toContain("overflow-x-auto");
    expect(fenced).toContain('<code class="font-mono">const x = 1;</code>');

    const plain = render("```\nhello **world**\n```");
    expect(plain).toContain("<pre");
    expect(plain).toContain('<code class="font-mono">hello **world**</code>');
    expect(plain).not.toContain("<strong");
    expect(plain).not.toContain("border-b border-line");

    const unclosed = render("```ts\nconst a = 1;\nconst b = 2;");
    expect(unclosed).toContain(">ts</div>");
    expect(unclosed).toContain("<pre");
    expect(unclosed).toContain('<code class="font-mono">const a = 1;\nconst b = 2;</code>');
  });

  test("renders captioned lazy images via figure and strips unsafe image sources", () => {
    const captioned = render('![Diagram](/img/a.jpg "Flow")');
    expect(captioned).toContain("<figure");
    expect(captioned).toContain('src="/img/a.jpg"');
    expect(captioned).toContain('alt="Diagram"');
    expect(captioned).toContain('loading="lazy"');
    expect(captioned).toContain("rounded-[16px]");
    expect(captioned).toContain("<figcaption");
    expect(captioned).toContain(">Flow</figcaption>");

    const noCaption = render("![Diagram](https://example.com/a.jpg)");
    expect(noCaption).toContain("<figure");
    expect(noCaption).toContain('src="https://example.com/a.jpg"');
    expect(noCaption).toContain('alt="Diagram"');
    expect(noCaption).toContain('loading="lazy"');
    expect(noCaption).not.toContain("<figcaption");

    const bad = render('![Secret](javascript:alert(1) "Flow")');
    expect(bad).toContain("Secret");
    expect(bad).not.toContain("<img");
    expect(bad).not.toContain("<figure");
    expect(bad).not.toContain("javascript:");

    const httpImg = render("![Insecure](http://example.com/a.jpg)");
    expect(httpImg).toContain("Insecure");
    expect(httpImg).not.toContain("<img");
    expect(httpImg).not.toContain("<figure");
  });

  test("renders horizontal rules", () => {
    expect(render("---")).toContain('<hr class="border-line"/>');
    expect(render("***")).toContain('<hr class="border-line"/>');
    expect(render("___")).toContain('<hr class="border-line"/>');
  });

  test("escapes raw HTML such as script tags", () => {
    const html = render("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");

    const inCode = render("```html\n<script>alert(1)</script>\n```");
    expect(inCode).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(inCode).not.toContain("<script>");
  });
});
