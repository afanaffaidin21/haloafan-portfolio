import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PreviewBar } from "../../src/components/preview-bar";

test("renders the preview label and a POST exit form for the slug", () => {
  const html = renderToStaticMarkup(
    <PreviewBar slug="ai-notes" label="Preview, not published" exitLabel="Exit preview" />,
  );
  expect(html).toContain('role="status"');
  expect(html).toContain("Preview, not published");
  expect(html).toContain("Exit preview");
  const formTag = html.match(/<form\b[^>]*>/i)?.[0] ?? "";
  expect(formTag).toContain('method="post"');
  expect(formTag).toContain('action="/preview/exit/?slug=ai-notes"');
  expect(html).toContain("bg-invert");
  expect(html).toContain("text-invert-ink");
});
