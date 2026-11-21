import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { About } from "../../src/components/about";
import { Footer } from "../../src/components/footer";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import type { SiteSettingsView } from "../../src/lib/content";

const socials: SiteSettingsView["socials"] = [
  { platform: "github", url: "https://github.com/afan" },
  { platform: "x", url: "https://x.com/afan" },
];

const footer = (props: Partial<Parameters<typeof Footer>[0]> = {}) =>
  renderToStaticMarkup(
    <Footer
      name="Afan Affaidin"
      email="me@example.com"
      resume=""
      socials={[]}
      followerCount="1,214"
      copyright="©"
      wordmark=""
      copy={COPY_DEFAULTS.footer}
      {...props}
    />,
  );

const about = (site: Partial<Parameters<typeof About>[0]["site"]> = {}, photo = "") =>
  renderToStaticMarkup(
    <About
      workHistory={[]}
      site={{ name: "Afan", role: "Designer", followerCount: "1,214", socials: [], signature: "", ...site }}
      photo={photo}
      copy={COPY_DEFAULTS.about}
    />,
  );

/** Every outbound link a social chip would render. */
const externalLinks = (html: string) => html.match(/href="https:\/\/[^"]*"/g) ?? [];

test("the footer renders no social links when the CMS has none", () => {
  expect(externalLinks(footer())).toEqual([]);
});

test("footer chips follow the CMS order, open in a new tab, and only X carries the count", () => {
  const html = footer({ socials });
  expect(externalLinks(html)).toEqual(['href="https://github.com/afan"', 'href="https://x.com/afan"']);
  expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(2);
  expect(html.match(/1,214/g)).toHaveLength(1);
  expect(html).toContain('aria-label="GitHub"');
});

test("the footer wordmark derives from the first name unless one is set", () => {
  expect(footer()).toContain(">AFAN</p>");
  expect(footer({ wordmark: "STUDIO" })).toContain(">STUDIO</p>");
  expect(footer({ name: "", wordmark: "" })).not.toContain("JOSEPH");
});

test("about renders no social links, photo, or signature when the CMS has none", () => {
  const html = about();
  expect(externalLinks(html)).toEqual([]);
  expect(html).not.toContain("<img");
  expect(html).toContain("bg-surface-muted");
});

test("about chips come from the CMS; the X chip shows the follower count", () => {
  const html = about({ socials, signature: "/sig.png" }, "/me.jpg");
  expect(externalLinks(html)).toEqual(['href="https://github.com/afan"', 'href="https://x.com/afan"']);
  expect(html).toContain('aria-label="X Link"');
  expect(html.match(/1,214/g)).toHaveLength(1);
  expect(html).toContain('src="/me.jpg"');
  expect(html).toContain('src="/sig.png"');
  expect(html).not.toContain("bg-surface-muted");
});

test("about renders the CMS paragraphs", () => {
  expect(about()).toContain(COPY_DEFAULTS.about.paragraphs[0].lead);
});
