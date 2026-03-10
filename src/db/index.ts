import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize the database client.");
  }

  return databaseUrl;
}

const globalForDb = globalThis as typeof globalThis & {
  __enkiSql?: ReturnType<typeof postgres>;
  __enkiDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function getSqlClient() {
  if (!globalForDb.__enkiSql) {
    globalForDb.__enkiSql = postgres(getDatabaseUrl(), {
      prepare: false,
    });
  }

  return globalForDb.__enkiSql;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  return getSqlClient();
}

export function getDb() {
  if (!globalForDb.__enkiDb) {
    globalForDb.__enkiDb = drizzle(getSqlClient(), { schema });
  }

  return globalForDb.__enkiDb;
}

export type Db = ReturnType<typeof getDb>;
