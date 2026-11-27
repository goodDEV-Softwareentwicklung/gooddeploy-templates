import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"media_find" boolean DEFAULT true,
  	"reusable_blocks_find" boolean DEFAULT true,
  	"site_settings_find" boolean DEFAULT true,
  	"site_settings_update" boolean DEFAULT false,
  	"payload_mcp_tool_describe_blocks" boolean DEFAULT true,
  	"payload_mcp_tool_list_pages" boolean DEFAULT true,
  	"payload_mcp_tool_read_page" boolean DEFAULT true,
  	"payload_mcp_tool_create_page" boolean DEFAULT true,
  	"payload_mcp_tool_update_page" boolean DEFAULT true,
  	"payload_mcp_tool_publish_page" boolean DEFAULT false,
  	"payload_mcp_tool_unpublish_page" boolean DEFAULT false,
  	"payload_mcp_tool_import_image" boolean DEFAULT true,
  	"payload_mcp_tool_request_image_upload" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  CREATE TABLE "mcp_upload_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"user_id" integer,
  	"mcp_key_id" integer,
  	"alt" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_upload_tokens_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mcp_upload_tokens" ADD CONSTRAINT "mcp_upload_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mcp_upload_tokens" ADD CONSTRAINT "mcp_upload_tokens_mcp_key_id_payload_mcp_api_keys_id_fk" FOREIGN KEY ("mcp_key_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "mcp_upload_tokens_token_hash_idx" ON "mcp_upload_tokens" USING btree ("token_hash");
  CREATE INDEX "mcp_upload_tokens_user_idx" ON "mcp_upload_tokens" USING btree ("user_id");
  CREATE INDEX "mcp_upload_tokens_mcp_key_idx" ON "mcp_upload_tokens" USING btree ("mcp_key_id");
  CREATE INDEX "mcp_upload_tokens_expires_at_idx" ON "mcp_upload_tokens" USING btree ("expires_at");
  CREATE INDEX "mcp_upload_tokens_updated_at_idx" ON "mcp_upload_tokens" USING btree ("updated_at");
  CREATE INDEX "mcp_upload_tokens_created_at_idx" ON "mcp_upload_tokens" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_upload_tokens_fk" FOREIGN KEY ("mcp_upload_tokens_id") REFERENCES "public"."mcp_upload_tokens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_locked_documents_rels_mcp_upload_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_upload_tokens_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Von Hand umgestellt: erst Verweise und Spalten, dann die Tabellen. In der
  // erzeugten Reihenfolge entfernte DROP TABLE … CASCADE die Fremdschlüssel schon,
  // und das folgende DROP CONSTRAINT brach ab.
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_upload_tokens_fk";
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_locked_documents_rels_mcp_upload_tokens_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_upload_tokens_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "mcp_upload_tokens" CASCADE;`)
}
