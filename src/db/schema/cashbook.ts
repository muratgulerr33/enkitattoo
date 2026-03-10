import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { users } from "./users";

export const CASH_ENTRY_TYPE_VALUES = ["income", "expense"] as const;

export type CashEntryType = (typeof CASH_ENTRY_TYPE_VALUES)[number];

export const cashEntryTypeEnum = pgEnum("cash_entry_type", CASH_ENTRY_TYPE_VALUES);

export const cashEntries = pgTable(
  "cash_entries",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    entryType: cashEntryTypeEnum("entry_type").notNull(),
    amountCents: integer("amount_cents").notNull(),
    note: text("note"),
    createdByUserId: bigint("created_by_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    updatedByUserId: bigint("updated_by_user_id", { mode: "number" }).references(() => users.id),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    deletedByUserId: bigint("deleted_by_user_id", { mode: "number" }).references(() => users.id),
    ...timestampColumns(),
  },
  (table) => [
    check("cash_entries_amount_cents_positive", sql`${table.amountCents} > 0`),
    index("cash_entries_entry_date_idx").on(table.entryDate),
    index("cash_entries_entry_type_idx").on(table.entryType),
    index("cash_entries_created_by_idx").on(table.createdByUserId),
    index("cash_entries_deleted_at_idx").on(table.deletedAt),
    index("cash_entries_entry_date_deleted_idx").on(table.entryDate, table.deletedAt),
  ]
);
