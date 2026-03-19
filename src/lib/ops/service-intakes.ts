import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { getDb } from "@/db";
import {
  serviceIntakes,
  type ServiceIntakeFlowType,
  type ServiceIntakeServiceType,
  userProfiles,
  userRoles,
  users,
} from "@/db/schema";
import { writeAuditLog } from "./audit";

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
  updatedByUserId: number;
};

export type StaffWalkInServiceIntakeRecord = ServiceIntakeRecord & {
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
          hasNotes: Boolean(inserted.notes),
        },
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

    const currentRows = await tx
      .select({
        id: serviceIntakes.id,
        customerUserId: serviceIntakes.customerUserId,
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
          hasNotes: Boolean(updated.notes),
        },
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
): Promise<ServiceIntakeRecord[]> {
  if (!appointmentIds.length) {
    return [];
  }

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
      createdByUserId: serviceIntakes.createdByUserId,
      updatedByUserId: serviceIntakes.updatedByUserId,
      createdAt: serviceIntakes.createdAt,
      updatedAt: serviceIntakes.updatedAt,
    })
    .from(serviceIntakes)
    .where(inArray(serviceIntakes.appointmentId, appointmentIds))
    .orderBy(desc(serviceIntakes.createdAt), desc(serviceIntakes.id));

  const latestRowsByAppointmentId = new Map<number, ServiceIntakeRecord>();

  for (const row of rows) {
    if (row.appointmentId === null || latestRowsByAppointmentId.has(row.appointmentId)) {
      continue;
    }

    latestRowsByAppointmentId.set(row.appointmentId, mapRow(row));
  }

  return [...latestRowsByAppointmentId.values()];
}

export async function listWalkInServiceIntakesForMonth(
  monthValue: string
): Promise<StaffWalkInServiceIntakeRecord[]> {
  const { startDate, endDate } = getMonthBounds(monthValue);
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
      createdByUserId: serviceIntakes.createdByUserId,
      updatedByUserId: serviceIntakes.updatedByUserId,
      createdAt: serviceIntakes.createdAt,
      updatedAt: serviceIntakes.updatedAt,
      email: users.email,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(serviceIntakes)
    .innerJoin(users, eq(users.id, serviceIntakes.customerUserId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
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
  }));
}
