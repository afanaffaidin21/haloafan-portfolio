import { expect, test } from "vitest";

import { countSeededMedia, mediaLocations, missingFiles, pendingMigrations, seedFiles, seedSourceMap } from "../../scripts/seed-media";

test("seed files skip dotfiles and come back sorted", () => {
  expect(seedFiles(["b.jpg", ".DS_Store", "a.jpg", ".gitkeep"])).toEqual(["a.jpg", "b.jpg"]);
});

test("the expected media count is the number of seed source files", () => {
  const count = countSeededMedia([{ filename: "a.jpg" }, { filename: "b.jpg" }], ["a.jpg", "b.jpg"]);
  expect(count).toEqual({ expected: 2, found: 2, missing: [] });
});

test("records the owner uploaded in the admin are not counted", () => {
  const docs = [{ filename: "a.jpg" }, { filename: "owner-upload.png" }, { filename: null }, {}];
  expect(countSeededMedia(docs, ["a.jpg"])).toEqual({ expected: 1, found: 1, missing: [] });
});

test("a seed file without a record is reported as missing", () => {
  expect(countSeededMedia([{ filename: "a.jpg" }], ["a.jpg", "cv.pdf"])).toEqual({
    expected: 2,
    found: 1,
    missing: ["cv.pdf"],
  });
});

test("seed sources from every directory map by filename", () => {
  const map = seedSourceMap([
    { dir: "public/img", names: ["a.jpg", ".DS_Store"] },
    { dir: "public/files", names: ["cv.pdf"] },
  ]);
  expect([...map.entries()]).toEqual([
    ["a.jpg", "public/img/a.jpg"],
    ["cv.pdf", "public/files/cv.pdf"],
  ]);
});

test("the same filename in two seed directories is rejected", () => {
  expect(() =>
    seedSourceMap([
      { dir: "public/img", names: ["cv.pdf"] },
      { dir: "public/files", names: ["cv.pdf"] },
    ]),
  ).toThrow(/more than one seed directory/);
});

const doc = {
  filename: "a.jpg",
  url: "https://media.example.com/a.jpg",
  sizes: {
    card: { filename: "a-400x300.jpg", url: "https://media.example.com/a-400x300.jpg" },
    wide: { filename: null, url: null },
  },
};

test("media locations cover the original and every generated size, locally or on R2", () => {
  expect(mediaLocations(doc, { local: "media" })).toEqual(["media/a.jpg", "media/a-400x300.jpg"]);
  expect(mediaLocations(doc, { remote: true })).toEqual(["https://media.example.com/a.jpg", "https://media.example.com/a-400x300.jpg"]);
});

test("missing files are the locations the checker cannot find", async () => {
  const onR2 = new Set(["https://media.example.com/a.jpg"]);
  expect(await missingFiles(doc, { remote: true }, async (u) => onR2.has(u))).toEqual(["https://media.example.com/a-400x300.jpg"]);
  expect(await missingFiles(doc, { remote: true }, async () => true)).toEqual([]);
  expect(await missingFiles({ filename: null }, { local: "media" }, async () => true)).toEqual(["(no file recorded)"]);
});

test("pending migrations are the repo's migrations the database has not run", () => {
  expect(pendingMigrations(["a"], ["a", "b"])).toEqual(["b"]);
  expect(pendingMigrations(["a", "b"], ["a", "b"])).toEqual([]);
  expect(pendingMigrations([], ["a"])).toEqual(["a"]);
});
