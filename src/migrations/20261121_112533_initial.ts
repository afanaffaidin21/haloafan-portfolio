import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_disciplines" AS ENUM('design', 'build', 'ai-automation', 'generative-ai');
  CREATE TYPE "public"."enum_projects_blocks_tiles_kind" AS ENUM('image', 'video');
  CREATE TYPE "public"."enum_projects_blocks_layout" AS ENUM('full', 'two', 'three');
  CREATE TYPE "public"."enum_projects_kind" AS ENUM('client', 'experiment');
  CREATE TYPE "public"."enum__projects_v_version_disciplines" AS ENUM('design', 'build', 'ai-automation', 'generative-ai');
  CREATE TYPE "public"."enum__projects_v_version_blocks_tiles_kind" AS ENUM('image', 'video');
  CREATE TYPE "public"."enum__projects_v_version_blocks_layout" AS ENUM('full', 'two', 'three');
  CREATE TYPE "public"."enum__projects_v_version_kind" AS ENUM('client', 'experiment');
  CREATE TYPE "public"."enum_skills_group" AS ENUM('design', 'build', 'ai-automation', 'generative-ai');
  CREATE TYPE "public"."enum_skills_variant" AS ENUM('row', 'tile');
  CREATE TYPE "public"."enum_skills_icon" AS ENUM('wordpress', 'webapp', 'ai', 'ux', 'support', 'performance');
  CREATE TYPE "public"."enum_skills_tool" AS ENUM('WordPress', 'Elementor', 'WooCommerce', 'PHP', 'Next.js', 'React', 'TypeScript', 'Supabase', 'Figma', 'Gemini', 'ChatGPT', 'Claude');
  CREATE TYPE "public"."enum_skills_strength" AS ENUM('working', 'strong', 'expert');
  CREATE TYPE "public"."enum__skills_v_version_group" AS ENUM('design', 'build', 'ai-automation', 'generative-ai');
  CREATE TYPE "public"."enum__skills_v_version_variant" AS ENUM('row', 'tile');
  CREATE TYPE "public"."enum__skills_v_version_icon" AS ENUM('wordpress', 'webapp', 'ai', 'ux', 'support', 'performance');
  CREATE TYPE "public"."enum__skills_v_version_tool" AS ENUM('WordPress', 'Elementor', 'WooCommerce', 'PHP', 'Next.js', 'React', 'TypeScript', 'Supabase', 'Figma', 'Gemini', 'ChatGPT', 'Claude');
  CREATE TYPE "public"."enum__skills_v_version_strength" AS ENUM('working', 'strong', 'expert');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('availability', 'role', 'process', 'general');
  CREATE TYPE "public"."enum__faqs_v_version_category" AS ENUM('availability', 'role', 'process', 'general');
  CREATE TYPE "public"."enum_site_settings_socials_platform" AS ENUM('x', 'github', 'linkedin', 'instagram', 'threads', 'dribbble', 'behance');
  CREATE TYPE "public"."enum_site_settings_availability_status" AS ENUM('open', 'selective', 'closed');
  CREATE TABLE "projects_disciplines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_disciplines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_projects_blocks_tiles_kind" DEFAULT 'image' NOT NULL,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"src" varchar,
  	"poster_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "projects_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_projects_blocks_layout" DEFAULT 'full' NOT NULL,
  	"description_heading" varchar,
  	"description_bold" varchar,
  	"description_text" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "enum_projects_kind" DEFAULT 'client' NOT NULL,
  	"type" varchar,
  	"heading" varchar,
  	"year" varchar,
  	"client" varchar,
  	"description" varchar,
  	"live_url" varchar,
  	"repo_url" varchar,
  	"thumbnail_id" integer,
  	"quote_text" varchar,
  	"quote_bold" varchar,
  	"quote_tail" varchar,
  	"quote_name" varchar,
  	"quote_role" varchar,
  	"quote_avatar" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_projects_v_version_disciplines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_version_disciplines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_blocks_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__projects_v_version_blocks_tiles_kind" DEFAULT 'image' NOT NULL,
  	"image_id" integer,
  	"mobile_image_id" integer,
  	"src" varchar,
  	"poster_id" integer,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__projects_v_version_blocks_layout" DEFAULT 'full' NOT NULL,
  	"description_heading" varchar,
  	"description_bold" varchar,
  	"description_text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_kind" "enum__projects_v_version_kind" DEFAULT 'client' NOT NULL,
  	"version_type" varchar,
  	"version_heading" varchar,
  	"version_year" varchar,
  	"version_client" varchar,
  	"version_description" varchar,
  	"version_live_url" varchar,
  	"version_repo_url" varchar,
  	"version_thumbnail_id" integer,
  	"version_quote_text" varchar,
  	"version_quote_bold" varchar,
  	"version_quote_tail" varchar,
  	"version_quote_name" varchar,
  	"version_quote_role" varchar,
  	"version_quote_avatar" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_projects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"group" "enum_skills_group" NOT NULL,
  	"variant" "enum_skills_variant" DEFAULT 'row' NOT NULL,
  	"icon" "enum_skills_icon",
  	"tool" "enum_skills_tool",
  	"strength" "enum_skills_strength",
  	"note" varchar,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_skills_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_group" "enum__skills_v_version_group" NOT NULL,
  	"version_variant" "enum__skills_v_version_variant" DEFAULT 'row' NOT NULL,
  	"version_icon" "enum__skills_v_version_icon",
  	"version_tool" "enum__skills_v_version_tool",
  	"version_strength" "enum__skills_v_version_strength",
  	"version_note" varchar,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"category" varchar,
  	"date" varchar,
  	"image_id" integer,
  	"body" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_description" varchar,
  	"version_category" varchar,
  	"version_date" varchar,
  	"version_image_id" integer,
  	"version_body" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar,
  	"category" "enum_faqs_category",
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_faqs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_question" varchar NOT NULL,
  	"version_answer" varchar,
  	"version_category" "enum__faqs_v_version_category",
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"skills_id" integer,
  	"posts_id" integer,
  	"faqs_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_work_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"company" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"dates" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_about_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "site_settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_socials_platform",
  	"label" varchar,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"avatar_id" integer,
  	"resume_id" integer,
  	"tagline" varchar,
  	"availability_status" "enum_site_settings_availability_status" DEFAULT 'open' NOT NULL,
  	"availability_note" varchar,
  	"about_signature_id" integer,
  	"big_quote_text" varchar,
  	"big_quote_bold" varchar,
  	"big_quote_tail" varchar,
  	"big_quote_name" varchar,
  	"big_quote_role" varchar,
  	"big_quote_avatar_id" integer,
  	"copy_hero_subcopy_lead" varchar,
  	"copy_hero_subcopy_body" varchar,
  	"copy_home_latest_projects_heading" varchar,
  	"copy_skills_heading_line1" varchar,
  	"copy_skills_heading_line2" varchar,
  	"copy_skills_tech_stack_label" varchar,
  	"copy_about_heading_line1" varchar,
  	"copy_about_heading_line2" varchar,
  	"copy_faq_heading_line1" varchar,
  	"copy_faq_heading_line2" varchar,
  	"copy_faq_card_heading_line1" varchar,
  	"copy_faq_card_heading_line2" varchar,
  	"copy_faq_card_body" varchar,
  	"copy_articles_heading_line1" varchar,
  	"copy_articles_heading_line2" varchar,
  	"copy_blog_title" varchar,
  	"copy_blog_intro" varchar,
  	"copy_blog_empty" varchar,
  	"copy_blog_follow_title" varchar,
  	"copy_blog_follow_body" varchar,
  	"copy_blog_more_heading" varchar,
  	"copy_projects_title_line1" varchar,
  	"copy_projects_title_line2" varchar,
  	"copy_projects_subtitle" varchar,
  	"copy_project_more_heading" varchar,
  	"copy_project_placeholder_card" varchar,
  	"copy_contact_cta_line1" varchar,
  	"copy_contact_cta_line2" varchar,
  	"copy_footer_lead" varchar,
  	"copy_footer_line2" varchar,
  	"follower_count" varchar,
  	"footer_wordmark" varchar,
  	"copyright" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "projects_disciplines" ADD CONSTRAINT "projects_disciplines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_tiles" ADD CONSTRAINT "projects_blocks_tiles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_tiles" ADD CONSTRAINT "projects_blocks_tiles_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_tiles" ADD CONSTRAINT "projects_blocks_tiles_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_tiles" ADD CONSTRAINT "projects_blocks_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks" ADD CONSTRAINT "projects_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_disciplines" ADD CONSTRAINT "_projects_v_version_disciplines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_blocks_tiles" ADD CONSTRAINT "_projects_v_version_blocks_tiles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_blocks_tiles" ADD CONSTRAINT "_projects_v_version_blocks_tiles_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_blocks_tiles" ADD CONSTRAINT "_projects_v_version_blocks_tiles_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_blocks_tiles" ADD CONSTRAINT "_projects_v_version_blocks_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_blocks" ADD CONSTRAINT "_projects_v_version_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_texts" ADD CONSTRAINT "_projects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_skills_v" ADD CONSTRAINT "_skills_v_parent_id_skills_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_parent_id_faqs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_work_history" ADD CONSTRAINT "site_settings_work_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_about_paragraphs" ADD CONSTRAINT "site_settings_copy_about_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_socials" ADD CONSTRAINT "site_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_resume_id_media_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_about_signature_id_media_id_fk" FOREIGN KEY ("about_signature_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_big_quote_avatar_id_media_id_fk" FOREIGN KEY ("big_quote_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_texts" ADD CONSTRAINT "site_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_disciplines_order_idx" ON "projects_disciplines" USING btree ("order");
  CREATE INDEX "projects_disciplines_parent_idx" ON "projects_disciplines" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_tiles_order_idx" ON "projects_blocks_tiles" USING btree ("_order");
  CREATE INDEX "projects_blocks_tiles_parent_id_idx" ON "projects_blocks_tiles" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_tiles_image_idx" ON "projects_blocks_tiles" USING btree ("image_id");
  CREATE INDEX "projects_blocks_tiles_mobile_image_idx" ON "projects_blocks_tiles" USING btree ("mobile_image_id");
  CREATE INDEX "projects_blocks_tiles_poster_idx" ON "projects_blocks_tiles" USING btree ("poster_id");
  CREATE INDEX "projects_blocks_order_idx" ON "projects_blocks" USING btree ("_order");
  CREATE INDEX "projects_blocks_parent_id_idx" ON "projects_blocks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_thumbnail_idx" ON "projects" USING btree ("thumbnail_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "_projects_v_version_disciplines_order_idx" ON "_projects_v_version_disciplines" USING btree ("order");
  CREATE INDEX "_projects_v_version_disciplines_parent_idx" ON "_projects_v_version_disciplines" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_blocks_tiles_order_idx" ON "_projects_v_version_blocks_tiles" USING btree ("_order");
  CREATE INDEX "_projects_v_version_blocks_tiles_parent_id_idx" ON "_projects_v_version_blocks_tiles" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_blocks_tiles_image_idx" ON "_projects_v_version_blocks_tiles" USING btree ("image_id");
  CREATE INDEX "_projects_v_version_blocks_tiles_mobile_image_idx" ON "_projects_v_version_blocks_tiles" USING btree ("mobile_image_id");
  CREATE INDEX "_projects_v_version_blocks_tiles_poster_idx" ON "_projects_v_version_blocks_tiles" USING btree ("poster_id");
  CREATE INDEX "_projects_v_version_blocks_order_idx" ON "_projects_v_version_blocks" USING btree ("_order");
  CREATE INDEX "_projects_v_version_blocks_parent_id_idx" ON "_projects_v_version_blocks" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_thumbnail_idx" ON "_projects_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_texts_order_parent" ON "_projects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "_skills_v_parent_idx" ON "_skills_v" USING btree ("parent_id");
  CREATE INDEX "_skills_v_version_version_updated_at_idx" ON "_skills_v" USING btree ("version_updated_at");
  CREATE INDEX "_skills_v_version_version_created_at_idx" ON "_skills_v" USING btree ("version_created_at");
  CREATE INDEX "_skills_v_created_at_idx" ON "_skills_v" USING btree ("created_at");
  CREATE INDEX "_skills_v_updated_at_idx" ON "_skills_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_image_idx" ON "_posts_v" USING btree ("version_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "_faqs_v_parent_idx" ON "_faqs_v" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_version_updated_at_idx" ON "_faqs_v" USING btree ("version_updated_at");
  CREATE INDEX "_faqs_v_version_version_created_at_idx" ON "_faqs_v" USING btree ("version_created_at");
  CREATE INDEX "_faqs_v_created_at_idx" ON "_faqs_v" USING btree ("created_at");
  CREATE INDEX "_faqs_v_updated_at_idx" ON "_faqs_v" USING btree ("updated_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_work_history_order_idx" ON "site_settings_work_history" USING btree ("_order");
  CREATE INDEX "site_settings_work_history_parent_id_idx" ON "site_settings_work_history" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_about_paragraphs_order_idx" ON "site_settings_copy_about_paragraphs" USING btree ("_order");
  CREATE INDEX "site_settings_copy_about_paragraphs_parent_id_idx" ON "site_settings_copy_about_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "site_settings_socials_order_idx" ON "site_settings_socials" USING btree ("_order");
  CREATE INDEX "site_settings_socials_parent_id_idx" ON "site_settings_socials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_avatar_idx" ON "site_settings" USING btree ("avatar_id");
  CREATE INDEX "site_settings_resume_idx" ON "site_settings" USING btree ("resume_id");
  CREATE INDEX "site_settings_about_about_signature_idx" ON "site_settings" USING btree ("about_signature_id");
  CREATE INDEX "site_settings_big_quote_big_quote_avatar_idx" ON "site_settings" USING btree ("big_quote_avatar_id");
  CREATE INDEX "site_settings_seo_seo_og_image_idx" ON "site_settings" USING btree ("seo_og_image_id");
  CREATE INDEX "site_settings_texts_order_parent" ON "site_settings_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_disciplines" CASCADE;
  DROP TABLE "projects_blocks_tiles" CASCADE;
  DROP TABLE "projects_blocks" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "_projects_v_version_disciplines" CASCADE;
  DROP TABLE "_projects_v_version_blocks_tiles" CASCADE;
  DROP TABLE "_projects_v_version_blocks" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_texts" CASCADE;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "_skills_v" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "_faqs_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_work_history" CASCADE;
  DROP TABLE "site_settings_copy_about_paragraphs" CASCADE;
  DROP TABLE "site_settings_socials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_texts" CASCADE;
  DROP TYPE "public"."enum_projects_disciplines";
  DROP TYPE "public"."enum_projects_blocks_tiles_kind";
  DROP TYPE "public"."enum_projects_blocks_layout";
  DROP TYPE "public"."enum_projects_kind";
  DROP TYPE "public"."enum__projects_v_version_disciplines";
  DROP TYPE "public"."enum__projects_v_version_blocks_tiles_kind";
  DROP TYPE "public"."enum__projects_v_version_blocks_layout";
  DROP TYPE "public"."enum__projects_v_version_kind";
  DROP TYPE "public"."enum_skills_group";
  DROP TYPE "public"."enum_skills_variant";
  DROP TYPE "public"."enum_skills_icon";
  DROP TYPE "public"."enum_skills_tool";
  DROP TYPE "public"."enum_skills_strength";
  DROP TYPE "public"."enum__skills_v_version_group";
  DROP TYPE "public"."enum__skills_v_version_variant";
  DROP TYPE "public"."enum__skills_v_version_icon";
  DROP TYPE "public"."enum__skills_v_version_tool";
  DROP TYPE "public"."enum__skills_v_version_strength";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum__faqs_v_version_category";
  DROP TYPE "public"."enum_site_settings_socials_platform";
  DROP TYPE "public"."enum_site_settings_availability_status";`)
}
