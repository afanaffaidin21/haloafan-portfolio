import os from "node:os";
import path from "node:path";
import type { CollectionConfig } from "payload";

import { revalidateSite } from "../lib/revalidate";
import { storageEnabled } from "../lib/storage";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Payload's default read access requires an authenticated user, which would
    // make every image on the public site return 403. Writes keep the default.
    read: () => true,
  },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  upload: {
    // With R2 nothing is written locally, but Payload still checks staticDir
    // for name clashes; pointing it at ./media (local copies) would rename
    // every upload to "<name>-1". An empty directory keeps the names.
    staticDir: storageEnabled() ? path.join(os.tmpdir(), "payload-media-r2") : "media",
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      { name: "card", width: 400 },
      { name: "hero", width: 1200 },
      // Project card thumbnails (~490px wide) and full-width tiles (1080px), at ~2x.
      { name: "thumb", width: 1000 },
      { name: "wide", width: 2200 },
    ],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
  ],
};
