import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { appointments } from "./appointments";
import { users } from "./users";

export const SERVICE_INTAKE_FLOW_TYPE_VALUES = [
  "appointment",
  "walk_in",
] as const;

export const SERVICE_INTAKE_SERVICE_TYPE_VALUES = [
  "tattoo",
  "piercing",
] as const;

export type ServiceIntakeFlowType =
  (typeof SERVICE_INTAKE_FLOW_TYPE_VALUES)[number];

export type ServiceIntakeServiceType =
  (typeof SERVICE_INTAKE_SERVICE_TYPE_VALUES)[number];

export const serviceIntakeFlowTypeEnum = pgEnum(
  "service_intake_flow_type",
  SERVICE_INTAKE_FLOW_TYPE_VALUES
);

export const serviceIntakeServiceTypeEnum = pgEnum(
  "service_intake_service_type",
  SERVICE_INTAKE_SERVICE_TYPE_VALUES
);

export const serviceIntakes = pgTable(
  "service_intakes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    customerUserId: bigint("customer_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    flowType: serviceIntakeFlowTypeEnum("flow_type").notNull(),
    serviceType: serviceIntakeServiceTypeEnum("service_type").notNull(),
    scheduledDate: varchar("scheduled_date", { length: 10 }).notNull(),
    scheduledTime: varchar("scheduled_time", { length: 5 }).notNull(),
    totalAmountCents: integer("total_amount_cents").notNull(),
    collectedAmountCents: integer("collected_amount_cents").notNull().default(0),
    notes: text("notes"),
    appointmentId: bigint("appointment_id", { mode: "number" }).references(() => appointments.id),
    artistUserId: bigint("artist_user_id", { mode: "number" }).references(() => users.id),
    createdByUserId: bigint("created_by_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    updatedByUserId: bigint("updated_by_user_id", { mode: "number" }).references(() => users.id),
    ...timestampColumns(),
  },
  (table) => [
    check("service_intakes_total_amount_positive", sql`${table.totalAmountCents} > 0`),
    check("service_intakes_collected_amount_non_negative", sql`${table.collectedAmountCents} >= 0`),
    check(
      "service_intakes_collected_amount_lte_total",
      sql`${table.collectedAmountCents} <= ${table.totalAmountCents}`
    ),
    index("service_intakes_customer_date_idx").on(table.customerUserId, table.scheduledDate),
    index("service_intakes_scheduled_date_time_idx").on(table.scheduledDate, table.scheduledTime),
    index("service_intakes_flow_type_idx").on(table.flowType),
    index("service_intakes_service_type_idx").on(table.serviceType),
    index("service_intakes_created_by_idx").on(table.createdByUserId),
    index("service_intakes_appointment_id_idx").on(table.appointmentId),
    index("service_intakes_artist_user_id_idx").on(table.artistUserId),
  ]
);
