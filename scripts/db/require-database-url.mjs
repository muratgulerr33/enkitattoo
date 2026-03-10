import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

const cwd = process.cwd();

for (const fileName of [".env.local", ".env"]) {
  const filePath = path.join(cwd, fileName);
  if (fs.existsSync(filePath)) {
    loadEnv({ path: filePath, override: false });
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for Drizzle database commands.");
  process.exit(1);
}
