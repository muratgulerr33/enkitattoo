import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  consentAcceptances,
  tattooForms,
  type TattooFormStatus,
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

export type TattooFormSnapshot = {
  id: number;
  snapshotVersion: number;
  placement: string | null;
  sizeNotes: string | null;
  designNotes: string | null;
  styleNotes: string | null;
  colorNotes: string | null;
  referenceNotes: string | null;
  healthNotes: string | null;
  status: TattooFormStatus;
  submittedAt: Date | null;
  updatedAt: Date;
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
  latestTattooForm: TattooFormSnapshot | null;
  latestTattooConsent: ConsentAcceptanceRecord | null;
  latestPiercingConsent: ConsentAcceptanceRecord | null;
  latestConsent: ConsentAcceptanceRecord | null;
  isProfileComplete: boolean;
  isTattooFormSubmitted: boolean;
  hasCurrentTattooConsent: boolean;
  hasCurrentPiercingConsent: boolean;
  hasCurrentConsent: boolean;
};

export type UserWorkspaceStepKey =
  | "profile"
  | "tattooForm"
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

export type SaveTattooFormInput = {
  placement: string | null;
  sizeNotes: string | null;
  designNotes: string | null;
  styleNotes: string | null;
  colorNotes: string | null;
  referenceNotes: string | null;
  healthNotes: string | null;
  status: TattooFormStatus;
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

function getFilledTattooFormFields(input: SaveTattooFormInput): string[] {
  return [
    input.placement ? "placement" : null,
    input.sizeNotes ? "sizeNotes" : null,
    input.designNotes ? "designNotes" : null,
    input.styleNotes ? "styleNotes" : null,
    input.colorNotes ? "colorNotes" : null,
    input.referenceNotes ? "referenceNotes" : null,
    input.healthNotes ? "healthNotes" : null,
  ].filter((value): value is string => Boolean(value));
}

export function isUserProfileComplete(profile: UserWorkspaceProfile): boolean {
  return Boolean(profile.fullName && profile.phone);
}

export function isSubmittedTattooForm(form: TattooFormSnapshot | null): boolean {
  return form?.status === "submitted";
}

export function isUserReadyForAppointments(
  overview: Pick<UserWorkspaceOverview, "isProfileComplete" | "isTattooFormSubmitted">
): boolean {
  return overview.isProfileComplete && overview.isTattooFormSubmitted;
}

export function getUserWorkspaceNextStep(
  overview: Pick<UserWorkspaceOverview, "isProfileComplete" | "isTattooFormSubmitted">
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

  if (!overview.isTattooFormSubmitted) {
    return {
      key: "tattooForm",
      title: "Dövme formunu tamamla",
      description: "Bölge, boyut ve tasarım notları ekibe hazırlık sağlar.",
      href: "/ops/user/form",
      actionLabel: "Forma git",
    };
  }

  return {
    key: "appointments",
    title: "Yeni randevu oluştur",
    description: "Profil ve dövme formu hazır. Tarih ve saat seçerek talep açabilirsin.",
    href: "/ops/user/randevular",
    actionLabel: "Randevu aç",
  };
}

export async function getUserWorkspaceOverview(userId: number): Promise<UserWorkspaceOverview> {
  const [profile, latestTattooForm, latestTattooConsent, latestPiercingConsent] = await Promise.all([
    getUserWorkspaceProfile(userId),
    getLatestTattooForm(userId),
    getCurrentConsentAcceptance(userId),
    getCurrentPiercingConsentAcceptance(userId),
  ]);

  const isProfileComplete = isUserProfileComplete(profile);
  const isTattooFormSubmitted = isSubmittedTattooForm(latestTattooForm);
  const hasCurrentTattooConsent = Boolean(latestTattooConsent?.accepted);
  const hasCurrentPiercingConsent = Boolean(latestPiercingConsent?.accepted);

  return {
    profile,
    latestTattooForm,
    latestTattooConsent,
    latestPiercingConsent,
    latestConsent: latestTattooConsent,
    isProfileComplete,
    isTattooFormSubmitted,
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

export async function getLatestTattooForm(userId: number): Promise<TattooFormSnapshot | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: tattooForms.id,
      snapshotVersion: tattooForms.snapshotVersion,
      placement: tattooForms.placement,
      sizeNotes: tattooForms.sizeNotes,
      designNotes: tattooForms.designNotes,
      styleNotes: tattooForms.styleNotes,
      colorNotes: tattooForms.colorNotes,
      referenceNotes: tattooForms.referenceNotes,
      healthNotes: tattooForms.healthNotes,
      status: tattooForms.status,
      submittedAt: tattooForms.submittedAt,
      updatedAt: tattooForms.updatedAt,
    })
    .from(tattooForms)
    .where(and(eq(tattooForms.userId, userId), eq(tattooForms.isCurrent, true)))
    .orderBy(desc(tattooForms.snapshotVersion))
    .limit(1);

  return rows[0] ?? null;
}

export async function createTattooFormSnapshot(
  userId: number,
  input: SaveTattooFormInput
): Promise<TattooFormSnapshot> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const currentRows = await tx
      .select({
        id: tattooForms.id,
        snapshotVersion: tattooForms.snapshotVersion,
      })
      .from(tattooForms)
      .where(and(eq(tattooForms.userId, userId), eq(tattooForms.isCurrent, true)))
      .orderBy(desc(tattooForms.snapshotVersion))
      .limit(1);

    const current = currentRows[0] ?? null;
    const snapshotVersion = current ? current.snapshotVersion + 1 : 1;

    if (current) {
      await tx
        .update(tattooForms)
        .set({
          isCurrent: false,
          updatedAt: now,
        })
        .where(eq(tattooForms.id, current.id));
    }

    const insertedRows = await tx
      .insert(tattooForms)
      .values({
        userId,
        snapshotVersion,
        isCurrent: true,
        placement: input.placement,
        sizeNotes: input.sizeNotes,
        designNotes: input.designNotes,
        styleNotes: input.styleNotes,
        colorNotes: input.colorNotes,
        referenceNotes: input.referenceNotes,
        healthNotes: input.healthNotes,
        status: input.status,
        submittedAt: input.status === "submitted" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: tattooForms.id,
        snapshotVersion: tattooForms.snapshotVersion,
        placement: tattooForms.placement,
        sizeNotes: tattooForms.sizeNotes,
        designNotes: tattooForms.designNotes,
        styleNotes: tattooForms.styleNotes,
        colorNotes: tattooForms.colorNotes,
        referenceNotes: tattooForms.referenceNotes,
        healthNotes: tattooForms.healthNotes,
        status: tattooForms.status,
        submittedAt: tattooForms.submittedAt,
        updatedAt: tattooForms.updatedAt,
      });

    const inserted = insertedRows[0];

    if (!inserted) {
      throw new Error("Tattoo form snapshot could not be created.");
    }

    await writeAuditLog(
      {
        actorUserId: userId,
        action: input.status === "submitted" ? "tattoo_form.submitted" : "tattoo_form.saved",
        entityType: "tattoo_form",
        entityId: inserted.id,
        payload: {
          snapshotVersion: inserted.snapshotVersion,
          status: inserted.status,
          filledFields: getFilledTattooFormFields(input),
        },
      },
      tx
    );

    return inserted;
  });
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
