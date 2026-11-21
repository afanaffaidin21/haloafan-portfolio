import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StickyCta, StickyCtaBar } from "../../src/components/chrome";

const props = { email: "me@example.com", resume: "/cv.pdf" };

test("the bar starts hidden and takes no clicks or focus", () => {
  const html = renderToStaticMarkup(<StickyCta {...props} />);
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('inert=""');
  expect(html).not.toContain("pointer-events-auto");
});

test("a visible bar is clickable and reachable", () => {
  const html = renderToStaticMarkup(<StickyCtaBar visible {...props} />);
  expect(html).not.toContain("inert");
  expect(html).toContain("pointer-events-auto");
  expect(html).toContain('href="mailto:me@example.com"');
  expect(html).toContain('aria-label="Download CV"');
});

test("the bar no longer leaks the pathname to screen readers", () => {
  expect(renderToStaticMarkup(<StickyCtaBar visible {...props} />)).not.toContain("sr-only");
});
