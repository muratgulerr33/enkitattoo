CREATE TYPE "public"."tattoo_form_status" AS ENUM('draft', 'submitted');--> statement-breakpoint
CREATE TABLE "consent_acceptances" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"document_type" varchar(64) NOT NULL,
	"document_version" varchar(32) NOT NULL,
	"accepted" boolean DEFAULT true NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tattoo_forms" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"snapshot_version" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"placement" varchar(160),
	"size_notes" varchar(160),
	"design_notes" text,
	"style_notes" text,
	"color_notes" varchar(120),
	"reference_notes" text,
	"health_notes" text,
	"status" "tattoo_form_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consent_acceptances" ADD CONSTRAINT "consent_acceptances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tattoo_forms" ADD CONSTRAINT "tattoo_forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "consent_acceptances_user_doc_version_unique" ON "consent_acceptances" USING btree ("user_id","document_type","document_version");--> statement-breakpoint
CREATE INDEX "consent_acceptances_user_created_idx" ON "consent_acceptances" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "consent_acceptances_doc_version_idx" ON "consent_acceptances" USING btree ("document_type","document_version");--> statement-breakpoint
CREATE UNIQUE INDEX "tattoo_forms_user_snapshot_unique" ON "tattoo_forms" USING btree ("user_id","snapshot_version");--> statement-breakpoint
CREATE INDEX "tattoo_forms_user_current_idx" ON "tattoo_forms" USING btree ("user_id","is_current","updated_at");--> statement-breakpoint
CREATE INDEX "tattoo_forms_user_status_idx" ON "tattoo_forms" USING btree ("user_id","status");