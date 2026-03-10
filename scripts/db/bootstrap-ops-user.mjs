import { randomBytes, scryptSync } from "node:crypto";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });

const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.OPS_SESSION_SECRET;
const EMAIL = process.env.OPS_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const PASSWORD = process.env.OPS_BOOTSTRAP_PASSWORD;
const FULL_NAME = process.env.OPS_BOOTSTRAP_FULL_NAME?.trim();
const ROLES = (process.env.OPS_BOOTSTRAP_ROLES ?? "admin")
  .split(",")
  .map((role) => role.trim())
  .filter(Boolean);

const VALID_ROLES = new Set(["admin", "artist", "user"]);

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error("OPS_SESSION_SECRET must exist and be at least 32 characters.");
  process.exit(1);
}

if (!EMAIL) {
  console.error("OPS_BOOTSTRAP_EMAIL is required.");
  process.exit(1);
}

if (!PASSWORD || PASSWORD.length < 8) {
  console.error("OPS_BOOTSTRAP_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

if (ROLES.length === 0 || ROLES.some((role) => !VALID_ROLES.has(role))) {
  console.error("OPS_BOOTSTRAP_ROLES must contain only admin, artist, user.");
  process.exit(1);
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${derivedKey.toString("base64url")}`;
}

const sql = postgres(DATABASE_URL, { prepare: false });

try {
  const passwordHash = hashPassword(PASSWORD);
  const [user] = await sql`
    insert into users (email, password_hash, is_active)
    values (${EMAIL}, ${passwordHash}, true)
    on conflict (email) do update
      set password_hash = excluded.password_hash,
          is_active = true,
          updated_at = now()
    returning id, email
  `;

  if (FULL_NAME) {
    await sql`
      insert into user_profiles (user_id, full_name, display_name)
      values (${user.id}, ${FULL_NAME}, ${FULL_NAME})
      on conflict (user_id) do update
        set full_name = excluded.full_name,
            display_name = excluded.display_name,
            updated_at = now()
    `;
  }

  await sql`delete from user_roles where user_id = ${user.id}`;

  for (const role of ROLES) {
    await sql`
      insert into user_roles (user_id, role)
      values (${user.id}, ${role})
      on conflict (user_id, role) do nothing
    `;
  }

  console.log(
    JSON.stringify(
      {
        email: user.email,
        roles: ROLES,
        message: "Bootstrap user is ready.",
      },
      null,
      2
    )
  );
} finally {
  await sql.end();
}
