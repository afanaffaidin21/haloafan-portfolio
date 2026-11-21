import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Skills } from "../../src/components/skills";
import { COPY_DEFAULTS } from "../../src/lib/copy-defaults";

test("a skill with an unknown icon still renders", () => {
  const html = renderToStaticMarkup(
    <Skills
      skills={[
        {
          name: "Weird",
          group: "build",
          variant: "row",
          icon: "nope",
          strength: "working",
          order: 1,
        },
      ]}
      copy={COPY_DEFAULTS.skills}
    />,
  );
  expect(html).toContain("Weird");
});

test("skills with no rows render nothing", () => {
  expect(renderToStaticMarkup(<Skills skills={[]} copy={COPY_DEFAULTS.skills} />)).toBe("");
});
