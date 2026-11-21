import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { MobileNav, Nav } from "../../src/components/nav";
import { navLinks } from "../../src/lib/nav";

const props = { avatar: "/a.jpg", name: "Afan Affaidin", email: "me@example.com" };
const labels = [...navLinks.map((l) => l.label), "Email me"];

test("the server render is the desktop pill and still carries every link", () => {
  const html = renderToStaticMarkup(<Nav {...props} />);
  for (const label of labels) expect(html).toContain(`>${label}</a>`);
  expect(html).toContain('href="mailto:me@example.com"');
  // The desktop markup has no menu button: hovering or focusing the pill opens it.
  expect(html).not.toContain("aria-controls");
});

test("the mobile menu button is a real button that controls the panel", () => {
  const html = renderToStaticMarkup(<MobileNav {...props} />);
  const button = /<button[^>]*aria-label="Open menu"[^>]*>/.exec(html)?.[0] ?? "";
  expect(button).toContain('type="button"');
  expect(button).toContain('aria-expanded="false"');
  const controls = /aria-controls="([^"]+)"/.exec(button)?.[1];
  expect(controls).toBeTruthy();
  expect(html).toContain(`id="${controls}"`);
  // A 44x44 touch target around the 24px dots.
  expect(button).toContain("size-11");
});

test("the mobile panel lists every link, Email me, and the theme toggle with 44px targets", () => {
  const html = renderToStaticMarkup(<MobileNav {...props} />);
  const panel = html.slice(html.indexOf('id="nav-menu"'));
  for (const label of labels) expect(panel).toContain(`>${label}</a>`);
  expect(panel).toContain('aria-label="Toggle dark mode"');
  expect(panel.match(/min-h-11/g)?.length).toBeGreaterThanOrEqual(labels.length);
  // Closed: hidden from the tab order and from pointer and assistive tech.
  expect(panel).toMatch(/^id="nav-menu"[^>]*class="[^"]*\binvisible\b/);
});

test("the mobile panel is nearly opaque so the page behind does not read through", () => {
  const html = renderToStaticMarkup(<MobileNav {...props} />);
  const panel = /<div id="nav-menu"[^>]*class="([^"]+)"/.exec(html)?.[1] ?? "";
  expect(panel).toContain("bg-surface/95");
  expect(panel).toContain("backdrop-blur-[5px]");
  expect(panel).toContain("rounded-[32px]");
  expect(panel).toContain("border-line/70");
});
