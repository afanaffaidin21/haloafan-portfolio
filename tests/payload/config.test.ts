import { expect, test } from "vitest";

import { Users } from "../../src/collections/Users";

test("users collection is registered under the admin slug", () => {
  expect(Users.slug).toBe("users");
  expect(Users.auth).toBeTruthy();
});

test("Postgres runs on migrations, never schema push; SQLite keeps pushing locally", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync("src/payload.config.ts", "utf8");
  const pg = src.slice(src.indexOf("postgresAdapter({"), src.indexOf("sqliteAdapter("));
  expect(pg).toContain("push: false");
  expect(pg).toContain("prodMigrations: migrations");
  expect(pg).toContain('migrationDir: path.resolve(dirname, "migrations")');
  expect(src).toContain("sqliteAdapter({ client: { url: uri } })");
  const { migrations } = await import("../../src/migrations");
  expect(migrations.map((m) => m.name)).toEqual([expect.stringMatching(/_initial$/)]);
});
