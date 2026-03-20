import { and, asc, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import {
  serviceIntakes,
  type ServiceIntakeFlowType,
  type ServiceIntakeServiceType,
  userProfiles,
  userRoles,
  users,
} from "@/db/schema";
import { getArtistPresentationLabel } from "./artists";
import { writeAuditLog } from "./audit";
import { postServiceIntakeCashDelta } from "./cashbook";

export type ServiceIntakeRecord = {
  id: number;
  customerUserId: number;
  flowType: ServiceIntakeFlowType;
  serviceType: ServiceIntakeServiceType;
  scheduledDate: string;
  scheduledTime: string;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
  appointmentId: number | null;
  artistUserId: number | null;
  createdByUserId: number;
  updatedByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateServiceIntakeInput = {
  customerUserId: number;
  flowType: ServiceIntakeFlowType;
  serviceType: ServiceIntakeServiceType;
  scheduledDate: string;
  scheduledTime: string;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
  artistUserId: number;
  createdByUserId: number;
};

export type AttachServiceIntakeAppointmentInput = {
  serviceIntakeId: number;
  appointmentId: number;
  updatedByUserId: number;
};

export type UpdateWalkInServiceIntakeInput = {
  serviceIntakeId: number;
  customerUserId: number;
  serviceType: ServiceIntakeServiceType;
  scheduledDate: string;
  scheduledTime: string;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
  artistUserId: number;
  updatedByUserId: number;
};

export type ServiceIntakeSummaryRecord = ServiceIntakeRecord & {
  artistName: string | null;
};

export type StaffWalkInServiceIntakeRecord = ServiceIntakeSummaryRecord & {
  customerName: string;
  customerEmail: string | null;
};

export type UpdateWalkInServiceIntakeResult = {
  serviceIntake: ServiceIntakeRecord;
  previousCustomerUserId: number;
};

function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

function getMonthBounds(monthValue: string): {
  startDate: string;
  endDate: string;
} {
  const normalized = /^\d{4}-\d{2}$/.test(monthValue)
    ? monthValue
    : `${new Date().getFullYear()}-${padNumber(new Date().getMonth() + 1)}`;
  const [yearPart, monthPart] = normalized.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  return {
    startDate: `${yearPart}-${monthPart}-01`,
    endDate: `${yearPart}-${monthPart}-${padNumber(lastDay)}`,
  };
}

function getCustomerDisplayName(row: {
  fullName: string | null;
  displayName: string | null;
  email: string | null;
  customerUserId: number;
}): string {
  return (
    row.displayName ??
    row.fullName ??
    row.email ??
    `Kullanıcı #${row.customerUserId}`
  );
}

function getArtistDisplayName(row: {
  artistUserId: number | null;
  artistFullName: string | null;
  artistDisplayName: string | null;
  artistEmail: string | null;
  artistPhone: string | null;
}): string | null {
  if (row.artistUserId === null) {
    return null;
  }

  return getArtistPresentationLabel({
    userId: row.artistUserId,
    fullName: row.artistFullName,
    displayName: row.artistDisplayName,
    email: row.artistEmail,
    phone: row.artistPhone,
  });
}

async function assertCustomerUserExists(
  customerUserId: number,
  executor: Pick<ReturnType<typeof getDb>, "select"> = getDb()
): Promise<void> {
  const rows = await executor
    .select({ id: users.id })
    .from(users)
    .innerJoin(
      userRoles,
      and(eq(userRoles.userId, users.id), eq(userRoles.role, "user"))
    )
    .where(and(eq(users.id, customerUserId), eq(users.isActive, true)))
    .limit(1);

  if (!rows[0]) {
    throw new Error("Seçilen müşteri kullanılamıyor.");
  }
}

async function assertActiveArtistUserExists(
  artistUserId: number,
  executor: Pick<ReturnType<typeof getDb>, "select"> = getDb()
): Promise<void> {
  const artistRole = alias(userRoles, "service_intake_artist_role");
  const adminRole = alias(userRoles, "service_intake_admin_role");
  const userRole = alias(userRoles, "service_intake_user_role");
  const rows = await executor
    .select({ id: users.id })
    .from(users)
    .innerJoin(
      artistRole,
      and(eq(artistRole.userId, users.id), eq(artistRole.role, "artist"))
    )
    .leftJoin(adminRole, and(eq(adminRole.userId, users.id), eq(adminRole.role, "admin")))
    .leftJoin(userRole, and(eq(userRole.userId, users.id), eq(userRole.role, "user")))
    .where(
      and(
        eq(users.id, artistUserId),
        eq(users.isActive, true),
        isNull(adminRole.id),
        isNull(userRole.id)
      )
    )
    .limit(1);

  if (!rows[0]) {
    throw new Error("Seçilen artist kullanılamıyor.");
  }
}

function mapRow(row: {
  id: number;
  customerUserId: number;
  flowType: ServiceIntakeFlowType;
  serviceType: ServiceIntakeServiceType;
  scheduledDate: string;
  scheduledTime: string;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
  appointmentId: number | null;
  artistUserId: number | null;
  createdByUserId: number;
  updatedByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}): ServiceIntakeRecord {
  return row;
}

export async function createServiceIntake(
  input: CreateServiceIntakeInput
): Promise<ServiceIntakeRecord> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    await assertCustomerUserExists(input.customerUserId, tx);
    await assertActiveArtistUserExists(input.artistUserId, tx);

    const insertedRows = await tx
      .insert(serviceIntakes)
      .values({
        customerUserId: input.customerUserId,
        flowType: input.flowType,
        serviceType: input.serviceType,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        totalAmountCents: input.totalAmountCents,
        collectedAmountCents: input.collectedAmountCents,
        notes: input.notes,
        artistUserId: input.artistUserId,
        createdByUserId: input.createdByUserId,
        updatedByUserId: input.createdByUserId,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: serviceIntakes.id,
        customerUserId: serviceIntakes.customerUserId,
        flowType: serviceIntakes.flowType,
        serviceType: serviceIntakes.serviceType,
        scheduledDate: serviceIntakes.scheduledDate,
        scheduledTime: serviceIntakes.scheduledTime,
        totalAmountCents: serviceIntakes.totalAmountCents,
        collectedAmountCents: serviceIntakes.collectedAmountCents,
        notes: serviceIntakes.notes,
        appointmentId: serviceIntakes.appointmentId,
        artistUserId: serviceIntakes.artistUserId,
        createdByUserId: serviceIntakes.createdByUserId,
        updatedByUserId: serviceIntakes.updatedByUserId,
        createdAt: serviceIntakes.createdAt,
        updatedAt: serviceIntakes.updatedAt,
      });

    const inserted = insertedRows[0];

    if (!inserted) {
      throw new Error("İşlem kaydı oluşturulamadı.");
    }

    await writeAuditLog(
      {
        actorUserId: input.createdByUserId,
        action: "service_intake.created",
        entityType: "service_intake",
        entityId: inserted.id,
        payload: {
          customerUserId: inserted.customerUserId,
          flowType: inserted.flowType,
          serviceType: inserted.serviceType,
          scheduledDate: inserted.scheduledDate,
          scheduledTime: inserted.scheduledTime,
          totalAmountCents: inserted.totalAmountCents,
          collectedAmountCents: inserted.collectedAmountCents,
          artistUserId: inserted.artistUserId,
          hasNotes: Boolean(inserted.notes),
        },
      },
      tx
    );

    await postServiceIntakeCashDelta(
      {
        serviceIntakeId: inserted.id,
        flowType: inserted.flowType,
        serviceType: inserted.serviceType,
        scheduledDate: inserted.scheduledDate,
        scheduledTime: inserted.scheduledTime,
        previousCollectedAmountCents: 0,
        nextCollectedAmountCents: inserted.collectedAmountCents,
        actorUserId: input.createdByUserId,
      },
      tx
    );

    return mapRow(inserted);
  });
}

