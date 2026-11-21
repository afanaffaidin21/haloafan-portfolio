import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MaybeImg, emptyFrame } from "../../src/components/maybe-img";

test("an image with a source renders with every prop in order", () => {
  expect(renderToStaticMarkup(<MaybeImg src="/a.jpg" alt="Afan" loading="lazy" className="size-8" />)).toBe(
    '<img src="/a.jpg" alt="Afan" loading="lazy" class="size-8"/>',
  );
});

test("an empty or missing source renders nothing", () => {
  expect(renderToStaticMarkup(<MaybeImg src="" alt="" />)).toBe("");
  expect(renderToStaticMarkup(<MaybeImg alt="" />)).toBe("");
});

test("an empty frame gets the muted surface; a filled one keeps its classes", () => {
  expect(emptyFrame("")).toBe(" bg-surface-muted");
  expect(emptyFrame(null)).toBe(" bg-surface-muted");
  expect(emptyFrame("/a.jpg")).toBe("");
});
