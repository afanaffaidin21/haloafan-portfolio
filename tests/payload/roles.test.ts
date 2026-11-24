import { describe, expect, test } from "vitest";
import type { AccessArgs } from "payload";

import { isAgent, isOwner, ownerOnly, ownerOrAgent } from "../../src/access/roles";
import { rejectAgentPublish } from "../../src/collections/Posts";

function argsFor(user: unknown): AccessArgs {
  return { req: { user } } as unknown as AccessArgs;
}

describe("role predicates", () => {
  test("isOwner returns true only for role 'owner'", () => {
    expect(isOwner({ role: "owner" })).toBe(true);
    expect(isOwner({ role: "agent" })).toBe(false);
    expect(isOwner(null)).toBe(false);
    expect(isOwner(undefined)).toBe(false);
    expect(isOwner({})).toBe(false);
    expect(isOwner("owner")).toBe(false);
  });

  test("isAgent returns true only for role 'agent'", () => {
    expect(isAgent({ role: "agent" })).toBe(true);
    expect(isAgent({ role: "owner" })).toBe(false);
    expect(isAgent(null)).toBe(false);
    expect(isAgent(undefined)).toBe(false);
    expect(isAgent({})).toBe(false);
  });
});

describe("access helpers", () => {
  test("ownerOnly allows owner and denies agent or unauthenticated", () => {
    expect(ownerOnly(argsFor({ role: "owner" }))).toBe(true);
    expect(ownerOnly(argsFor({ role: "agent" }))).toBe(false);
    expect(ownerOnly(argsFor(null))).toBe(false);
    expect(ownerOnly(argsFor(undefined))).toBe(false);
  });

  test("ownerOrAgent allows both owner and agent and denies others", () => {
    expect(ownerOrAgent(argsFor({ role: "owner" }))).toBe(true);
    expect(ownerOrAgent(argsFor({ role: "agent" }))).toBe(true);
    expect(ownerOrAgent(argsFor(null))).toBe(false);
    expect(ownerOrAgent(argsFor(undefined))).toBe(false);
    expect(ownerOrAgent(argsFor({ role: "guest" }))).toBe(false);
  });
});

describe("rejectAgentPublish", () => {
  const callHook = (args: {
    user: unknown;
    data: Record<string, unknown>;
    originalDoc?: Record<string, unknown>;
    context?: Record<string, unknown>;
    query?: Record<string, unknown>;
  }) =>
    rejectAgentPublish({
      data: args.data,
      originalDoc: args.originalDoc,
      req: {
        user: args.user,
        context: args.context ?? {},
        query: args.query ?? {},
      },
    } as never);

  test("rejects when context.postDraftSave is explicitly false even if req.query.draft is 'true'", () => {
    expect(() =>
      callHook({
        user: { role: "agent" },
        data: { title: "Nested non-draft update", _status: "draft" },
        originalDoc: { _status: "draft" },
        context: { postDraftSave: false },
        query: { draft: "true" },
      }),
    ).toThrow(/draft/i);
  });

  test("rejects non-draft agent saves even when originalDoc._status is draft", () => {
    expect(() =>
      callHook({
        user: { role: "agent" },
        data: { title: "Edit without draft flag" },
        originalDoc: { _status: "draft" },
        context: { postDraftSave: false },
      }),
    ).toThrow(/draft/i);
  });

  test("allows draft agent saves when context.postDraftSave is unset and req.query.draft is 'true'", () => {
    const data = { title: "Draft save", _status: "draft" };
    expect(
      callHook({
        user: { role: "agent" },
        data,
        originalDoc: { _status: "draft" },
        context: {},
        query: { draft: "true" },
      }),
    ).toBe(data);
  });
});
