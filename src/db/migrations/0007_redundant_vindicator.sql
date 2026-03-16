CREATE TYPE "public"."cash_entry_payment_method" AS ENUM('cash', 'card', 'bank_transfer', 'other');--> statement-breakpoint
ALTER TABLE "cash_entries" ADD COLUMN "payment_method" "cash_entry_payment_method" DEFAULT 'cash' NOT NULL;--> statement-breakpoint
CREATE INDEX "cash_entries_payment_method_idx" ON "cash_entries" USING btree ("payment_method");