export async function attachServiceIntakeAppointment(
  input: AttachServiceIntakeAppointmentInput
): Promise<ServiceIntakeRecord> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const updatedRows = await tx
      .update(serviceIntakes)
      .set({
        appointmentId: input.appointmentId,
        updatedByUserId: input.updatedByUserId,
        updatedAt: now,
      })
      .where(eq(serviceIntakes.id, input.serviceIntakeId))
      .returning({
        id: serviceIntakes.id,
        customerUserId: serviceIntakes.customerUserId,
        flowType: serviceIntakes.flowType,
        serviceType: serviceIntakes.serviceType,
        scheduledDate: serviceIntakes.scheduledDate,
        scheduledTime: serviceIntakes.scheduledTime,
        totalAmountCents: serviceIntakes.totalAmountCents,
        collectedAmountCents: serviceIntakes.collectedAmountCents,
        notes: serviceIntakes.notes,
        appointmentId: serviceIntakes.appointmentId,
        artistUserId: serviceIntakes.artistUserId,
        createdByUserId: serviceIntakes.createdByUserId,
        updatedByUserId: serviceIntakes.updatedByUserId,
        createdAt: serviceIntakes.createdAt,
        updatedAt: serviceIntakes.updatedAt,
      });

    const updated = updatedRows[0];

    if (!updated) {
      throw new Error("İşlem kaydı bulunamadı.");
    }

    await writeAuditLog(
      {
        actorUserId: input.updatedByUserId,
        action: "service_intake.appointment_attached",
        entityType: "service_intake",
        entityId: updated.id,
        payload: {
          appointmentId: updated.appointmentId,
        },
      },
      tx
    );

    return mapRow(updated);
  });
}

