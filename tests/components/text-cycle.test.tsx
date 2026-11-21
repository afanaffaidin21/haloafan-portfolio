import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { TextCycle } from "../../src/components/text-cycle";

test("below 1200px the cycling word box takes its line height, so it sits on the lead's baseline", () => {
  const html = renderToStaticMarkup(<TextCycle words={["build", "fix", "launch"]} />);
  // 68px is the 72px t-h1 line from 1200px; below that the invisible sizer sets the height.
  expect(html).toMatch(/^<span class="relative inline-block h-\[68px\] max-xl:h-auto overflow-hidden align-baseline">/);
  expect(html).toContain('<span class="invisible t-h1 whitespace-pre">launch</span>');
});
