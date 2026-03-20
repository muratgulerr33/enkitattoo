import { and, asc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, type Db } from "@/db";
import { userProfiles, userRoles, users } from "@/db/schema";
import type { UserRole } from "@/db/schema/users";
import { writeAuditLog } from "./audit";
import { assertPhoneIsAvailable } from "./auth/users";
import { hashPassword } from "./auth/password";
import { normalizePhoneForMatching } from "./phone";

export type ArtistManagementFilter = "active" | "inactive" | "all";

export type ArtistListItem = {
  userId: number;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  displayName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ArtistManagementOverview = {
  filter: ArtistManagementFilter;
  counts: {
    active: number;
    inactive: number;
    total: number;
  };
  artists: ArtistListItem[];
};

export type ActiveArtistOption = {
  userId: number;
  label: string;
  email: string | null;
  phone: string | null;
};

type ArtistPresentation = Pick<
  ArtistListItem,
  "userId" | "email" | "phone" | "fullName" | "displayName"
>;

function getChangedFields(
  values: Array<{
    field: string;
    before: string | null;
    after: string | null;
  }>
): string[] {
  return values
    .filter((value) => value.before !== value.after)
    .map((value) => value.field);
}

function filterArtists(
  artists: ArtistListItem[],
  filter: ArtistManagementFilter
): ArtistListItem[] {
  if (filter === "all") {
    return artists;
  }

  return artists.filter((artist) => artist.isActive === (filter === "active"));
}

async function listPureArtists(
  executor: Pick<Db, "select"> = getDb()
): Promise<ArtistListItem[]> {
  const artistRole = alias(userRoles, "managed_artist_role");
  const adminRole = alias(userRoles, "managed_artist_admin_role");
  const userRole = alias(userRoles, "managed_artist_user_role");
  const rows = await executor
    .select({
      userId: users.id,
      email: users.email,
      phone: users.phone,
      isActive: users.isActive,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(
      artistRole,
      and(eq(artistRole.userId, users.id), eq(artistRole.role, "artist"))
    )
    .leftJoin(
      adminRole,
      and(eq(adminRole.userId, users.id), eq(adminRole.role, "admin"))
    )
    .leftJoin(userRole, and(eq(userRole.userId, users.id), eq(userRole.role, "user")))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(isNull(adminRole.id), isNull(userRole.id)))
    .orderBy(
      asc(users.isActive),
      asc(userProfiles.fullName),
      asc(userProfiles.displayName),
      asc(users.id)
    );

  return rows;
}

function isPureArtistSession(roles: UserRole[]): boolean {
  return roles.includes("artist") && !roles.includes("admin");
}

export function getArtistPresentationLabel(
  artist: ArtistPresentation,
  fallback = `Artist #${artist.userId}`
): string {
  return artist.displayName ?? artist.fullName ?? artist.email ?? artist.phone ?? fallback;
}

export async function listActiveArtistOptions(
  executor: Pick<Db, "select"> = getDb()
): Promise<ActiveArtistOption[]> {
  const artists = await listPureArtists(executor);

  return artists
    .filter((artist) => artist.isActive)
    .map((artist) => ({
      userId: artist.userId,
      label: getArtistPresentationLabel(artist),
      email: artist.email,
      phone: artist.phone,
    }));
}

export async function resolveStaffArtistAssignment(input: {
  requestedArtistUserId: number | null;
  sessionUserId: number;
  sessionUserRoles: UserRole[];
  executor?: Pick<Db, "select">;
}): Promise<number> {
  const artistOptions = await listActiveArtistOptions(input.executor);

  if (input.requestedArtistUserId !== null) {
    const selectedArtist = artistOptions.find(
      (artist) => artist.userId === input.requestedArtistUserId
    );

    if (!selectedArtist) {
      throw new Error("Seçilen artist kullanılamıyor.");
    }

    return selectedArtist.userId;
  }

  if (!artistOptions.length) {
    throw new Error("Aktif artist bulunamadı.");
  }

  if (isPureArtistSession(input.sessionUserRoles)) {
    const currentArtist = artistOptions.find((artist) => artist.userId === input.sessionUserId);

    if (currentArtist) {
      return currentArtist.userId;
    }
  }

  if (artistOptions.length === 1) {
    return artistOptions[0].userId;
  }

  throw new Error("Artist seçin.");
}

async function getManagedArtistOrThrow(
  artistUserId: number,
  executor: Pick<Db, "select"> = getDb()
): Promise<ArtistListItem> {
  const artists = await listPureArtists(executor);
  const artist = artists.find((item) => item.userId === artistUserId);

  if (!artist) {
    throw new Error("Artist bulunamadı.");
  }

  return artist;
}

export async function getArtistManagementOverview(
  filter: ArtistManagementFilter = "active"
): Promise<ArtistManagementOverview> {
  const artists = await listPureArtists();

  return {
    filter,
    counts: {
      active: artists.filter((artist) => artist.isActive).length,
      inactive: artists.filter((artist) => !artist.isActive).length,
      total: artists.length,
    },
    artists: filterArtists(artists, filter),
  };
}

export async function createArtistAccount(input: {
  fullName: string;
  phone: string;
  password: string;
  actorUserId: number;
}): Promise<ArtistListItem> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    await assertPhoneIsAvailable(input.phone, undefined, tx);

    const insertedUsers = await tx
      .insert(users)
      .values({
        email: null,
        passwordHash: await hashPassword(input.password),
        phone: input.phone,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        userId: users.id,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    const artistUser = insertedUsers[0];

    if (!artistUser) {
      throw new Error("Artist oluşturulamadı.");
    }

    await tx.insert(userProfiles).values({
      userId: artistUser.userId,
      fullName: input.fullName,
      displayName: null,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(userRoles).values({
      userId: artistUser.userId,
      role: "artist",
      createdAt: now,
      updatedAt: now,
    });

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "artist.created",
        entityType: "user",
        entityId: artistUser.userId,
        payload: {
          isActive: true,
        },
      },
      tx
    );

    return {
      ...artistUser,
      fullName: input.fullName,
      displayName: null,
    };
  });
}

export async function updateArtistAccount(input: {
  artistUserId: number;
  fullName: string;
  phone: string;
  actorUserId: number;
}): Promise<ArtistListItem> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const current = await getManagedArtistOrThrow(input.artistUserId, tx);
    const currentNormalizedPhone = normalizePhoneForMatching(current.phone ?? "");
    const nextNormalizedPhone = normalizePhoneForMatching(input.phone);

    if (currentNormalizedPhone !== nextNormalizedPhone) {
      await assertPhoneIsAvailable(input.phone, { excludeUserId: input.artistUserId }, tx);
    }

    await tx
      .update(users)
      .set({
        phone: input.phone,
        updatedAt: now,
      })
      .where(eq(users.id, input.artistUserId));

    await tx
      .insert(userProfiles)
      .values({
        userId: input.artistUserId,
        fullName: input.fullName,
        displayName: current.displayName,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          fullName: input.fullName,
          updatedAt: now,
        },
      });

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "artist.updated",
        entityType: "user",
        entityId: input.artistUserId,
        payload: {
          changedFields: getChangedFields([
            {
              field: "fullName",
              before: current.fullName,
              after: input.fullName,
            },
            {
              field: "phone",
              before: current.phone,
              after: input.phone,
            },
          ]),
        },
      },
      tx
    );

    return getManagedArtistOrThrow(input.artistUserId, tx);
  });
}

export async function updateArtistStatus(input: {
  artistUserId: number;
  isActive: boolean;
  actorUserId: number;
}): Promise<ArtistListItem> {
  const db = getDb();

  if (input.artistUserId === input.actorUserId) {
    throw new Error("Kendi hesabınızı pasife alamazsınız.");
  }

  return db.transaction(async (tx) => {
    const current = await getManagedArtistOrThrow(input.artistUserId, tx);

    if (input.isActive && current.phone) {
      await assertPhoneIsAvailable(
        current.phone,
        { excludeUserId: input.artistUserId },
        tx
      );
    }

    await tx
      .update(users)
      .set({
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.artistUserId));

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "artist.status_updated",
        entityType: "user",
        entityId: input.artistUserId,
        payload: {
          isActive: input.isActive,
        },
      },
      tx
    );

    return getManagedArtistOrThrow(input.artistUserId, tx);
  });
}