export async function updateWalkInServiceIntake(
  input: UpdateWalkInServiceIntakeInput
): Promise<UpdateWalkInServiceIntakeResult> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    await assertCustomerUserExists(input.customerUserId, tx);
    await assertActiveArtistUserExists(input.artistUserId, tx);

    const currentRows = await tx
      .select({
        id: serviceIntakes.id,
        customerUserId: serviceIntakes.customerUserId,
        collectedAmountCents: serviceIntakes.collectedAmountCents,
      })
      .from(serviceIntakes)
      .where(
        and(
          eq(serviceIntakes.id, input.serviceIntakeId),
          eq(serviceIntakes.flowType, "walk_in")
        )
      )
      .limit(1);

    const current = currentRows[0];

    if (!current) {
      throw new Error("İşlem kaydı bulunamadı.");
    }

    const updatedRows = await tx
      .update(serviceIntakes)
      .set({
        customerUserId: input.customerUserId,
        flowType: "walk_in",
        serviceType: input.serviceType,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        totalAmountCents: input.totalAmountCents,
        collectedAmountCents: input.collectedAmountCents,
        notes: input.notes,
        appointmentId: null,
        artistUserId: input.artistUserId,
        updatedByUserId: input.updatedByUserId,
        updatedAt: now,
      })
      .where(
        and(
          eq(serviceIntakes.id, input.serviceIntakeId),
          eq(serviceIntakes.flowType, "walk_in")
        )
      )
      .returning({
        id: serviceIntakes.id,
        customerUserId: serviceIntakes.customerUserId,
        flowType: serviceIntakes.flowType,
        serviceType: serviceIntakes.serviceType,
        scheduledDate: serviceIntakes.scheduledDate,
        scheduledTime: serviceIntakes.scheduledTime,
        totalAmountCents: serviceIntakes.totalAmountCents,
        collectedAmountCents: serviceIntakes.collectedAmountCents,
        notes: serviceIntakes.notes,
        appointmentId: serviceIntakes.appointmentId,
        artistUserId: serviceIntakes.artistUserId,
        createdByUserId: serviceIntakes.createdByUserId,
        updatedByUserId: serviceIntakes.updatedByUserId,
        createdAt: serviceIntakes.createdAt,
        updatedAt: serviceIntakes.updatedAt,
      });

    const updated = updatedRows[0];

    await writeAuditLog(
      {
        actorUserId: input.updatedByUserId,
        action: "service_intake.updated",
        entityType: "service_intake",
        entityId: updated.id,
        payload: {
          flowType: updated.flowType,
          customerUserId: updated.customerUserId,
          serviceType: updated.serviceType,
          scheduledDate: updated.scheduledDate,
          scheduledTime: updated.scheduledTime,
          totalAmountCents: updated.totalAmountCents,
          collectedAmountCents: updated.collectedAmountCents,
          artistUserId: updated.artistUserId,
          hasNotes: Boolean(updated.notes),
        },
      },
      tx
    );

    await postServiceIntakeCashDelta(
      {
        serviceIntakeId: updated.id,
        flowType: updated.flowType,
        serviceType: updated.serviceType,
        scheduledDate: updated.scheduledDate,
        scheduledTime: updated.scheduledTime,
        previousCollectedAmountCents: current.collectedAmountCents,
        nextCollectedAmountCents: updated.collectedAmountCents,
        actorUserId: input.updatedByUserId,
      },
      tx
    );

    return {
      serviceIntake: mapRow(updated),
      previousCustomerUserId: current.customerUserId,
    };
  });
}

