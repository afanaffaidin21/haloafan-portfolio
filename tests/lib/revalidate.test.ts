import { expect, test } from "vitest";

import { shouldRevalidatePost } from "../../src/lib/revalidate";

test("shouldRevalidatePost returns false for draft-to-draft and new drafts, true when either side is published", () => {
  expect(shouldRevalidatePost({ doc: { _status: "draft" }, previousDoc: { _status: "draft" } })).toBe(false);
  expect(shouldRevalidatePost({ doc: { _status: "published" }, previousDoc: { _status: "draft" } })).toBe(true);
  expect(shouldRevalidatePost({ doc: { _status: "draft" }, previousDoc: { _status: "published" } })).toBe(true);
  expect(shouldRevalidatePost({ doc: { _status: "published" }, previousDoc: { _status: "published" } })).toBe(true);
  expect(shouldRevalidatePost({ doc: { _status: "draft" } })).toBe(false);
  expect(shouldRevalidatePost({ doc: { _status: "draft" }, previousDoc: null })).toBe(false);
  expect(shouldRevalidatePost({ doc: { _status: "published" } })).toBe(true);
});
