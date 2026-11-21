import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Footer } from "../../src/components/footer";
import { MobileNav } from "../../src/components/nav";
import { ProjectHero } from "../../src/components/project-detail";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";
import { toProjectView } from "../../src/lib/content";

test("the tap-target utility centres an invisible 44x44 box on its element", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const rule = css.slice(css.indexOf("@utility tap-target"), css.indexOf("@utility tap-target") + 400);
  expect(rule).toContain("width: max(100%, 44px)");
  expect(rule).toContain("height: max(100%, 44px)");
  expect(rule).toContain("transform: translate(-50%, -50%)");
});

test("below 768px every small footer control gets a 44px target without changing its size", () => {
  const html = renderToStaticMarkup(
    <Footer
      name="Afan Affaidin"
      email="me@example.com"
      resume="/cv.pdf"
      socials={[{ platform: "github", url: "https://github.com/a" }]}
      followerCount=""
      copyright="© 2026 Afan Affaidin"
      wordmark=""
      copy={COPY_DEFAULTS.footer}
    />,
  );
  const tagged = (needle: string) => new RegExp(`<[^>]*class="[^"]*max-md:relative max-md:tap-target[^"]*"[^>]*>(?:<[^>]+>)*${needle}`).test(html);
  for (const label of ["me@example.com", "Download CV", "Work", "Skills", "Blog", "Contact"]) expect(tagged(label), label).toBe(true);
  expect(html).toContain('aria-label="GitHub" class="flex h-[30px]');
  expect(html.match(/h-\[30px\][^"]*max-md:tap-target/g)?.length).toBe(1);
  expect(html).toMatch(/size-\[30px\][^"]*max-md:tap-target/);
});

test("the mobile nav home link and the project links reach 44px", () => {
  const nav = renderToStaticMarkup(<MobileNav avatar="" name="Afan Affaidin" email="me@example.com" />);
  expect(nav).toMatch(/<a class="relative flex shrink-0 items-center gap-2 tap-target"[^>]*href="\/"/);
  const hero = renderToStaticMarkup(
    <ProjectHero project={toProjectView({ slug: "s", name: "n", liveUrl: "https://x.example", repoUrl: "https://github.com/a/b" })} />,
  );
  expect(hero.match(/max-md:min-h-11/g)?.length).toBe(2);
});
