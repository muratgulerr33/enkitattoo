import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import {
  serviceIntakes,
  userProfiles,
  users,
} from "@/db/schema";
import { getArtistPresentationLabel } from "@/lib/ops/artists";
import {
  getLegalDocumentById,
  getOpsApprovalReaderMarkdown,
} from "@/lib/legal/legal-content";
import { COMBINED_APPROVAL_LEGAL_DOCUMENT_ID } from "@/lib/legal/legal-registry";

export type StaffDocumentPacket = {
  serviceIntakeId: number;
  displayNo: string;
  contractDate: Date;
  source: "appointment" | "walk_in";
  serviceType: "tattoo" | "piercing";
  scheduledDate: string;
  scheduledTime: string;
  totalAmountCents: number;
  collectedAmountCents: number;
  customer: {
    userId: number;
    fullName: string | null;
    displayName: string | null;
    phone: string | null;
  };
  artistName: string | null;
  legal: {
    markdown: string;
  };
};

function formatServiceIntakeDisplayNo(serviceIntakeId: number): string {
  return `SI-${serviceIntakeId.toString().padStart(6, "0")}`;
}

export async function getStaffDocumentPacket(
  serviceIntakeId: number
): Promise<StaffDocumentPacket | null> {
  const db = getDb();
  const artistUsers = alias(users, "document_packet_artist_users");
  const artistProfiles = alias(userProfiles, "document_packet_artist_profiles");
  const rows = await db
    .select({
      serviceIntakeId: serviceIntakes.id,
      source: serviceIntakes.flowType,
      serviceType: serviceIntakes.serviceType,
      scheduledDate: serviceIntakes.scheduledDate,
      scheduledTime: serviceIntakes.scheduledTime,
      totalAmountCents: serviceIntakes.totalAmountCents,
      collectedAmountCents: serviceIntakes.collectedAmountCents,
      customerUserId: users.id,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
      phone: users.phone,
      artistUserId: serviceIntakes.artistUserId,
      artistEmail: artistUsers.email,
      artistPhone: artistUsers.phone,
      artistFullName: artistProfiles.fullName,
      artistDisplayName: artistProfiles.displayName,
    })
    .from(serviceIntakes)
    .innerJoin(users, eq(users.id, serviceIntakes.customerUserId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(artistUsers, eq(artistUsers.id, serviceIntakes.artistUserId))
    .leftJoin(artistProfiles, eq(artistProfiles.userId, artistUsers.id))
    .where(eq(serviceIntakes.id, serviceIntakeId))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  const legalDocument = await getLegalDocumentById(COMBINED_APPROVAL_LEGAL_DOCUMENT_ID);

  return {
    serviceIntakeId: row.serviceIntakeId,
    displayNo: formatServiceIntakeDisplayNo(row.serviceIntakeId),
    contractDate: new Date(),
    source: row.source,
    serviceType: row.serviceType,
    scheduledDate: row.scheduledDate,
    scheduledTime: row.scheduledTime,
    totalAmountCents: row.totalAmountCents,
    collectedAmountCents: row.collectedAmountCents,
    customer: {
      userId: row.customerUserId,
      fullName: row.fullName,
      displayName: row.displayName,
      phone: row.phone,
    },
    artistName:
      row.artistUserId === null
        ? null
        : getArtistPresentationLabel({
            userId: row.artistUserId,
            email: row.artistEmail,
            phone: row.artistPhone,
            fullName: row.artistFullName,
            displayName: row.artistDisplayName,
          }),
    legal: {
      markdown: getOpsApprovalReaderMarkdown(legalDocument.markdown),
    },
  };
}
