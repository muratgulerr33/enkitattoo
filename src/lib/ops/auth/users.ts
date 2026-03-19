import { eq, sql } from "drizzle-orm";
import { getDb, hasDatabaseUrl, type Db } from "@/db";
import { userProfiles, userRoles, users, type UserRole } from "@/db/schema/users";
import { writeAuditLog } from "@/lib/ops/audit";
import { getNormalizedPhoneSql, normalizePhoneForMatching } from "@/lib/ops/phone";
import { hashPassword, verifyPassword } from "./password";

export const PHONE_UNIQUE_CONFLICT_MESSAGE = "Bu telefon başka bir hesapta kayıtlı.";

export type OpsAuthUser = {
  id: number;
  email: string | null;
  passwordHash: string | null;
  phone: string | null;
  isActive: boolean;
  fullName: string | null;
  displayName: string | null;
  roles: UserRole[];
};

export type OpsAuthIdentifierLookupResult =
  | {
      status: "not_found";
    }
  | {
      status: "ambiguous_phone";
      matchingUserCount: number;
    }
  | {
      status: "found";
      user: OpsAuthUser;
    };

type PhoneLookupExecutor = Pick<Db, "select">;
type PasswordMutationExecutor = Pick<Db, "select" | "update" | "insert">;
type OpsAuthUserRow = {
  id: number;
  email: string | null;
  passwordHash: string | null;
  phone: string | null;
  isActive: boolean;
  fullName: string | null;
  displayName: string | null;
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

function toOpsAuthUser(
  row: OpsAuthUserRow,
  roles: UserRole[]
): OpsAuthUser {
  return {
    ...row,
    roles,
  };
}

async function mapOpsAuthUser(row?: OpsAuthUserRow): Promise<OpsAuthUser | null> {
  if (!row) {
    return null;
  }

  return toOpsAuthUser(row, await getRolesForUser(row.id));
}

async function listOpsUsersByNormalizedPhone(
  normalizedPhone: string
): Promise<OpsAuthUser[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      phone: users.phone,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(sql`${getNormalizedPhoneSql(users.phone)} = ${normalizedPhone}`)
    .orderBy(users.id);

  return Promise.all(
    rows.map(async (row) => toOpsAuthUser(row, await getRolesForUser(row.id)))
  );
}

export async function assertPhoneIsAvailable(
  phone: string,
  options?: {
    excludeUserId?: number;
  },
  executor: PhoneLookupExecutor = getDb()
): Promise<void> {
  const normalizedPhone = normalizePhoneForMatching(phone);

  if (!normalizedPhone) {
    return;
  }

  const rows = await executor
    .select({ id: users.id })
    .from(users)
    .where(sql`${getNormalizedPhoneSql(users.phone)} = ${normalizedPhone}`);

  const hasConflict = rows.some((row) => row.id !== options?.excludeUserId);

  if (hasConflict) {
    throw new Error(PHONE_UNIQUE_CONFLICT_MESSAGE);
  }
}

export async function findOpsUserByIdentifier(
  identifier: string
): Promise<OpsAuthIdentifierLookupResult> {
  const normalizedIdentifier = identifier.trim();

  if (!normalizedIdentifier) {
    return { status: "not_found" };
  }

  if (normalizedIdentifier.includes("@")) {
    const user = await findOpsUserByEmail(normalizedIdentifier);

    if (!user) {
      return { status: "not_found" };
    }

    return {
      status: "found",
      user,
    };
  }

  const normalizedPhone = normalizePhoneForMatching(normalizedIdentifier);

  if (!normalizedPhone) {
    return { status: "not_found" };
  }

  const matches = await listOpsUsersByNormalizedPhone(normalizedPhone);

  if (matches.length > 1) {
    return {
      status: "ambiguous_phone",
      matchingUserCount: matches.length,
    };
  }

  if (!matches[0]) {
    return { status: "not_found" };
  }

  return {
    status: "found",
    user: matches[0],
  };
}

export async function findOpsUserByEmail(email: string): Promise<OpsAuthUser | null> {
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      phone: users.phone,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  return mapOpsAuthUser(rows[0]);
}

export async function findOpsUserById(userId: number): Promise<OpsAuthUser | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      phone: users.phone,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return mapOpsAuthUser(rows[0]);
}

export async function changeOpsUserPassword(
  input: {
    userId: number;
    currentPassword: string;
    nextPassword: string;
  },
  executor: PasswordMutationExecutor = getDb()
): Promise<void> {
  const currentRows = await executor
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  const current = currentRows[0];

  if (!current?.passwordHash) {
    throw new Error("Şifre değiştirilemedi.");
  }

  const currentPasswordValid = await verifyPassword(
    input.currentPassword,
    current.passwordHash
  );

  if (!currentPasswordValid) {
    throw new Error("Eski şifre hatalı.");
  }

  await executor
    .update(users)
    .set({
      passwordHash: await hashPassword(input.nextPassword),
      updatedAt: new Date(),
    })
    .where(eq(users.id, input.userId));

  await writeAuditLog(
    {
      actorUserId: input.userId,
      action: "password.changed",
      entityType: "user",
      entityId: input.userId,
    },
    executor
  );
}
