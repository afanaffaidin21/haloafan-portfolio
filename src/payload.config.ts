import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import type { CollectionConfig, GlobalConfig, Plugin } from "payload";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { migrations } from "./migrations";
import { Users } from "./collections/Users";
import { Projects } from "./collections/Projects";
import { Skills } from "./collections/Skills";
import { Posts } from "./collections/Posts";
import { FAQs } from "./collections/FAQs";
import { Media } from "./collections/Media";
import { SiteSettings } from "./globals/SiteSettings";
import { payloadSecret } from "./lib/secret";
import { r2FileUrl, storageEnabled } from "./lib/storage";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const uri = process.env.DATABASE_URI ?? "file:./payload.db";

export const Collections: CollectionConfig[] = [Projects, Skills, Posts, FAQs, Media, Users];
export const Globals: GlobalConfig[] = [SiteSettings];

// Always registered so the schema (the Media `prefix` field) is the same
// with and without R2; only `enabled` decides where uploads go.
const plugins: Plugin[] = [
  s3Storage({
    enabled: storageEnabled(),
    alwaysInsertFields: true,
    bucket: process.env.R2_BUCKET ?? "",
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
    },
    collections: {
      media: {
        // Files are served from the bucket's public custom domain, not
        // proxied through /api/media/file (a serverless function per image).
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix }) => r2FileUrl(process.env.R2_PUBLIC_URL ?? "", filename, prefix),
      },
    },
  }),
];

export default buildConfig({
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve(dirname, "app/(payload)") },
    meta: {
      titleSuffix: "",
      icons: [{ rel: "icon", type: "image/svg+xml", url: "/admin-icon.svg" }],
    },
    components: {
      beforeDashboard: ["/components/DashboardHeader#DashboardHeader"],
      graphics: {
        Logo: "/components/AdminLogo#AdminLogo",
        Icon: "/components/AdminLogo#AdminIcon",
      },
    },
  },
  editor: lexicalEditor(),
  secret: payloadSecret(),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: uri.startsWith("postgres")
    ? postgresAdapter({
        pool: { connectionString: uri },
        // Postgres (production) never pushes its schema: changes ship as
        // migrations in src/migrations (`npx payload migrate:create`).
        push: false,
        migrationDir: path.resolve(dirname, "migrations"),
        // Under NODE_ENV=production the adapter applies pending migrations on connect.
        prodMigrations: migrations,
      })
    : sqliteAdapter({ client: { url: uri } }),
  collections: Collections,
  globals: Globals,
  plugins,
});
