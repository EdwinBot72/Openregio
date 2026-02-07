CREATE TABLE "authorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "authorities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author_id" varchar NOT NULL,
	"author_name" text NOT NULL,
	"featured_image" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_user_id" varchar NOT NULL,
	"referred_user_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"mollie_payment_id" text NOT NULL,
	"plan" text NOT NULL,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"field_name" varchar NOT NULL,
	"old_visibility" varchar,
	"new_visibility" varchar NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crew_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" varchar NOT NULL,
	"crew_profile_id" varchar NOT NULL,
	"message" text,
	"status" text DEFAULT 'applied' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crew_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"region" text NOT NULL,
	"display_name" text NOT NULL,
	"headline" text,
	"categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"availability" text,
	"rate_type" text DEFAULT 'hour' NOT NULL,
	"rate_min_eur" text,
	"phone" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crew_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"region" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"rate_type" text DEFAULT 'negotiable' NOT NULL,
	"rate_eur" text,
	"location_text" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"file_path" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_visibility" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"field_name" varchar NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	CONSTRAINT "field_visibility_user_id_field_name_unique" UNIQUE("user_id","field_name")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"plan" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text NOT NULL,
	"phone" text,
	"region" text,
	"category" text,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"note" text,
	"source" text DEFAULT 'openregio'
);
--> statement-breakpoint
CREATE TABLE "onboarding_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rag_chunks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar NOT NULL,
	"chunk_index" integer NOT NULL,
	"text" text NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "rag_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"region" text,
	"woo_category" text,
	"title" text,
	"source_type" text DEFAULT 'upload',
	"created_at" timestamp with time zone DEFAULT now(),
	"letter_date" timestamp,
	"metadata_json" jsonb DEFAULT '{}'::jsonb,
	"needs_ocr" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "rag_embeddings" (
	"chunk_id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"token_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "request_tags" (
	"request_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "request_tags_request_id_tag_id_unique" UNIQUE("request_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"object_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer DEFAULT 0,
	"content_type" text DEFAULT 'application/octet-stream',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "woo_categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"is_allowed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "woo_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"category_slug" text,
	"kind" text DEFAULT 'attachment' NOT NULL,
	"filename" text NOT NULL,
	"file_url" text,
	"received_at" timestamp with time zone,
	"summary" text,
	"text_content" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "woo_dossiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"authority" text NOT NULL,
	"subject" text NOT NULL,
	"context" text,
	"requested_documents" text,
	"generated_letter" text,
	"checklist" text,
	"status" text DEFAULT 'intake',
	"uploaded_document" text,
	"location" text,
	"purpose" text,
	"user_question" text,
	"extracted_data" jsonb,
	"document_list" jsonb,
	"deadline" timestamp with time zone,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "woo_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"region_id" integer,
	"authority_id" integer,
	"category_slug" text DEFAULT 'beleid_verordening',
	"title" text NOT NULL,
	"body" text,
	"reference_code" text,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'sent',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_user_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "mollie_payment_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "region" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "visibility_settings" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_token" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by_user_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliate_user_id_users_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_log" ADD CONSTRAINT "consent_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_applications" ADD CONSTRAINT "crew_applications_request_id_crew_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."crew_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_applications" ADD CONSTRAINT "crew_applications_crew_profile_id_crew_profiles_id_fk" FOREIGN KEY ("crew_profile_id") REFERENCES "public"."crew_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_profiles" ADD CONSTRAINT "crew_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_requests" ADD CONSTRAINT "crew_requests_business_id_bedrijfsprofielen_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."bedrijfsprofielen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_visibility" ADD CONSTRAINT "field_visibility_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tokens" ADD CONSTRAINT "onboarding_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_chunks" ADD CONSTRAINT "rag_chunks_document_id_rag_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."rag_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_embeddings" ADD CONSTRAINT "rag_embeddings_chunk_id_rag_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."rag_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_tags" ADD CONSTRAINT "request_tags_request_id_woo_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."woo_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_tags" ADD CONSTRAINT "request_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_documents" ADD CONSTRAINT "woo_documents_request_id_woo_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."woo_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_documents" ADD CONSTRAINT "woo_documents_category_slug_woo_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."woo_categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_dossiers" ADD CONSTRAINT "woo_dossiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_requests" ADD CONSTRAINT "woo_requests_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_requests" ADD CONSTRAINT "woo_requests_authority_id_authorities_id_fk" FOREIGN KEY ("authority_id") REFERENCES "public"."authorities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "woo_requests" ADD CONSTRAINT "woo_requests_category_slug_woo_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."woo_categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_user" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_rag_chunks_doc" ON "rag_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_rag_documents_user" ON "rag_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_token_id" ON "refresh_tokens" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "idx_woo_documents_request" ON "woo_documents" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_woo_documents_category" ON "woo_documents" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "idx_woo_dossiers_user" ON "woo_dossiers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_woo_requests_region" ON "woo_requests" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_woo_requests_authority" ON "woo_requests" USING btree ("authority_id");--> statement-breakpoint
CREATE INDEX "idx_woo_requests_category" ON "woo_requests" USING btree ("category_slug");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_mollie_payment_id_unique" UNIQUE("mollie_payment_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code");