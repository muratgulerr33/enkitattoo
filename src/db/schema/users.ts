import {
  bigint,
  bigserial,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampColumns } from "./shared";

export const USER_ROLE_VALUES = ["admin", "artist", "user"] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const userRoleEnum = pgEnum("user_role", USER_ROLE_VALUES);

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    email: varchar("email", { length: 320 }),
    passwordHash: text("password_hash"),
    phone: varchar("phone", { length: 32 }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_is_active_idx").on(table.isActive),
  ]
);

export const userProfiles = pgTable("user_profiles", {
  userId: bigint("user_id", { mode: "number" })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 160 }),
  displayName: varchar("display_name", { length: 120 }),
  avatarUrl: text("avatar_url"),
  ...timestampColumns(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role),
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_role_idx").on(table.role),
  ]
);
