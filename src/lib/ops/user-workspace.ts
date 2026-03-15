import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  consentAcceptances,
  userProfiles,
  users,
} from "@/db/schema";
import { writeAuditLog } from "./audit";

export const OPS_TATTOO_CONSENT_DOCUMENT_TYPE = "tattoo_form_consent";
export const OPS_TATTOO_CONSENT_VERSION = "2026-03-v1";
export const OPS_PIERCING_CONSENT_DOCUMENT_TYPE = "piercing_form_consent";
export const OPS_PIERCING_CONSENT_VERSION = "2026-03-v1";

export type UserWorkspaceProfile = {
  email: string | null;
  fullName: string | null;
  displayName: string | null;
  phone: string | null;
};

export type ConsentAcceptanceRecord = {
  id: number;
  documentType: string;
  documentVersion: string;
  accepted: boolean;
  acceptedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type UserWorkspaceOverview = {
  profile: UserWorkspaceProfile;
  latestTattooConsent: ConsentAcceptanceRecord | null;
  latestPiercingConsent: ConsentAcceptanceRecord | null;
  latestConsent: ConsentAcceptanceRecord | null;
  isProfileComplete: boolean;
  hasCurrentTattooConsent: boolean;
  hasCurrentPiercingConsent: boolean;
  hasCurrentConsent: boolean;
};

export type UserWorkspaceStepKey =
  | "profile"
  | "appointments";

export type UserWorkspaceNextStep = {
  key: UserWorkspaceStepKey;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export type UpdateUserProfileInput = {
  fullName: string;
  displayName: string | null;
  phone: string;
};

type ConsentMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
};

type ConsentDefinition = {
  documentType: string;
  documentVersion: string;
};

const TATTOO_CONSENT_DEFINITION: ConsentDefinition = {
  documentType: OPS_TATTOO_CONSENT_DOCUMENT_TYPE,
  documentVersion: OPS_TATTOO_CONSENT_VERSION,
};

const PIERCING_CONSENT_DEFINITION: ConsentDefinition = {
  documentType: OPS_PIERCING_CONSENT_DOCUMENT_TYPE,
  documentVersion: OPS_PIERCING_CONSENT_VERSION,
};

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

export function isUserProfileComplete(profile: UserWorkspaceProfile): boolean {
  return Boolean(profile.fullName && profile.phone);
}

export function isUserReadyForAppointments(
  overview: Pick<UserWorkspaceOverview, "isProfileComplete">
): boolean {
  return overview.isProfileComplete;
}

export function getUserWorkspaceNextStep(
  overview: Pick<UserWorkspaceOverview, "isProfileComplete">
): UserWorkspaceNextStep {
  if (!overview.isProfileComplete) {
    return {
      key: "profile",
      title: "Profilini tamamla",
      description: "Ad soyad ve telefon bilgisi randevu için gerekir.",
      href: "/ops/user/profil",
      actionLabel: "Profili tamamla",
    };
  }

  return {
    key: "appointments",
    title: "Yeni randevu oluştur",
    description: "Profilin hazır. Tarih ve saat seçerek talep açabilirsin.",
    href: "/ops/user/randevular",
    actionLabel: "Randevu aç",
  };
}

export async function getUserWorkspaceOverview(userId: number): Promise<UserWorkspaceOverview> {
  const [profile, latestTattooConsent, latestPiercingConsent] = await Promise.all([
    getUserWorkspaceProfile(userId),
    getCurrentConsentAcceptance(userId),
    getCurrentPiercingConsentAcceptance(userId),
  ]);

  const isProfileComplete = isUserProfileComplete(profile);
  const hasCurrentTattooConsent = Boolean(latestTattooConsent?.accepted);
  const hasCurrentPiercingConsent = Boolean(latestPiercingConsent?.accepted);

  return {
    profile,
    latestTattooConsent,
    latestPiercingConsent,
    latestConsent: latestTattooConsent,
    isProfileComplete,
    hasCurrentTattooConsent,
    hasCurrentPiercingConsent,
    hasCurrentConsent: hasCurrentTattooConsent,
  };
}

export async function getUserWorkspaceProfile(userId: number): Promise<UserWorkspaceProfile> {
  const db = getDb();
  const rows = await db
    .select({
      email: users.email,
      phone: users.phone,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  const profile = rows[0];

  return {
    email: profile?.email ?? null,
    fullName: profile?.fullName ?? null,
    displayName: profile?.displayName ?? null,
    phone: profile?.phone ?? null,
  };
}

export async function updateUserWorkspaceProfile(
  userId: number,
  input: UpdateUserProfileInput
): Promise<UserWorkspaceProfile> {
  const db = getDb();
  const now = new Date();
  await db.transaction(async (tx) => {
    const currentRows = await tx
      .select({
        phone: users.phone,
        fullName: userProfiles.fullName,
        displayName: userProfiles.displayName,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    const current = currentRows[0];

    await tx
      .update(users)
      .set({
        phone: input.phone,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    await tx
      .insert(userProfiles)
      .values({
        userId,
        fullName: input.fullName,
        displayName: input.displayName,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          fullName: input.fullName,
          displayName: input.displayName,
          updatedAt: now,
        },
      });

    await writeAuditLog(
      {
        actorUserId: userId,
        action: "profile.updated",
        entityType: "user_profile",
        entityId: userId,
        payload: {
          changedFields: getChangedFields([
            {
              field: "fullName",
              before: current?.fullName ?? null,
              after: input.fullName,
            },
            {
              field: "displayName",
              before: current?.displayName ?? null,
              after: input.displayName,
            },
            {
              field: "phone",
              before: current?.phone ?? null,
              after: input.phone,
            },
          ]),
          hasDisplayName: Boolean(input.displayName),
        },
      },
      tx
    );
  });

  return getUserWorkspaceProfile(userId);
}

async function getCurrentConsentAcceptanceByDefinition(
  userId: number,
  definition: ConsentDefinition
): Promise<ConsentAcceptanceRecord | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: consentAcceptances.id,
      documentType: consentAcceptances.documentType,
      documentVersion: consentAcceptances.documentVersion,
      accepted: consentAcceptances.accepted,
      acceptedAt: consentAcceptances.acceptedAt,
      ipAddress: consentAcceptances.ipAddress,
      userAgent: consentAcceptances.userAgent,
    })
    .from(consentAcceptances)
    .where(
      and(
        eq(consentAcceptances.userId, userId),
        eq(consentAcceptances.documentType, definition.documentType),
        eq(consentAcceptances.documentVersion, definition.documentVersion)
      )
    )
    .orderBy(desc(consentAcceptances.acceptedAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function getCurrentConsentAcceptance(
  userId: number
): Promise<ConsentAcceptanceRecord | null> {
  return getCurrentConsentAcceptanceByDefinition(userId, TATTOO_CONSENT_DEFINITION);
}

export async function getCurrentPiercingConsentAcceptance(
  userId: number
): Promise<ConsentAcceptanceRecord | null> {
  return getCurrentConsentAcceptanceByDefinition(userId, PIERCING_CONSENT_DEFINITION);
}

async function acceptConsent(
  userId: number,
  definition: ConsentDefinition,
  metadata: ConsentMetadata
): Promise<{ record: ConsentAcceptanceRecord; created: boolean }> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const existingRows = await tx
      .select({
        id: consentAcceptances.id,
        documentType: consentAcceptances.documentType,
        documentVersion: consentAcceptances.documentVersion,
        accepted: consentAcceptances.accepted,
        acceptedAt: consentAcceptances.acceptedAt,
        ipAddress: consentAcceptances.ipAddress,
        userAgent: consentAcceptances.userAgent,
      })
      .from(consentAcceptances)
      .where(
        and(
          eq(consentAcceptances.userId, userId),
          eq(consentAcceptances.documentType, definition.documentType),
          eq(consentAcceptances.documentVersion, definition.documentVersion)
        )
      )
      .orderBy(desc(consentAcceptances.acceptedAt))
      .limit(1);

    const existing = existingRows[0];

    if (existing) {
      return {
        record: existing,
        created: false,
      };
    }

    const now = new Date();
    const insertedRows = await tx
      .insert(consentAcceptances)
      .values({
        userId,
        documentType: definition.documentType,
        documentVersion: definition.documentVersion,
        accepted: true,
        acceptedAt: now,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        createdAt: now,
      })
      .onConflictDoNothing({
        target: [
          consentAcceptances.userId,
          consentAcceptances.documentType,
          consentAcceptances.documentVersion,
        ],
      })
      .returning({
        id: consentAcceptances.id,
        documentType: consentAcceptances.documentType,
        documentVersion: consentAcceptances.documentVersion,
        accepted: consentAcceptances.accepted,
        acceptedAt: consentAcceptances.acceptedAt,
        ipAddress: consentAcceptances.ipAddress,
        userAgent: consentAcceptances.userAgent,
      });

    const inserted = insertedRows[0];

    if (inserted) {
      await writeAuditLog(
        {
          actorUserId: userId,
          action: "consent.accepted",
          entityType: "consent_acceptance",
          entityId: inserted.id,
          payload: {
            documentType: inserted.documentType,
            documentVersion: inserted.documentVersion,
          },
        },
        tx
      );

      return {
        record: inserted,
        created: true,
      };
    }

    const currentRows = await tx
      .select({
        id: consentAcceptances.id,
        documentType: consentAcceptances.documentType,
        documentVersion: consentAcceptances.documentVersion,
        accepted: consentAcceptances.accepted,
        acceptedAt: consentAcceptances.acceptedAt,
        ipAddress: consentAcceptances.ipAddress,
        userAgent: consentAcceptances.userAgent,
      })
      .from(consentAcceptances)
      .where(
        and(
          eq(consentAcceptances.userId, userId),
          eq(consentAcceptances.documentType, definition.documentType),
          eq(consentAcceptances.documentVersion, definition.documentVersion)
        )
      )
      .orderBy(desc(consentAcceptances.acceptedAt))
      .limit(1);

    const current = currentRows[0];

    if (!current) {
      throw new Error("Consent acceptance could not be loaded after insert.");
    }

    return {
      record: current,
      created: false,
    };
  });
}

export async function acceptCurrentConsent(
  userId: number,
  metadata: ConsentMetadata
): Promise<{ record: ConsentAcceptanceRecord; created: boolean }> {
  return acceptConsent(userId, TATTOO_CONSENT_DEFINITION, metadata);
}

export async function acceptCurrentPiercingConsent(
  userId: number,
  metadata: ConsentMetadata
): Promise<{ record: ConsentAcceptanceRecord; created: boolean }> {
  return acceptConsent(userId, PIERCING_CONSENT_DEFINITION, metadata);
}
