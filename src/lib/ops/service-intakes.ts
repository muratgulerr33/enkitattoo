import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  serviceIntakes,
  type ServiceIntakeFlowType,
  type ServiceIntakeServiceType,
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
