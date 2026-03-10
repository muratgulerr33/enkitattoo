import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const FALLBACK_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/enki_tattoo";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? FALLBACK_DATABASE_URL,
  },
});
