import {
  bigint,
  bigserial,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { users } from "./users";

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