export async function getLatestServiceIntakeForCustomer(
  customerUserId: number
): Promise<ServiceIntakeRecord | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: serviceIntakes.id,
      customerUserId: serviceIntakes.customerUserId,
      flowType: serviceIntakes.flowType,
      serviceType: serviceIntakes.serviceType,
      scheduledDate: serviceIntakes.scheduledDate,
      scheduledTime: serviceIntakes.scheduledTime,
      totalAmountCents: serviceIntakes.totalAmountCents,
      collectedAmountCents: serviceIntakes.collectedAmountCents,
      notes: serviceIntakes.notes,
      appointmentId: serviceIntakes.appointmentId,
      artistUserId: serviceIntakes.artistUserId,
      createdByUserId: serviceIntakes.createdByUserId,
      updatedByUserId: serviceIntakes.updatedByUserId,
      createdAt: serviceIntakes.createdAt,
      updatedAt: serviceIntakes.updatedAt,
    })
    .from(serviceIntakes)
    .where(eq(serviceIntakes.customerUserId, customerUserId))
    .orderBy(desc(serviceIntakes.createdAt), desc(serviceIntakes.id))
    .limit(1);

  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function listLatestServiceIntakesByAppointmentIds(
  appointmentIds: number[]
): Promise<ServiceIntakeSummaryRecord[]> {
  if (!appointmentIds.length) {
    return [];
  }

  const db = getDb();
  const artistUsers = alias(users, "service_intake_artist_users");
  const artistProfiles = alias(userProfiles, "service_intake_artist_profiles");
  const rows = await db
    .select({
      id: serviceIntakes.id,
      customerUserId: serviceIntakes.customerUserId,
      flowType: serviceIntakes.flowType,
      serviceType: serviceIntakes.serviceType,
      scheduledDate: serviceIntakes.scheduledDate,
      scheduledTime: serviceIntakes.scheduledTime,
      totalAmountCents: serviceIntakes.totalAmountCents,
      collectedAmountCents: serviceIntakes.collectedAmountCents,
      notes: serviceIntakes.notes,
      appointmentId: serviceIntakes.appointmentId,
      artistUserId: serviceIntakes.artistUserId,
      createdByUserId: serviceIntakes.createdByUserId,
      updatedByUserId: serviceIntakes.updatedByUserId,
      createdAt: serviceIntakes.createdAt,
      updatedAt: serviceIntakes.updatedAt,
      artistEmail: artistUsers.email,
      artistPhone: artistUsers.phone,
      artistFullName: artistProfiles.fullName,
      artistDisplayName: artistProfiles.displayName,
    })
    .from(serviceIntakes)
    .leftJoin(artistUsers, eq(artistUsers.id, serviceIntakes.artistUserId))
    .leftJoin(artistProfiles, eq(artistProfiles.userId, artistUsers.id))
    .where(inArray(serviceIntakes.appointmentId, appointmentIds))
    .orderBy(desc(serviceIntakes.createdAt), desc(serviceIntakes.id));

  const latestRowsByAppointmentId = new Map<number, ServiceIntakeSummaryRecord>();

  for (const row of rows) {
    if (row.appointmentId === null || latestRowsByAppointmentId.has(row.appointmentId)) {
      continue;
    }

    latestRowsByAppointmentId.set(row.appointmentId, {
      ...mapRow(row),
      artistName: getArtistDisplayName(row),
    });
  }

  return [...latestRowsByAppointmentId.values()];
}

export async function listWalkInServiceIntakesForMonth(
  monthValue: string
): Promise<StaffWalkInServiceIntakeRecord[]> {
  const { startDate, endDate } = getMonthBounds(monthValue);
  const db = getDb();
  const artistUsers = alias(users, "walk_in_artist_users");
  const artistProfiles = alias(userProfiles, "walk_in_artist_profiles");
  const rows = await db
    .select({
      id: serviceIntakes.id,
      customerUserId: serviceIntakes.customerUserId,
      flowType: serviceIntakes.flowType,
      serviceType: serviceIntakes.serviceType,
      scheduledDate: serviceIntakes.scheduledDate,
      scheduledTime: serviceIntakes.scheduledTime,
      totalAmountCents: serviceIntakes.totalAmountCents,
      collectedAmountCents: serviceIntakes.collectedAmountCents,
      notes: serviceIntakes.notes,
      appointmentId: serviceIntakes.appointmentId,
      artistUserId: serviceIntakes.artistUserId,
      createdByUserId: serviceIntakes.createdByUserId,
      updatedByUserId: serviceIntakes.updatedByUserId,
      createdAt: serviceIntakes.createdAt,
      updatedAt: serviceIntakes.updatedAt,
      email: users.email,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
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
    .where(
      and(
        eq(serviceIntakes.flowType, "walk_in"),
        gte(serviceIntakes.scheduledDate, startDate),
        lte(serviceIntakes.scheduledDate, endDate)
      )
    )
    .orderBy(
      asc(serviceIntakes.scheduledDate),
      asc(serviceIntakes.scheduledTime),
      asc(serviceIntakes.id)
    );

  return rows.map((row) => ({
    ...mapRow(row),
    customerName: getCustomerDisplayName(row),
    customerEmail: row.email ?? null,
    artistName: getArtistDisplayName(row),
  }));
}
