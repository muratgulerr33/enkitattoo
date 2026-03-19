CREATE TYPE "public"."cash_entry_reason" AS ENUM('manual', 'service_collection', 'service_adjustment');--> statement-breakpoint
ALTER TABLE "cash_entries" ADD COLUMN "entry_reason" "cash_entry_reason" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "cash_entries" ADD COLUMN "service_intake_id" bigint;--> statement-breakpoint
CREATE INDEX "cash_entries_entry_reason_idx" ON "cash_entries" USING btree ("entry_reason");--> statement-breakpoint
CREATE INDEX "cash_entries_service_intake_id_idx" ON "cash_entries" USING btree ("service_intake_id");