import {
  bigint,
  bigserial,
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";
import { users } from "./users";

export const customerNotes = pgTable(
  "customer_notes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: text("note").notNull(),
    updatedByUserId: bigint("updated_by_user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("customer_notes_user_id_unique").on(table.userId),
    index("customer_notes_updated_by_idx").on(table.updatedByUserId),
  ]
);
