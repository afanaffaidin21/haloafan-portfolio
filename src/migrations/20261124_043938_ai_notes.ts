import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_discussion_platform" AS ENUM('x', 'github', 'linkedin', 'instagram', 'threads', 'dribbble', 'behance', 'tiktok', 'youtube');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ai-workflow', 'ai-in-products', 'experiments', 'wordpress');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_discussion_platform" AS ENUM('x', 'github', 'linkedin', 'instagram', 'threads', 'dribbble', 'behance', 'tiktok', 'youtube');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ai-workflow', 'ai-in-products', 'experiments', 'wordpress');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'agent');
  ALTER TYPE "public"."enum_site_settings_socials_platform" ADD VALUE 'tiktok';
  ALTER TYPE "public"."enum_site_settings_socials_platform" ADD VALUE 'youtube';
  CREATE TABLE "posts_discussion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_posts_discussion_platform",
  	"url" varchar
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_posts_v_version_discussion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__posts_v_version_discussion_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  ALTER TABLE "posts" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_title" DROP NOT NULL;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_slug" DROP NOT NULL;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";
  ALTER TABLE "posts" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "ai_assisted" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "_status" "enum_posts_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_ai_assisted" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version__status" "enum__posts_v_version_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN "latest" boolean;
  ALTER TABLE "users" ADD COLUMN "role" "public"."enum_users_role";
  UPDATE "users" SET "role" = 'owner' WHERE "role" IS NULL;
  ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_preview_bar" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_preview_exit" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_tools_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_related_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_ai_disclosure" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_blog_discussed_on" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "copy_project_related_notes_heading" varchar;
  ALTER TABLE "posts_discussion" ADD CONSTRAINT "posts_discussion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_discussion" ADD CONSTRAINT "_posts_v_version_discussion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_discussion_order_idx" ON "posts_discussion" USING btree ("_order");
  CREATE INDEX "posts_discussion_parent_id_idx" ON "posts_discussion" USING btree ("_parent_id");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_projects_id_idx" ON "posts_rels" USING btree ("projects_id");
  CREATE INDEX "_posts_v_version_discussion_order_idx" ON "_posts_v_version_discussion" USING btree ("_order");
  CREATE INDEX "_posts_v_version_discussion_parent_id_idx" ON "_posts_v_version_discussion" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_projects_id_idx" ON "_posts_v_rels" USING btree ("projects_id");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  ALTER TABLE "posts" DROP COLUMN "date";
  ALTER TABLE "_posts_v" DROP COLUMN "version_date";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_discussion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_discussion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_discussion" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_discussion" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  ALTER TABLE "site_settings_socials" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_site_settings_socials_platform";
  CREATE TYPE "public"."enum_site_settings_socials_platform" AS ENUM('x', 'github', 'linkedin', 'instagram', 'threads', 'dribbble', 'behance');
  ALTER TABLE "site_settings_socials" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_site_settings_socials_platform" USING "platform"::"public"."enum_site_settings_socials_platform";
  DROP INDEX "posts__status_idx";
  DROP INDEX "_posts_v_version_version__status_idx";
  DROP INDEX "_posts_v_latest_idx";
  ALTER TABLE "posts" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE varchar;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_title" SET NOT NULL;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_slug" SET NOT NULL;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE varchar;
  ALTER TABLE "posts" ADD COLUMN "date" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_date" varchar;
  ALTER TABLE "posts" DROP COLUMN "published_at";
  ALTER TABLE "posts" DROP COLUMN "ai_assisted";
  ALTER TABLE "posts" DROP COLUMN "_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_ai_assisted";
  ALTER TABLE "_posts_v" DROP COLUMN "version__status";
  ALTER TABLE "_posts_v" DROP COLUMN "latest";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_preview_bar";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_preview_exit";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_tools_label";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_related_label";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_ai_disclosure";
  ALTER TABLE "site_settings" DROP COLUMN "copy_blog_discussed_on";
  ALTER TABLE "site_settings" DROP COLUMN "copy_project_related_notes_heading";
  DROP TYPE "public"."enum_posts_discussion_platform";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_discussion_platform";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_users_role";`)
}
