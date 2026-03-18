CREATE TYPE "public"."service_intake_flow_type" AS ENUM('appointment', 'walk_in');--> statement-breakpoint
CREATE TYPE "public"."service_intake_service_type" AS ENUM('tattoo', 'piercing');--> statement-breakpoint
CREATE TABLE "service_intakes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_user_id" bigint NOT NULL,
	"flow_type" "service_intake_flow_type" NOT NULL,
	"service_type" "service_intake_service_type" NOT NULL,
	"scheduled_date" varchar(10) NOT NULL,
	"scheduled_time" varchar(5) NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"collected_amount_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"appointment_id" bigint,
	"created_by_user_id" bigint NOT NULL,
	"updated_by_user_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_intakes_total_amount_positive" CHECK ("service_intakes"."total_amount_cents" > 0),
	CONSTRAINT "service_intakes_collected_amount_non_negative" CHECK ("service_intakes"."collected_amount_cents" >= 0),
	CONSTRAINT "service_intakes_collected_amount_lte_total" CHECK ("service_intakes"."collected_amount_cents" <= "service_intakes"."total_amount_cents")
);
--> statement-breakpoint
ALTER TABLE "service_intakes" ADD CONSTRAINT "service_intakes_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_intakes" ADD CONSTRAINT "service_intakes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_intakes" ADD CONSTRAINT "service_intakes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_intakes" ADD CONSTRAINT "service_intakes_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "service_intakes_customer_date_idx" ON "service_intakes" USING btree ("customer_user_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "service_intakes_scheduled_date_time_idx" ON "service_intakes" USING btree ("scheduled_date","scheduled_time");--> statement-breakpoint
CREATE INDEX "service_intakes_flow_type_idx" ON "service_intakes" USING btree ("flow_type");--> statement-breakpoint
CREATE INDEX "service_intakes_service_type_idx" ON "service_intakes" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "service_intakes_created_by_idx" ON "service_intakes" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "service_intakes_appointment_id_idx" ON "service_intakes" USING btree ("appointment_id");