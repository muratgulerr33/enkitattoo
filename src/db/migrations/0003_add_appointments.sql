CREATE TYPE "public"."appointment_source" AS ENUM('customer', 'admin', 'artist');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_user_id" bigint NOT NULL,
	"appointment_date" varchar(10) NOT NULL,
	"appointment_time" varchar(5) NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"source" "appointment_source" NOT NULL,
	"notes" text,
	"created_by_user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "appointments_scheduled_slot_unique" ON "appointments" USING btree ("appointment_date","appointment_time") WHERE "appointments"."status" = 'scheduled';--> statement-breakpoint
CREATE INDEX "appointments_customer_date_idx" ON "appointments" USING btree ("customer_user_id","appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_date_time_idx" ON "appointments" USING btree ("appointment_date","appointment_time");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_created_by_idx" ON "appointments" USING btree ("created_by_user_id");