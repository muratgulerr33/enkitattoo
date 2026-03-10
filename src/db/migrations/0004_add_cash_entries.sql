CREATE TYPE "public"."cash_entry_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "cash_entries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"entry_date" date NOT NULL,
	"entry_type" "cash_entry_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"note" text,
	"created_by_user_id" bigint NOT NULL,
	"updated_by_user_id" bigint,
	"deleted_at" timestamp with time zone,
	"deleted_by_user_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cash_entries_amount_cents_positive" CHECK ("cash_entries"."amount_cents" > 0)
);
--> statement-breakpoint
ALTER TABLE "cash_entries" ADD CONSTRAINT "cash_entries_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_entries" ADD CONSTRAINT "cash_entries_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_entries" ADD CONSTRAINT "cash_entries_deleted_by_user_id_users_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cash_entries_entry_date_idx" ON "cash_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "cash_entries_entry_type_idx" ON "cash_entries" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "cash_entries_created_by_idx" ON "cash_entries" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "cash_entries_deleted_at_idx" ON "cash_entries" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "cash_entries_entry_date_deleted_idx" ON "cash_entries" USING btree ("entry_date","deleted_at");