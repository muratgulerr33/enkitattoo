import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { users } from "./users";

export const TATTOO_FORM_STATUS_VALUES = ["draft", "submitted"] as const;

export type TattooFormStatus = (typeof TATTOO_FORM_STATUS_VALUES)[number];

export const tattooFormStatusEnum = pgEnum("tattoo_form_status", TATTOO_FORM_STATUS_VALUES);

export const tattooForms = pgTable(
  "tattoo_forms",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    snapshotVersion: integer("snapshot_version").notNull().default(1),
    isCurrent: boolean("is_current").notNull().default(true),
    placement: varchar("placement", { length: 160 }),
    sizeNotes: varchar("size_notes", { length: 160 }),
    designNotes: text("design_notes"),
    styleNotes: text("style_notes"),
    colorNotes: varchar("color_notes", { length: 120 }),
    referenceNotes: text("reference_notes"),
    healthNotes: text("health_notes"),
    status: tattooFormStatusEnum("status").notNull().default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("tattoo_forms_user_snapshot_unique").on(table.userId, table.snapshotVersion),
    index("tattoo_forms_user_current_idx").on(table.userId, table.isCurrent, table.updatedAt),
    index("tattoo_forms_user_status_idx").on(table.userId, table.status),
  ]
);

export const consentAcceptances = pgTable(
  "consent_acceptances",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentType: varchar("document_type", { length: 64 }).notNull(),
    documentVersion: varchar("document_version", { length: 32 }).notNull(),
    accepted: boolean("accepted").notNull().default(true),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("consent_acceptances_user_doc_version_unique").on(
      table.userId,
      table.documentType,
      table.documentVersion
    ),
    index("consent_acceptances_user_created_idx").on(table.userId, table.createdAt),
    index("consent_acceptances_doc_version_idx").on(table.documentType, table.documentVersion),
  ]
);
