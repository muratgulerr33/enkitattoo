import { eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db";
import { userProfiles, userRoles, users, type UserRole } from "@/db/schema/users";

export type OpsAuthUser = {
  id: number;
  email: string | null;
  passwordHash: string | null;
  isActive: boolean;
  fullName: string | null;
  displayName: string | null;
  roles: UserRole[];
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getRolesForUser(userId: number): Promise<UserRole[]> {
  const db = getDb();
  const rows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  return rows.map((row) => row.role);
}

export function canUseOpsAuthDatabase(): boolean {
  return hasDatabaseUrl();
}

export async function findOpsUserByEmail(email: string): Promise<OpsAuthUser | null> {
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const user = rows[0];

  if (!user) {
    return null;
  }

  return {
    ...user,
    roles: await getRolesForUser(user.id),
  };
}

export async function findOpsUserById(userId: number): Promise<OpsAuthUser | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  const user = rows[0];

  if (!user) {
    return null;
  }

  return {
    ...user,
    roles: await getRolesForUser(user.id),
  };
}
