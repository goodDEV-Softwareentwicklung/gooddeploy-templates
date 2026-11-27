import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_text_width" AS ENUM('prose', 'full');
  CREATE TYPE "public"."enum_pages_blocks_media_text_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_media_text_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_media_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_icon" AS ENUM('briefcase', 'users', 'handshake', 'lightbulb', 'rocket', 'target', 'chart', 'shield', 'award', 'star', 'sparkles', 'heart', 'leaf', 'globe', 'clock', 'calendar', 'wrench', 'settings', 'code', 'cloud', 'truck', 'building', 'home', 'message', 'check');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cards_style" AS ENUM('image', 'icon', 'logo');
  CREATE TYPE "public"."enum_pages_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_cards_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_stats_variant" AS ENUM('band', 'tiles', 'timeline', 'table');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_tone" AS ENUM('primary', 'dark', 'surface');
  CREATE TYPE "public"."enum_pages_blocks_section_layout" AS ENUM('oneColumn', 'halfHalf', 'twoThirdsOneThird', 'oneThirdTwoThirds', 'thirds', 'quarters');
  CREATE TYPE "public"."enum_pages_blocks_section_background" AS ENUM('none', 'surface', 'primary', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_section_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum_pages_blocks_section_spacing" AS ENUM('none', 'small', 'normal', 'large');
  CREATE TYPE "public"."enum_pages_blocks_section_vertical_align" AS ENUM('top', 'center');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_hero_variant" AS ENUM('full', 'split', 'centered', 'page');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_text_width" AS ENUM('prose', 'full');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_media_text_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_media_text_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_media_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cards_items_icon" AS ENUM('briefcase', 'users', 'handshake', 'lightbulb', 'rocket', 'target', 'chart', 'shield', 'award', 'star', 'sparkles', 'heart', 'leaf', 'globe', 'clock', 'calendar', 'wrench', 'settings', 'code', 'cloud', 'truck', 'building', 'home', 'message', 'check');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cards_style" AS ENUM('image', 'icon', 'logo');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cards_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_stats_variant" AS ENUM('band', 'tiles', 'timeline', 'table');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cta_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_cta_tone" AS ENUM('primary', 'dark', 'surface');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_section_layout" AS ENUM('oneColumn', 'halfHalf', 'twoThirdsOneThird', 'oneThirdTwoThirds', 'thirds', 'quarters');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_section_background" AS ENUM('none', 'surface', 'primary', 'dark');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_section_width" AS ENUM('narrow', 'normal', 'wide');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_section_spacing" AS ENUM('none', 'small', 'normal', 'large');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_section_vertical_align" AS ENUM('top', 'center');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_hero_links_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_reusable_blocks_blocks_hero_variant" AS ENUM('full', 'split', 'centered', 'page');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_site_settings_navigation_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_navigation_link_type" AS ENUM('reference', 'custom', 'none');
  CREATE TYPE "public"."enum_site_settings_header_actions_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_header_actions_link_appearance" AS ENUM('accent', 'primary', 'outline');
  CREATE TYPE "public"."enum_site_settings_footer_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_logo_icon" AS ENUM('briefcase', 'users', 'handshake', 'lightbulb', 'rocket', 'target', 'chart', 'shield', 'award', 'star', 'sparkles', 'heart', 'leaf', 'globe', 'clock', 'calendar', 'wrench', 'settings', 'code', 'cloud', 'truck', 'building', 'home', 'message', 'check');
  CREATE TYPE "public"."enum_site_settings_imprint_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_privacy_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_theme" AS ENUM('whitelabel', 'classic', 'bold');
  CREATE TYPE "public"."enum_site_settings_palette" AS ENUM('sun', 'plum', 'navy', 'moss', 'bordeaux', 'green', 'forest', 'blue');
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb NOT NULL,
  	"width" "enum_pages_blocks_text_width" DEFAULT 'prose',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_text_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_media_text_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_pages_blocks_media_text_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "pages_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"image_position" "enum_pages_blocks_media_text_image_position" DEFAULT 'left',
  	"eyebrow" varchar,
  	"title" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_items_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"icon" "enum_pages_blocks_cards_items_icon",
  	"tag" varchar,
  	"link_type" "enum_pages_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"style" "enum_pages_blocks_cards_style" DEFAULT 'image',
  	"columns" "enum_pages_blocks_cards_columns" DEFAULT '3',
  	"more_link_type" "enum_pages_blocks_cards_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_label" varchar,
  	"more_link_reference_id" integer,
  	"more_link_url" varchar,
  	"more_link_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"open" boolean
  );
  
  CREATE TABLE "pages_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"variant" "enum_pages_blocks_stats_variant" DEFAULT 'band' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"person" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"tone" "enum_pages_blocks_cta_tone" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"show_contact" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"contact_person_id" integer,
  	"address" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"hours_title" varchar DEFAULT 'Öffnungszeiten',
  	"hours" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_section_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_section_layout" DEFAULT 'oneColumn' NOT NULL,
  	"background" "enum_pages_blocks_section_background" DEFAULT 'none',
  	"width" "enum_pages_blocks_section_width" DEFAULT 'normal',
  	"spacing" "enum_pages_blocks_section_spacing" DEFAULT 'normal',
  	"vertical_align" "enum_pages_blocks_section_vertical_align" DEFAULT 'top',
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_pages_blocks_hero_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_hero_variant" DEFAULT 'full' NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_reusable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reference_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"people_id" integer
  );
  
  CREATE TABLE "reusable_blocks_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb NOT NULL,
  	"width" "enum_reusable_blocks_blocks_text_width" DEFAULT 'prose',
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_media_text_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_reusable_blocks_blocks_media_text_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_reusable_blocks_blocks_media_text_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "reusable_blocks_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"image_position" "enum_reusable_blocks_blocks_media_text_image_position" DEFAULT 'left',
  	"eyebrow" varchar,
  	"title" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_cards_items_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"icon" "enum_reusable_blocks_blocks_cards_items_icon",
  	"tag" varchar,
  	"link_type" "enum_reusable_blocks_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"style" "enum_reusable_blocks_blocks_cards_style" DEFAULT 'image',
  	"columns" "enum_reusable_blocks_blocks_cards_columns" DEFAULT '3',
  	"more_link_type" "enum_reusable_blocks_blocks_cards_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_label" varchar,
  	"more_link_reference_id" integer,
  	"more_link_url" varchar,
  	"more_link_anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"open" boolean
  );
  
  CREATE TABLE "reusable_blocks_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"variant" "enum_reusable_blocks_blocks_stats_variant" DEFAULT 'band' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"person" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_reusable_blocks_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_reusable_blocks_blocks_cta_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "reusable_blocks_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"tone" "enum_reusable_blocks_blocks_cta_tone" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"show_contact" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"contact_person_id" integer,
  	"address" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"hours_title" varchar DEFAULT 'Öffnungszeiten',
  	"hours" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_section_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_reusable_blocks_blocks_section_layout" DEFAULT 'oneColumn' NOT NULL,
  	"background" "enum_reusable_blocks_blocks_section_background" DEFAULT 'none',
  	"width" "enum_reusable_blocks_blocks_section_width" DEFAULT 'normal',
  	"spacing" "enum_reusable_blocks_blocks_section_spacing" DEFAULT 'normal',
  	"vertical_align" "enum_reusable_blocks_blocks_section_vertical_align" DEFAULT 'top',
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_reusable_blocks_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_reusable_blocks_blocks_hero_links_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "reusable_blocks_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_reusable_blocks_blocks_hero_variant" DEFAULT 'full' NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "reusable_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reusable_blocks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"people_id" integer
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"image_id" integer,
  	"email" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
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
  	"focal_y" numeric
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
  	"name" varchar,
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
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" DEFAULT '301' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
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
  	"pages_id" integer,
  	"reusable_blocks_id" integer,
  	"people_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"redirects_id" integer
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
  
  CREATE TABLE "site_settings_navigation_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_navigation_children_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar
  );
  
  CREATE TABLE "site_settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_navigation_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar
  );
  
  CREATE TABLE "site_settings_header_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_header_actions_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar,
  	"link_appearance" "enum_site_settings_header_actions_link_appearance" DEFAULT 'accent'
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_settings_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_label" varchar NOT NULL,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_anchor" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar NOT NULL,
  	"short_name" varchar,
  	"tagline" varchar,
  	"logo_id" integer,
  	"logo_icon" "enum_site_settings_logo_icon" DEFAULT 'briefcase',
  	"logo_dark_id" integer,
  	"description" varchar,
  	"contact_address" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"imprint_type" "enum_site_settings_imprint_type" DEFAULT 'reference',
  	"imprint_new_tab" boolean,
  	"imprint_label" varchar,
  	"imprint_reference_id" integer,
  	"imprint_url" varchar,
  	"imprint_anchor" varchar,
  	"privacy_type" "enum_site_settings_privacy_type" DEFAULT 'reference',
  	"privacy_new_tab" boolean,
  	"privacy_label" varchar,
  	"privacy_reference_id" integer,
  	"privacy_url" varchar,
  	"privacy_anchor" varchar,
  	"theme" "enum_site_settings_theme" DEFAULT 'whitelabel' NOT NULL,
  	"palette" "enum_site_settings_palette",
  	"colors_primary" varchar,
  	"colors_primary_ink" varchar,
  	"colors_accent" varchar,
  	"colors_accent_ink" varchar,
  	"colors_dark" varchar,
  	"colors_dark_ink" varchar,
  	"colors_bg" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text_links" ADD CONSTRAINT "pages_blocks_media_text_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text_links" ADD CONSTRAINT "pages_blocks_media_text_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_media_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items_details" ADD CONSTRAINT "pages_blocks_cards_items_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_more_link_reference_id_pages_id_fk" FOREIGN KEY ("more_link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_accordion_items" ADD CONSTRAINT "pages_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_accordion" ADD CONSTRAINT "pages_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team" ADD CONSTRAINT "pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_contact_person_id_people_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_columns" ADD CONSTRAINT "pages_blocks_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links" ADD CONSTRAINT "pages_blocks_hero_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links" ADD CONSTRAINT "pages_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_reusable" ADD CONSTRAINT "pages_blocks_reusable_reference_id_reusable_blocks_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_reusable" ADD CONSTRAINT "pages_blocks_reusable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_text" ADD CONSTRAINT "reusable_blocks_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_media_text_links" ADD CONSTRAINT "reusable_blocks_blocks_media_text_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_media_text_links" ADD CONSTRAINT "reusable_blocks_blocks_media_text_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_media_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_media_text" ADD CONSTRAINT "reusable_blocks_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_media_text" ADD CONSTRAINT "reusable_blocks_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards_items_details" ADD CONSTRAINT "reusable_blocks_blocks_cards_items_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_cards_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards_items" ADD CONSTRAINT "reusable_blocks_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards_items" ADD CONSTRAINT "reusable_blocks_blocks_cards_items_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards_items" ADD CONSTRAINT "reusable_blocks_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards" ADD CONSTRAINT "reusable_blocks_blocks_cards_more_link_reference_id_pages_id_fk" FOREIGN KEY ("more_link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cards" ADD CONSTRAINT "reusable_blocks_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_accordion_items" ADD CONSTRAINT "reusable_blocks_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_accordion" ADD CONSTRAINT "reusable_blocks_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_stats_items" ADD CONSTRAINT "reusable_blocks_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_stats" ADD CONSTRAINT "reusable_blocks_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_quote" ADD CONSTRAINT "reusable_blocks_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_quote" ADD CONSTRAINT "reusable_blocks_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cta_links" ADD CONSTRAINT "reusable_blocks_blocks_cta_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cta_links" ADD CONSTRAINT "reusable_blocks_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_cta" ADD CONSTRAINT "reusable_blocks_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_gallery" ADD CONSTRAINT "reusable_blocks_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_team" ADD CONSTRAINT "reusable_blocks_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_contact" ADD CONSTRAINT "reusable_blocks_blocks_contact_contact_person_id_people_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_contact" ADD CONSTRAINT "reusable_blocks_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_section_columns" ADD CONSTRAINT "reusable_blocks_blocks_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_section" ADD CONSTRAINT "reusable_blocks_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_hero_links" ADD CONSTRAINT "reusable_blocks_blocks_hero_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_hero_links" ADD CONSTRAINT "reusable_blocks_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_hero" ADD CONSTRAINT "reusable_blocks_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reusable_blocks_blocks_hero" ADD CONSTRAINT "reusable_blocks_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_rels" ADD CONSTRAINT "reusable_blocks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_rels" ADD CONSTRAINT "reusable_blocks_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reusable_blocks_rels" ADD CONSTRAINT "reusable_blocks_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reusable_blocks_fk" FOREIGN KEY ("reusable_blocks_id") REFERENCES "public"."reusable_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation_children" ADD CONSTRAINT "site_settings_navigation_children_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_navigation_children" ADD CONSTRAINT "site_settings_navigation_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_header_actions" ADD CONSTRAINT "site_settings_header_actions_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_header_actions" ADD CONSTRAINT "site_settings_header_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_imprint_reference_id_pages_id_fk" FOREIGN KEY ("imprint_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_privacy_reference_id_pages_id_fk" FOREIGN KEY ("privacy_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_text_links_order_idx" ON "pages_blocks_media_text_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_text_links_parent_id_idx" ON "pages_blocks_media_text_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_text_links_link_link_reference_idx" ON "pages_blocks_media_text_links" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_media_text_order_idx" ON "pages_blocks_media_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_text_parent_id_idx" ON "pages_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_text_path_idx" ON "pages_blocks_media_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_text_image_idx" ON "pages_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cards_items_details_order_idx" ON "pages_blocks_cards_items_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_details_parent_id_idx" ON "pages_blocks_cards_items_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_items_order_idx" ON "pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_parent_id_idx" ON "pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_items_image_idx" ON "pages_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cards_items_link_link_reference_idx" ON "pages_blocks_cards_items" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_more_link_more_link_reference_idx" ON "pages_blocks_cards" USING btree ("more_link_reference_id");
  CREATE INDEX "pages_blocks_accordion_items_order_idx" ON "pages_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_accordion_items_parent_id_idx" ON "pages_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_accordion_order_idx" ON "pages_blocks_accordion" USING btree ("_order");
  CREATE INDEX "pages_blocks_accordion_parent_id_idx" ON "pages_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_accordion_path_idx" ON "pages_blocks_accordion" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_quote_order_idx" ON "pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_parent_id_idx" ON "pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_path_idx" ON "pages_blocks_quote" USING btree ("_path");
  CREATE INDEX "pages_blocks_quote_image_idx" ON "pages_blocks_quote" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_links_link_link_reference_idx" ON "pages_blocks_cta_links" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_order_idx" ON "pages_blocks_team" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_parent_id_idx" ON "pages_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_path_idx" ON "pages_blocks_team" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_contact_person_idx" ON "pages_blocks_contact" USING btree ("contact_person_id");
  CREATE INDEX "pages_blocks_section_columns_order_idx" ON "pages_blocks_section_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_columns_parent_id_idx" ON "pages_blocks_section_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_order_idx" ON "pages_blocks_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_parent_id_idx" ON "pages_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_path_idx" ON "pages_blocks_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_links_order_idx" ON "pages_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_links_parent_id_idx" ON "pages_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_links_link_link_reference_idx" ON "pages_blocks_hero_links" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_reusable_order_idx" ON "pages_blocks_reusable" USING btree ("_order");
  CREATE INDEX "pages_blocks_reusable_parent_id_idx" ON "pages_blocks_reusable" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_reusable_path_idx" ON "pages_blocks_reusable" USING btree ("_path");
  CREATE INDEX "pages_blocks_reusable_reference_idx" ON "pages_blocks_reusable" USING btree ("reference_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "pages_rels_people_id_idx" ON "pages_rels" USING btree ("people_id");
  CREATE INDEX "reusable_blocks_blocks_text_order_idx" ON "reusable_blocks_blocks_text" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_text_parent_id_idx" ON "reusable_blocks_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_text_path_idx" ON "reusable_blocks_blocks_text" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_media_text_links_order_idx" ON "reusable_blocks_blocks_media_text_links" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_media_text_links_parent_id_idx" ON "reusable_blocks_blocks_media_text_links" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_media_text_links_link_link_refere_idx" ON "reusable_blocks_blocks_media_text_links" USING btree ("link_reference_id");
  CREATE INDEX "reusable_blocks_blocks_media_text_order_idx" ON "reusable_blocks_blocks_media_text" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_media_text_parent_id_idx" ON "reusable_blocks_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_media_text_path_idx" ON "reusable_blocks_blocks_media_text" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_media_text_image_idx" ON "reusable_blocks_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "reusable_blocks_blocks_cards_items_details_order_idx" ON "reusable_blocks_blocks_cards_items_details" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_cards_items_details_parent_id_idx" ON "reusable_blocks_blocks_cards_items_details" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_cards_items_order_idx" ON "reusable_blocks_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_cards_items_parent_id_idx" ON "reusable_blocks_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_cards_items_image_idx" ON "reusable_blocks_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "reusable_blocks_blocks_cards_items_link_link_reference_idx" ON "reusable_blocks_blocks_cards_items" USING btree ("link_reference_id");
  CREATE INDEX "reusable_blocks_blocks_cards_order_idx" ON "reusable_blocks_blocks_cards" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_cards_parent_id_idx" ON "reusable_blocks_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_cards_path_idx" ON "reusable_blocks_blocks_cards" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_cards_more_link_more_link_referen_idx" ON "reusable_blocks_blocks_cards" USING btree ("more_link_reference_id");
  CREATE INDEX "reusable_blocks_blocks_accordion_items_order_idx" ON "reusable_blocks_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_accordion_items_parent_id_idx" ON "reusable_blocks_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_accordion_order_idx" ON "reusable_blocks_blocks_accordion" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_accordion_parent_id_idx" ON "reusable_blocks_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_accordion_path_idx" ON "reusable_blocks_blocks_accordion" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_stats_items_order_idx" ON "reusable_blocks_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_stats_items_parent_id_idx" ON "reusable_blocks_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_stats_order_idx" ON "reusable_blocks_blocks_stats" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_stats_parent_id_idx" ON "reusable_blocks_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_stats_path_idx" ON "reusable_blocks_blocks_stats" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_quote_order_idx" ON "reusable_blocks_blocks_quote" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_quote_parent_id_idx" ON "reusable_blocks_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_quote_path_idx" ON "reusable_blocks_blocks_quote" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_quote_image_idx" ON "reusable_blocks_blocks_quote" USING btree ("image_id");
  CREATE INDEX "reusable_blocks_blocks_cta_links_order_idx" ON "reusable_blocks_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_cta_links_parent_id_idx" ON "reusable_blocks_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_cta_links_link_link_reference_idx" ON "reusable_blocks_blocks_cta_links" USING btree ("link_reference_id");
  CREATE INDEX "reusable_blocks_blocks_cta_order_idx" ON "reusable_blocks_blocks_cta" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_cta_parent_id_idx" ON "reusable_blocks_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_cta_path_idx" ON "reusable_blocks_blocks_cta" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_gallery_order_idx" ON "reusable_blocks_blocks_gallery" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_gallery_parent_id_idx" ON "reusable_blocks_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_gallery_path_idx" ON "reusable_blocks_blocks_gallery" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_team_order_idx" ON "reusable_blocks_blocks_team" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_team_parent_id_idx" ON "reusable_blocks_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_team_path_idx" ON "reusable_blocks_blocks_team" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_contact_order_idx" ON "reusable_blocks_blocks_contact" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_contact_parent_id_idx" ON "reusable_blocks_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_contact_path_idx" ON "reusable_blocks_blocks_contact" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_contact_contact_person_idx" ON "reusable_blocks_blocks_contact" USING btree ("contact_person_id");
  CREATE INDEX "reusable_blocks_blocks_section_columns_order_idx" ON "reusable_blocks_blocks_section_columns" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_section_columns_parent_id_idx" ON "reusable_blocks_blocks_section_columns" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_section_order_idx" ON "reusable_blocks_blocks_section" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_section_parent_id_idx" ON "reusable_blocks_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_section_path_idx" ON "reusable_blocks_blocks_section" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_hero_links_order_idx" ON "reusable_blocks_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_hero_links_parent_id_idx" ON "reusable_blocks_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_hero_links_link_link_reference_idx" ON "reusable_blocks_blocks_hero_links" USING btree ("link_reference_id");
  CREATE INDEX "reusable_blocks_blocks_hero_order_idx" ON "reusable_blocks_blocks_hero" USING btree ("_order");
  CREATE INDEX "reusable_blocks_blocks_hero_parent_id_idx" ON "reusable_blocks_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "reusable_blocks_blocks_hero_path_idx" ON "reusable_blocks_blocks_hero" USING btree ("_path");
  CREATE INDEX "reusable_blocks_blocks_hero_image_idx" ON "reusable_blocks_blocks_hero" USING btree ("image_id");
  CREATE INDEX "reusable_blocks_updated_at_idx" ON "reusable_blocks" USING btree ("updated_at");
  CREATE INDEX "reusable_blocks_created_at_idx" ON "reusable_blocks" USING btree ("created_at");
  CREATE INDEX "reusable_blocks_rels_order_idx" ON "reusable_blocks_rels" USING btree ("order");
  CREATE INDEX "reusable_blocks_rels_parent_idx" ON "reusable_blocks_rels" USING btree ("parent_id");
  CREATE INDEX "reusable_blocks_rels_path_idx" ON "reusable_blocks_rels" USING btree ("path");
  CREATE INDEX "reusable_blocks_rels_media_id_idx" ON "reusable_blocks_rels" USING btree ("media_id");
  CREATE INDEX "reusable_blocks_rels_people_id_idx" ON "reusable_blocks_rels" USING btree ("people_id");
  CREATE INDEX "people_image_idx" ON "people" USING btree ("image_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_reusable_blocks_id_idx" ON "payload_locked_documents_rels" USING btree ("reusable_blocks_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_navigation_children_order_idx" ON "site_settings_navigation_children" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_children_parent_id_idx" ON "site_settings_navigation_children" USING btree ("_parent_id");
  CREATE INDEX "site_settings_navigation_children_link_link_reference_idx" ON "site_settings_navigation_children" USING btree ("link_reference_id");
  CREATE INDEX "site_settings_navigation_order_idx" ON "site_settings_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_parent_id_idx" ON "site_settings_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_navigation_link_link_reference_idx" ON "site_settings_navigation" USING btree ("link_reference_id");
  CREATE INDEX "site_settings_header_actions_order_idx" ON "site_settings_header_actions" USING btree ("_order");
  CREATE INDEX "site_settings_header_actions_parent_id_idx" ON "site_settings_header_actions" USING btree ("_parent_id");
  CREATE INDEX "site_settings_header_actions_link_link_reference_idx" ON "site_settings_header_actions" USING btree ("link_reference_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_links_link_link_reference_idx" ON "site_settings_footer_links" USING btree ("link_reference_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_imprint_imprint_reference_idx" ON "site_settings" USING btree ("imprint_reference_id");
  CREATE INDEX "site_settings_privacy_privacy_reference_idx" ON "site_settings" USING btree ("privacy_reference_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_media_text_links" CASCADE;
  DROP TABLE "pages_blocks_media_text" CASCADE;
  DROP TABLE "pages_blocks_cards_items_details" CASCADE;
  DROP TABLE "pages_blocks_cards_items" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages_blocks_accordion_items" CASCADE;
  DROP TABLE "pages_blocks_accordion" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_quote" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_team" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "pages_blocks_section_columns" CASCADE;
  DROP TABLE "pages_blocks_section" CASCADE;
  DROP TABLE "pages_blocks_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_reusable" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "reusable_blocks_blocks_text" CASCADE;
  DROP TABLE "reusable_blocks_blocks_media_text_links" CASCADE;
  DROP TABLE "reusable_blocks_blocks_media_text" CASCADE;
  DROP TABLE "reusable_blocks_blocks_cards_items_details" CASCADE;
  DROP TABLE "reusable_blocks_blocks_cards_items" CASCADE;
  DROP TABLE "reusable_blocks_blocks_cards" CASCADE;
  DROP TABLE "reusable_blocks_blocks_accordion_items" CASCADE;
  DROP TABLE "reusable_blocks_blocks_accordion" CASCADE;
  DROP TABLE "reusable_blocks_blocks_stats_items" CASCADE;
  DROP TABLE "reusable_blocks_blocks_stats" CASCADE;
  DROP TABLE "reusable_blocks_blocks_quote" CASCADE;
  DROP TABLE "reusable_blocks_blocks_cta_links" CASCADE;
  DROP TABLE "reusable_blocks_blocks_cta" CASCADE;
  DROP TABLE "reusable_blocks_blocks_gallery" CASCADE;
  DROP TABLE "reusable_blocks_blocks_team" CASCADE;
  DROP TABLE "reusable_blocks_blocks_contact" CASCADE;
  DROP TABLE "reusable_blocks_blocks_section_columns" CASCADE;
  DROP TABLE "reusable_blocks_blocks_section" CASCADE;
  DROP TABLE "reusable_blocks_blocks_hero_links" CASCADE;
  DROP TABLE "reusable_blocks_blocks_hero" CASCADE;
  DROP TABLE "reusable_blocks" CASCADE;
  DROP TABLE "reusable_blocks_rels" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_navigation_children" CASCADE;
  DROP TABLE "site_settings_navigation" CASCADE;
  DROP TABLE "site_settings_header_actions" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_text_width";
  DROP TYPE "public"."enum_pages_blocks_media_text_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_media_text_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_media_text_image_position";
  DROP TYPE "public"."enum_pages_blocks_cards_items_icon";
  DROP TYPE "public"."enum_pages_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_cards_style";
  DROP TYPE "public"."enum_pages_blocks_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_cards_more_link_type";
  DROP TYPE "public"."enum_pages_blocks_stats_variant";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_tone";
  DROP TYPE "public"."enum_pages_blocks_section_layout";
  DROP TYPE "public"."enum_pages_blocks_section_background";
  DROP TYPE "public"."enum_pages_blocks_section_width";
  DROP TYPE "public"."enum_pages_blocks_section_spacing";
  DROP TYPE "public"."enum_pages_blocks_section_vertical_align";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_reusable_blocks_blocks_text_width";
  DROP TYPE "public"."enum_reusable_blocks_blocks_media_text_links_link_type";
  DROP TYPE "public"."enum_reusable_blocks_blocks_media_text_links_link_appearance";
  DROP TYPE "public"."enum_reusable_blocks_blocks_media_text_image_position";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cards_items_icon";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cards_style";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cards_columns";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cards_more_link_type";
  DROP TYPE "public"."enum_reusable_blocks_blocks_stats_variant";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_reusable_blocks_blocks_cta_tone";
  DROP TYPE "public"."enum_reusable_blocks_blocks_section_layout";
  DROP TYPE "public"."enum_reusable_blocks_blocks_section_background";
  DROP TYPE "public"."enum_reusable_blocks_blocks_section_width";
  DROP TYPE "public"."enum_reusable_blocks_blocks_section_spacing";
  DROP TYPE "public"."enum_reusable_blocks_blocks_section_vertical_align";
  DROP TYPE "public"."enum_reusable_blocks_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_reusable_blocks_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_reusable_blocks_blocks_hero_variant";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_site_settings_navigation_children_link_type";
  DROP TYPE "public"."enum_site_settings_navigation_link_type";
  DROP TYPE "public"."enum_site_settings_header_actions_link_type";
  DROP TYPE "public"."enum_site_settings_header_actions_link_appearance";
  DROP TYPE "public"."enum_site_settings_footer_links_link_type";
  DROP TYPE "public"."enum_site_settings_logo_icon";
  DROP TYPE "public"."enum_site_settings_imprint_type";
  DROP TYPE "public"."enum_site_settings_privacy_type";
  DROP TYPE "public"."enum_site_settings_theme";
  DROP TYPE "public"."enum_site_settings_palette";`)
}
