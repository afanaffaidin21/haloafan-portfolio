import fs from "node:fs/promises";
import path from "node:path";

import { afterAll, beforeAll, expect, test } from "vitest";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";

const DB_FILE = path.resolve(process.cwd(), "tmp-test-agent-access.db");
const MEDIA_DIR = path.resolve(process.cwd(), "media");
const TEST_UPLOAD_PREFIX = "tmp-test-agent-upload";

// Minimal valid 1x1 transparent PNG so Sharp can process imageSizes cleanly.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

const savedEnv = {
  DATABASE_URI: process.env.DATABASE_URI,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
};

let payload: Payload;
const uploadedMediaIds: Array<number | string> = [];

async function cleanupDbFiles(): Promise<void> {
  await Promise.all(
    [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`].map(async (file) => {
      try {
        await fs.rm(file, { force: true });
      } catch (error) {
        if (process.platform !== "win32" || (error as NodeJS.ErrnoException).code !== "EBUSY") {
          throw error;
        }
      }
    }),
  );
}

async function cleanupTestMediaFiles(): Promise<void> {
  try {
    const entries = await fs.readdir(MEDIA_DIR);
    await Promise.all(
      entries
        .filter((name) => name.startsWith(TEST_UPLOAD_PREFIX))
        .map((name) => fs.rm(path.join(MEDIA_DIR, name), { force: true }).catch(() => {})),
    );
  } catch {
    // media directory may not exist
  }
}

async function expectRejectedWithStatus(promise: Promise<unknown>, expectedStatus?: number): Promise<void> {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  expect(caught, "Expected operation to reject").toBeDefined();
  if (expectedStatus !== undefined) {
    const status = (caught as { status?: number })?.status;
    expect(status).toBe(expectedStatus);
  }
}

beforeAll(async () => {
  await cleanupDbFiles();
  await cleanupTestMediaFiles();
  process.env.DATABASE_URI = `file:${DB_FILE.replaceAll("\\", "/")}`;
  process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || "test-secret-for-agent-access-check";

  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("../../src/payload.config"),
  ]);

  payload = await getPayload({ config });
}, 60_000);

afterAll(async () => {
  try {
    if (payload) {
      for (const id of uploadedMediaIds) {
        await payload.delete({ collection: "media", id, overrideAccess: true }).catch(() => {});
      }
      const db = payload.db as { client?: { close?: () => void } };
      db.client?.close?.();
      await payload.destroy();
    }
    await cleanupTestMediaFiles();
    await cleanupDbFiles();
  } finally {
    if (savedEnv.DATABASE_URI === undefined) delete process.env.DATABASE_URI;
    else process.env.DATABASE_URI = savedEnv.DATABASE_URI;
    if (savedEnv.PAYLOAD_SECRET === undefined) delete process.env.PAYLOAD_SECRET;
    else process.env.PAYLOAD_SECRET = savedEnv.PAYLOAD_SECRET;
  }
});

test("first user becomes owner, API key authenticates agent, and server-side access limits hold", async () => {
  // 1. First user in an empty DB becomes owner even if created with role: "agent".
  const owner = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      email: "owner@example.com",
      password: "owner-test-password-123",
      role: "agent",
    },
  });
  expect(owner.role).toBe("owner");

  // 2. Owner creates an agent user with an API key (role defaults to "agent" when omitted).
  const agent = await payload.create({
    collection: "users",
    user: owner,
    overrideAccess: false,
    data: {
      email: "agent@example.com",
      password: "agent-test-password-123",
      enableAPIKey: true,
      apiKey: "agent-test-api-key-value-1234567890",
    } as unknown as RequiredDataFromCollectionSlug<"users">,
  });
  expect(agent.role).toBe("agent");

  // API key authentication resolves the agent user with its role.
  const authResult = await payload.auth({
    headers: new Headers({
      Authorization: "users API-Key agent-test-api-key-value-1234567890",
    }),
  });
  expect(authResult.user?.id).toBe(agent.id);
  expect(authResult.user?.role).toBe("agent");

  // Admin panel access: owner true, agent false.
  const usersAccess = payload.collections.users.config.access;
  expect(await usersAccess.admin?.({ req: { user: owner } as never })).toBe(true);
  expect(await usersAccess.admin?.({ req: { user: agent } as never })).toBe(false);
  expect(await usersAccess.admin?.({ req: { user: null } as never })).toBe(false);

  // Seed baseline project, skill, faq, and site-settings as owner.
  const project = await payload.create({
    collection: "projects",
    user: owner,
    overrideAccess: false,
    data: {
      name: "Jejak Puncak",
      slug: "jejak-puncak",
      kind: "client",
    },
  });

  const skill = await payload.create({
    collection: "skills",
    user: owner,
    overrideAccess: false,
    data: {
      name: "TypeScript",
      group: "build",
      variant: "row",
    },
  });

  const faq = await payload.create({
    collection: "faqs",
    user: owner,
    overrideAccess: false,
    data: {
      question: "Available?",
      answer: "Yes.",
    },
  });

  await payload.updateGlobal({
    slug: "site-settings",
    user: owner,
    overrideAccess: false,
    data: {
      name: "Afan",
      role: "Developer",
      email: "afan@example.com",
      availabilityStatus: "open",
    },
  });

  // 3. Agent reads projects (needed for relatedProjects).
  const readableProjects = await payload.find({
    collection: "projects",
    user: agent,
    overrideAccess: false,
  });
  expect(readableProjects.docs.map((p) => p.slug)).toEqual(["jejak-puncak"]);

  // 4. Agent creates a draft post -> succeeds.
  const draftPost = await payload.create({
    collection: "posts",
    user: agent,
    overrideAccess: false,
    draft: true,
    data: {
      title: "Agent Draft Note",
      slug: "agent-draft-note",
      category: "ai-workflow",
      publishedAt: "2026-11-24T00:00:00.000Z",
      relatedProjects: [project.id],
      _status: "draft",
    },
  });
  expect(draftPost._status).toBe("draft");

  // 5. Agent updates a draft post with draft: true -> succeeds.
  const updatedDraft = await payload.update({
    collection: "posts",
    id: draftPost.id,
    user: agent,
    overrideAccess: false,
    draft: true,
    data: {
      title: "Agent Draft Note v2",
    },
  });
  expect(updatedDraft.title).toBe("Agent Draft Note v2");
  expect(updatedDraft._status).toBe("draft");

  // 6. Agent tries to create a published post (draft: false, _status: "published") -> 403 and no post created.
  await expectRejectedWithStatus(
    payload.create({
      collection: "posts",
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Unauthorized Publish",
        slug: "unauthorized-publish",
        category: "ai-workflow",
        publishedAt: "2026-11-24T00:00:00.000Z",
        _status: "published",
      },
    }),
    403,
  );
  const sneakyCreate = await payload.find({
    collection: "posts",
    overrideAccess: true,
    draft: true,
    where: { slug: { equals: "unauthorized-publish" } },
  });
  expect(sneakyCreate.docs).toHaveLength(0);

  // 6b. Agent tries to create a post without draft: true (and without _status) -> 403 and no post created.
  await expectRejectedWithStatus(
    payload.create({
      collection: "posts",
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Non-Draft Create",
        slug: "non-draft-create",
        category: "ai-workflow",
        publishedAt: "2026-11-24T00:00:00.000Z",
      },
    }),
    403,
  );
  const nonDraftCreate = await payload.find({
    collection: "posts",
    overrideAccess: true,
    draft: true,
    where: { slug: { equals: "non-draft-create" } },
  });
  expect(nonDraftCreate.docs).toHaveLength(0);

  // 7. Agent tries to publish its draft (draft: false, _status: "published") -> 403 and draft stays draft.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        _status: "published",
      },
    }),
    403,
  );
  const stillDraft = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: true,
  });
  expect(stillDraft._status).toBe("draft");

  // 7b. Agent tries to sneak _status: "published" with draft: true -> 403 and draft stays draft.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: true,
      data: {
        _status: "published",
      },
    }),
    403,
  );
  const stillDraftAfterSneak = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: true,
  });
  expect(stillDraftAfterSneak._status).toBe("draft");

  // 7c. Agent tries to update a draft without draft: true (and without _status) -> 403 and draft title unchanged.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Non-Draft Update Attempt",
      },
    }),
    403,
  );
  const draftAfterNonDraftUpdate = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: true,
  });
  expect(draftAfterNonDraftUpdate.title).toBe("Agent Draft Note v2");
  expect(draftAfterNonDraftUpdate._status).toBe("draft");

  // 8. Owner publishes the agent's draft -> succeeds.
  const publishedPost = await payload.update({
    collection: "posts",
    id: draftPost.id,
    user: owner,
    overrideAccess: false,
    draft: false,
    data: {
      _status: "published",
    },
  });
  expect(publishedPost._status).toBe("published");

  // 9. Agent tries to unpublish the published post -> 403 and published post stays published.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        _status: "draft",
      },
    }),
    403,
  );
  const stillPublishedAfterUnpublish = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: false,
  });
  expect(stillPublishedAfterUnpublish._status).toBe("published");

  // 10. Agent tries to live-edit a published post without draft: true -> 403 and live title unchanged.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Live Overwrite Attempt",
      },
    }),
    403,
  );
  const stillPublishedAfterLiveEdit = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: false,
  });
  expect(stillPublishedAfterLiveEdit.title).toBe("Agent Draft Note v2");
  expect(stillPublishedAfterLiveEdit._status).toBe("published");

  // 10b. Agent can save a draft revision over a published post with draft: true, leaving live post untouched.
  const draftRevision = await payload.update({
    collection: "posts",
    id: draftPost.id,
    user: agent,
    overrideAccess: false,
    draft: true,
    data: {
      title: "Agent Proposed Revision",
    },
  });
  expect(draftRevision.title).toBe("Agent Proposed Revision");
  expect(draftRevision._status).toBe("draft");
  const liveAfterDraftRevision = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: false,
  });
  expect(liveAfterDraftRevision.title).toBe("Agent Draft Note v2");
  expect(liveAfterDraftRevision._status).toBe("published");

  // 10b-followup. Two-step unpublish bypass: after saving a draft revision over a published post,
  // a follow-up non-draft update (with title only or with _status: "draft") must reject 403 and
  // keep the live published post intact and published.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Two-Step Unpublish Title Attempt",
      },
    }),
    403,
  );
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        _status: "draft",
      },
    }),
    403,
  );
  const liveAfterTwoStepAttempt = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: false,
  });
  expect(liveAfterTwoStepAttempt.title).toBe("Agent Draft Note v2");
  expect(liveAfterTwoStepAttempt._status).toBe("published");

  // 10b-bulk. Bulk update without draft: true must also reject with 403 and leave live post published.
  await expectRejectedWithStatus(
    payload.update({
      collection: "posts",
      where: { id: { equals: draftPost.id } },
      user: agent,
      overrideAccess: false,
      draft: false,
      data: {
        title: "Bulk Non-Draft Attempt",
      },
    }),
    403,
  );
  const liveAfterBulkAttempt = await payload.findByID({
    collection: "posts",
    id: draftPost.id,
    overrideAccess: true,
    draft: false,
  });
  expect(liveAfterBulkAttempt.title).toBe("Agent Draft Note v2");
  expect(liveAfterBulkAttempt._status).toBe("published");

  // 10c. Agent cannot restore a version directly to live (draft: false).
  const versions = await payload.findVersions({
    collection: "posts",
    overrideAccess: true,
    where: { parent: { equals: draftPost.id } },
    limit: 1,
  });
  expect(versions.docs.length).toBeGreaterThan(0);
  await expectRejectedWithStatus(
    payload.restoreVersion({
      collection: "posts",
      id: versions.docs[0].id,
      user: agent,
      overrideAccess: false,
      draft: false,
    }),
    403,
  );

  // 11. Agent tries to delete a post -> rejects (403).
  await expectRejectedWithStatus(
    payload.delete({
      collection: "posts",
      id: draftPost.id,
      user: agent,
      overrideAccess: false,
    }),
    403,
  );

  // 12. Agent tries to mutate projects, skills, faqs, site-settings, or users -> all reject (403).
  await expectRejectedWithStatus(
    payload.update({
      collection: "projects",
      id: project.id,
      user: agent,
      overrideAccess: false,
      data: { name: "Tampered" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.update({
      collection: "skills",
      id: skill.id,
      user: agent,
      overrideAccess: false,
      data: { name: "Tampered" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.update({
      collection: "faqs",
      id: faq.id,
      user: agent,
      overrideAccess: false,
      data: { question: "Tampered?" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.updateGlobal({
      slug: "site-settings",
      user: agent,
      overrideAccess: false,
      data: { name: "Tampered" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.update({
      collection: "users",
      id: owner.id,
      user: agent,
      overrideAccess: false,
      data: { email: "hacked@example.com" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.update({
      collection: "users",
      id: agent.id,
      user: agent,
      overrideAccess: false,
      data: { role: "owner" },
    }),
    403,
  );

  // Agent can read self, but cannot see owner in users.find.
  const visibleUsers = await payload.find({
    collection: "users",
    user: agent,
    overrideAccess: false,
  });
  expect(visibleUsers.docs.map((u) => u.id)).toEqual([agent.id]);

  // 13. Agent uploads media -> succeeds; agent updates or deletes media -> rejects (403).
  const uploaded = await payload.create({
    collection: "media",
    user: agent,
    overrideAccess: false,
    data: {
      alt: "Agent uploaded test image",
    },
    file: {
      data: TINY_PNG,
      mimetype: "image/png",
      name: `${TEST_UPLOAD_PREFIX}.png`,
      size: TINY_PNG.length,
    },
  });
  uploadedMediaIds.push(uploaded.id);
  expect(uploaded.alt).toBe("Agent uploaded test image");

  await expectRejectedWithStatus(
    payload.update({
      collection: "media",
      id: uploaded.id,
      user: agent,
      overrideAccess: false,
      data: { alt: "Tampered alt" },
    }),
    403,
  );

  await expectRejectedWithStatus(
    payload.delete({
      collection: "media",
      id: uploaded.id,
      user: agent,
      overrideAccess: false,
    }),
    403,
  );

  // Public media read still succeeds.
  const publicMedia = await payload.findByID({
    collection: "media",
    id: uploaded.id,
    overrideAccess: false,
  });
  expect(publicMedia.id).toBe(uploaded.id);
}, 60_000);
