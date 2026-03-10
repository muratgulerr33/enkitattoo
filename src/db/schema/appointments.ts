import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { users } from "./users";

export const APPOINTMENT_STATUS_VALUES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const APPOINTMENT_SOURCE_VALUES = ["customer", "admin", "artist"] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number];
export type AppointmentSource = (typeof APPOINTMENT_SOURCE_VALUES)[number];

export const appointmentStatusEnum = pgEnum("appointment_status", APPOINTMENT_STATUS_VALUES);
export const appointmentSourceEnum = pgEnum("appointment_source", APPOINTMENT_SOURCE_VALUES);

export const appointments = pgTable(
  "appointments",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    customerUserId: bigint("customer_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    appointmentDate: varchar("appointment_date", { length: 10 }).notNull(),
    appointmentTime: varchar("appointment_time", { length: 5 }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    source: appointmentSourceEnum("source").notNull(),
    notes: text("notes"),
    createdByUserId: bigint("created_by_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("appointments_scheduled_slot_unique")
      .on(table.appointmentDate, table.appointmentTime)
      .where(sql`${table.status} = 'scheduled'`),
    index("appointments_customer_date_idx").on(table.customerUserId, table.appointmentDate),
    index("appointments_date_time_idx").on(table.appointmentDate, table.appointmentTime),
    index("appointments_status_idx").on(table.status),
    index("appointments_created_by_idx").on(table.createdByUserId),
  ]
);
