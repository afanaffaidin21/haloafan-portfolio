import fs from "node:fs/promises";
import path from "node:path";

import { afterAll, beforeAll, expect, test } from "vitest";
import type { Payload } from "payload";

const DB_FILE = path.resolve(process.cwd(), "tmp-test-visibility.db");

const savedEnv = {
  DATABASE_URI: process.env.DATABASE_URI,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
};

let payload: Payload;
let getPosts: typeof import("../../src/lib/content").getPosts;
let getPost: typeof import("../../src/lib/content").getPost;
let getPostsForProject: typeof import("../../src/lib/content").getPostsForProject;

async function cleanupDbFiles(): Promise<void> {
  await Promise.all(
    [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`].map(async (file) => {
      try {
        await fs.rm(file, { force: true });
      } catch (error) {
        // On Windows, libsql keeps the SQLite handle until the worker exits;
        // vitest globalSetup teardown removes the file once the worker shuts down.
        if (process.platform !== "win32" || (error as NodeJS.ErrnoException).code !== "EBUSY") {
          throw error;
        }
      }
    }),
  );
}

beforeAll(async () => {
  await cleanupDbFiles();
  process.env.DATABASE_URI = `file:${DB_FILE.replaceAll("\\", "/")}`;
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || "test-secret-for-post-visibility-check";

  const [{ getPayload }, { default: config }, content] = await Promise.all([
    import("payload"),
    import("../../src/payload.config"),
    import("../../src/lib/content"),
  ]);

  getPosts = content.getPosts;
  getPost = content.getPost;
  getPostsForProject = content.getPostsForProject;
  payload = await getPayload({ config });
}, 60_000);

afterAll(async () => {
  try {
    if (payload) {
      const db = payload.db as { client?: { close?: () => void } };
      db.client?.close?.();
      await payload.destroy();
    }
    await cleanupDbFiles();
  } finally {
    if (savedEnv.DATABASE_URI === undefined) delete process.env.DATABASE_URI;
    else process.env.DATABASE_URI = savedEnv.DATABASE_URI;
    if (savedEnv.PAYLOAD_SECRET === undefined) delete process.env.PAYLOAD_SECRET;
    else process.env.PAYLOAD_SECRET = savedEnv.PAYLOAD_SECRET;
  }
});

test("public post reads exclude drafts and draft edits while preview reads latest draft", async () => {
  const project = await payload.create({
    collection: "projects",
    data: {
      name: "Jejak Puncak",
      slug: "jejak-puncak",
      kind: "client",
    },
  });

  const postA = await payload.create({
    collection: "posts",
    draft: false,
    data: {
      title: "Published A",
      slug: "a",
      category: "ai-workflow",
      publishedAt: "2026-11-24T00:00:00.000Z",
      relatedProjects: [project.id],
      _status: "published",
    },
  });

  await payload.create({
    collection: "posts",
    draft: true,
    data: {
      title: "Draft B",
      slug: "b",
      category: "experiments",
      publishedAt: "2026-11-25T00:00:00.000Z",
      relatedProjects: [project.id],
    },
  });

  await payload.update({
    collection: "posts",
    id: postA.id,
    draft: true,
    data: {
      title: "Draft Edit A",
    },
  });

  const allPosts = await getPosts();
  expect(allPosts).toHaveLength(1);
  expect(allPosts[0].slug).toBe("a");
  expect(allPosts[0].title).toBe("Published A");

  const publicA = await getPost("a");
  expect(publicA?.title).toBe("Published A");

  const draftA = await getPost("a", { draft: true });
  expect(draftA?.title).toBe("Draft Edit A");

  const publicB = await getPost("b");
  expect(publicB).toBeNull();

  const draftB = await getPost("b", { draft: true });
  expect(draftB).not.toBeNull();
  expect(draftB?.slug).toBe("b");
  expect(draftB?.title).toBe("Draft B");

  const projectPosts = await getPostsForProject("jejak-puncak");
  expect(projectPosts).toHaveLength(1);
  expect(projectPosts[0].slug).toBe("a");
  expect(projectPosts[0].title).toBe("Published A");
  expect(projectPosts.some((p) => p.slug === "b")).toBe(false);

  expect(await getPostsForProject("nonexistent")).toEqual([]);

  // Adding an older published post checks newest-first ordering across both list getters.
  await payload.create({
    collection: "posts",
    draft: false,
    data: {
      title: "Older Published C",
      slug: "c",
      category: "wordpress",
      publishedAt: "2026-10-01T00:00:00.000Z",
      relatedProjects: [project.id],
      _status: "published",
    },
  });

  expect((await getPosts()).map((p) => p.slug)).toEqual(["a", "c"]);
  expect((await getPostsForProject("jejak-puncak")).map((p) => p.slug)).toEqual(["a", "c"]);

  // Unpublishing A immediately removes it from public reads while keeping preview working.
  await payload.update({
    collection: "posts",
    id: postA.id,
    data: {
      _status: "draft",
    },
  });

  expect((await getPosts()).map((p) => p.slug)).toEqual(["c"]);
  expect(await getPost("a")).toBeNull();
  expect((await getPost("a", { draft: true }))?.slug).toBe("a");
  expect((await getPostsForProject("jejak-puncak")).map((p) => p.slug)).toEqual(["c"]);
}, 60_000);
