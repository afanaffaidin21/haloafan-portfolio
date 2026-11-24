import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enable: vi.fn(),
  disable: vi.fn(),
  auth: vi.fn(),
  getPost: vi.fn(),
}));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false, enable: mocks.enable, disable: mocks.disable })),
}));

vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ auth: mocks.auth })),
}));

vi.mock("@/payload.config", () => ({
  default: {},
}));

vi.mock("@/lib/content", () => ({
  getPost: mocks.getPost,
}));

const { enable, disable, auth, getPost } = mocks;

import { GET } from "../../src/app/(site)/preview/route";
import { POST } from "../../src/app/(site)/preview/exit/route";

beforeEach(() => {
  enable.mockReset();
  disable.mockReset();
  auth.mockReset();
  getPost.mockReset();
});

describe("GET /preview/", () => {
  test("returns 401 and does not enable Draft Mode for anonymous requests", async () => {
    auth.mockResolvedValue({ user: null });
    const res = await GET(new Request("http://localhost:3100/preview/?slug=ai-notes"));
    expect(res.status).toBe(401);
    expect(enable).not.toHaveBeenCalled();
  });

  test("returns 401 and does not enable Draft Mode for agent users", async () => {
    auth.mockResolvedValue({ user: { id: 2, role: "agent" } });
    const res = await GET(new Request("http://localhost:3100/preview/?slug=ai-notes"));
    expect(res.status).toBe(401);
    expect(enable).not.toHaveBeenCalled();
  });

  test("returns 400 and does not enable Draft Mode for invalid slugs", async () => {
    auth.mockResolvedValue({ user: { id: 1, role: "owner" } });
    for (const slug of ["", "//evil.com", "../x", "a/b"]) {
      const res = await GET(new Request(`http://localhost:3100/preview/?slug=${encodeURIComponent(slug)}`));
      expect(res.status).toBe(400);
      expect(res.headers.get("location")).toBeNull();
      expect(enable).not.toHaveBeenCalled();
    }
  });

  test("returns 404 and does not enable Draft Mode when no post exists", async () => {
    auth.mockResolvedValue({ user: { id: 1, role: "owner" } });
    getPost.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost:3100/preview/?slug=missing-post"));
    expect(res.status).toBe(404);
    expect(getPost).toHaveBeenCalledWith("missing-post", { draft: true });
    expect(enable).not.toHaveBeenCalled();
  });

  test("enables Draft Mode and redirects 307 to /blog/<slug>/ for owner with existing draft", async () => {
    auth.mockResolvedValue({ user: { id: 1, role: "owner" } });
    getPost.mockResolvedValue({ slug: "ai-notes" });
    const res = await GET(new Request("http://localhost:3100/preview/?slug=ai-notes"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3100/blog/ai-notes/");
    expect(enable).toHaveBeenCalledTimes(1);
  });
});

describe("POST /preview/exit/", () => {
  test("disables Draft Mode and redirects 303 to /blog/<slug>/ for valid slug", async () => {
    const res = await POST(new Request("http://localhost:3100/preview/exit/?slug=ai-notes", { method: "POST" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://localhost:3100/blog/ai-notes/");
    expect(disable).toHaveBeenCalledTimes(1);
  });

  test("disables Draft Mode and redirects 303 to /blog/ when slug is missing or invalid", async () => {
    for (const query of ["", "?slug=//evil.com", "?slug=../x"]) {
      disable.mockReset();
      const res = await POST(new Request(`http://localhost:3100/preview/exit/${query}`, { method: "POST" }));
      expect(res.status).toBe(303);
      expect(res.headers.get("location")).toBe("http://localhost:3100/blog/");
      expect(disable).toHaveBeenCalledTimes(1);
    }
  });
});
