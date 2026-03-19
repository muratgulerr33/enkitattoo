import {
  type SQL,
  and,
  asc,
  eq,
  gte,
  inArray,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import {
  appointments,
  type AppointmentSource,
  type AppointmentStatus,
  serviceIntakes,
  type ServiceIntakeServiceType,
  userProfiles,
  userRoles,
  users,
} from "@/db/schema";
import type { UserRole } from "@/db/schema/users";
import { writeAuditLog } from "./audit";
import {
  hasActiveCashEntriesForServiceIntakeIds,
  postServiceIntakeCashDelta,
} from "./cashbook";
export const APPOINTMENT_SLOT_CONFLICT_MESSAGE =
  "Aynı tarih ve saat için başka bir randevu zaten kayıtlı.";
export const APPOINTMENT_DELETE_WITH_CASH_ENTRIES_MESSAGE =
  "Tahsilat izi olan randevu silinemez. Önce kasa düzeltmesini çözün.";

export type AppointmentRecord = {
  id: number;
  customerUserId: number;
  customerName: string;
  customerEmail: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  createdByUserId: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AppointmentCustomerOption = {
  id: number;
  label: string;
  email: string | null;
};

export type AppointmentSummary = {
  totalCount: number;
  scheduledCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
};

export type CreateAppointmentInput = {
  customerUserId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes: string | null;
  source: AppointmentSource;
  createdByUserId: number;
};

export type UpdateAppointmentInput = {
  appointmentId: number;
  customerUserId: number;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: ServiceIntakeServiceType;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
  actorUserId: number;
};

export type UpdateAppointmentResult = {
  appointment: AppointmentRecord;
  previousCustomerUserId: number;
};

export type UpdateAppointmentStatusInput = {
  appointmentId: number;
  status: AppointmentStatus;
  actorUserId: number;
};

export type DeleteAppointmentInput = {
  appointmentId: number;
  actorUserId: number;
};

export type DeleteAppointmentResult = {
  appointmentId: number;
  customerUserId: number;
  deletedAppointmentServiceIntakeCount: number;
  detachedServiceIntakeCount: number;
};

type AppointmentRow = {
  id: number;
  customerUserId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  createdByUserId: number;
  createdAt: Date;
  updatedAt: Date;
};

type UserPresentation = {
  id: number;
  email: string | null;
  fullName: string | null;
  displayName: string | null;
};

function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getTodayDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
}

export function getCurrentTimeValue(): string {
  const now = new Date();
  return `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
}

export function isValidMonthValue(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

export function isValidDateValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function parseMonthValue(value?: string | null): string {
  if (value && isValidMonthValue(value)) {
    return value;
  }

  return getTodayDateValue().slice(0, 7);
}

export function buildDateValue(year: number, monthIndex: number, day: number): string {
  return `${year}-${padNumber(monthIndex + 1)}-${padNumber(day)}`;
}

export function getMonthBounds(monthValue: string): {
  monthValue: string;
  year: number;
  monthIndex: number;
  startDate: string;
  endDate: string;
  daysInMonth: number;
} {
  const [yearValue, monthPart] = parseMonthValue(monthValue).split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthPart) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return {
    monthValue: `${yearValue}-${monthPart}`,
    year,
    monthIndex,
    startDate: buildDateValue(year, monthIndex, 1),
    endDate: buildDateValue(year, monthIndex, daysInMonth),
    daysInMonth,
  };
}

export function getMonthLabel(monthValue: string): string {
  const { year, monthIndex } = getMonthBounds(monthValue);
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

export function shiftMonthValue(monthValue: string, offset: number): string {
  const { year, monthIndex } = getMonthBounds(monthValue);
  const next = new Date(year, monthIndex + offset, 1);

  return `${next.getFullYear()}-${padNumber(next.getMonth() + 1)}`;
}

export function formatAppointmentDateLong(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function isDateInMonth(dateValue: string, monthValue: string): boolean {
  return dateValue.startsWith(`${parseMonthValue(monthValue)}-`);
}

export function getDefaultSelectedDay(monthValue: string, dayValue?: string | null): string {
  if (dayValue && isValidDateValue(dayValue) && isDateInMonth(dayValue, monthValue)) {
    return dayValue;
  }

  const today = getTodayDateValue();

  if (isDateInMonth(today, monthValue)) {
    return today;
  }

  const { year, monthIndex } = getMonthBounds(monthValue);
  return buildDateValue(year, monthIndex, 1);
}

export function buildMonthCalendar(
  monthValue: string,
  countsByDate: Map<string, number>,
  selectedDate: string
): Array<
  | {
      kind: "empty";
      key: string;
    }
  | {
      kind: "day";
      key: string;
      date: string;
      dayNumber: number;
      count: number;
      isSelected: boolean;
      isToday: boolean;
    }
> {
  const { year, monthIndex, daysInMonth } = getMonthBounds(monthValue);
  const firstDayWeekIndex = new Date(year, monthIndex, 1).getDay();
  const leadingEmptyCount = (firstDayWeekIndex + 6) % 7;
  const cells: Array<
    | {
        kind: "empty";
        key: string;
      }
    | {
        kind: "day";
        key: string;
        date: string;
        dayNumber: number;
        count: number;
        isSelected: boolean;
        isToday: boolean;
      }
  > = [];

  for (let index = 0; index < leadingEmptyCount; index += 1) {
    cells.push({
      kind: "empty",
      key: `empty-${index}`,
    });
  }

  const today = getTodayDateValue();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = buildDateValue(year, monthIndex, day);
    cells.push({
      kind: "day",
      key: date,
      date,
      dayNumber: day,
      count: countsByDate.get(date) ?? 0,
      isSelected: date === selectedDate,
      isToday: date === today,
    });
  }

  return cells;
}

function getDisplayName(user: UserPresentation | undefined, fallback: string): string {
  if (!user) {
    return fallback;
  }

  return user.displayName ?? user.fullName ?? user.email ?? fallback;
}

async function getUserPresentationMap(userIds: number[]): Promise<Map<number, UserPresentation>> {
  if (!userIds.length) {
    return new Map();
  }

  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(inArray(users.id, [...new Set(userIds)]));

  return new Map(rows.map((row) => [row.id, row]));
}

function toAppointmentRecord(
  row: AppointmentRow,
  presentations: Map<number, UserPresentation>
): AppointmentRecord {
  const customer = presentations.get(row.customerUserId);
  const creator = presentations.get(row.createdByUserId);

  return {
    ...row,
    customerName: getDisplayName(customer, `Kullanıcı #${row.customerUserId}`),
    customerEmail: customer?.email ?? null,
    createdByName: getDisplayName(creator, `Kullanıcı #${row.createdByUserId}`),
  };
}

async function loadAppointmentRecords(whereClause?: SQL<unknown>): Promise<AppointmentRecord[]> {
  const db = getDb();
  const query = db
    .select({
      id: appointments.id,
      customerUserId: appointments.customerUserId,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      source: appointments.source,
      notes: appointments.notes,
      createdByUserId: appointments.createdByUserId,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
    })
    .from(appointments)
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime), asc(appointments.id));

  const rows = whereClause ? await query.where(whereClause) : await query;
  const ids = rows.flatMap((row) => [row.customerUserId, row.createdByUserId]);
  const presentations = await getUserPresentationMap(ids);

  return rows.map((row) => toAppointmentRecord(row, presentations));
}

async function findAppointmentRowById(appointmentId: number): Promise<AppointmentRow> {
  const db = getDb();
  const rows = await db
    .select({
      id: appointments.id,
      customerUserId: appointments.customerUserId,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      source: appointments.source,
      notes: appointments.notes,
      createdByUserId: appointments.createdByUserId,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
    })
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  const record = rows[0];

  if (!record) {
    throw new Error("Randevu bulunamadı.");
  }

  return record;
}

function normalizeNotes(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > 1200) {
    throw new Error("Not alanı çok uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function assertDateValue(value: string): string {
  const normalized = value.trim();

  if (!isValidDateValue(normalized)) {
    throw new Error("Geçerli bir tarih seçin.");
  }

  return normalized;
}

function assertTimeValue(value: string): string {
  const normalized = value.trim();

  if (!isValidTimeValue(normalized)) {
    throw new Error("Geçerli bir saat seçin.");
  }

  return normalized;
}

async function ensureCustomerUser(userId: number): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
    })
    .from(users)
    .innerJoin(
      userRoles,
      and(eq(userRoles.userId, users.id), eq(userRoles.role, "user"))
    )
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (!rows[0]) {
    throw new Error("Seçilen müşteri kullanılamıyor.");
  }
}

async function assertAvailableScheduledSlot(
  appointmentDate: string,
  appointmentTime: string,
  excludeAppointmentId?: number
): Promise<void> {
  const db = getDb();
  const conditions = [
    eq(appointments.appointmentDate, appointmentDate),
    eq(appointments.appointmentTime, appointmentTime),
    eq(appointments.status, "scheduled"),
  ];

  if (excludeAppointmentId) {
    conditions.push(ne(appointments.id, excludeAppointmentId));
  }

  const rows = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(...conditions))
    .limit(1);

  if (rows[0]) {
    throw new Error(APPOINTMENT_SLOT_CONFLICT_MESSAGE);
  }
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export function getSourceForStaffRoles(roles: UserRole[]): AppointmentSource {
  return roles.includes("admin") ? "admin" : "artist";
}

export async function listCustomerOptions(): Promise<AppointmentCustomerOption[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .innerJoin(
      userRoles,
      and(eq(userRoles.userId, users.id), eq(userRoles.role, "user"))
    )
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.isActive, true))
    .orderBy(
      asc(sql`coalesce(${userProfiles.displayName}, ${userProfiles.fullName}, ${users.email}, '')`),
      asc(users.id)
    );

  return rows.map((row) => ({
    id: row.id,
    label: row.displayName ?? row.fullName ?? row.email ?? `Kullanıcı #${row.id}`,
    email: row.email ?? null,
  }));
}

export async function listAppointmentsForMonth(monthValue: string): Promise<AppointmentRecord[]> {
  const { startDate, endDate } = getMonthBounds(monthValue);

  return loadAppointmentRecords(
    and(
      gte(appointments.appointmentDate, startDate),
      lte(appointments.appointmentDate, endDate)
    )
  );
}

export async function listAppointmentsForDay(dayValue: string): Promise<AppointmentRecord[]> {
  return loadAppointmentRecords(eq(appointments.appointmentDate, assertDateValue(dayValue)));
}

export async function listAppointmentsForDateRange(
  startDateValue: string,
  endDateValue: string
): Promise<AppointmentRecord[]> {
  const startDate = assertDateValue(startDateValue);
  const endDate = assertDateValue(endDateValue);

  if (startDate > endDate) {
    throw new Error("Tarih aralığı geçerli değil.");
  }

  return loadAppointmentRecords(
    and(
      gte(appointments.appointmentDate, startDate),
      lte(appointments.appointmentDate, endDate)
    )
  );
}

export async function listAllAppointments(): Promise<AppointmentRecord[]> {
  return loadAppointmentRecords();
}

export function summarizeAppointments(records: AppointmentRecord[]): AppointmentSummary {
  let scheduledCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;

  for (const record of records) {
    if (record.status === "scheduled") {
      scheduledCount += 1;
      continue;
    }

    if (record.status === "completed") {
      completedCount += 1;
      continue;
    }

    if (record.status === "cancelled") {
      cancelledCount += 1;
      continue;
    }

    noShowCount += 1;
  }

  return {
    totalCount: records.length,
    scheduledCount,
    completedCount,
    cancelledCount,
    noShowCount,
  };
}

export async function listUserAppointments(customerUserId: number): Promise<{
  upcoming: AppointmentRecord[];
  past: AppointmentRecord[];
}> {
  const records = await loadAppointmentRecords(eq(appointments.customerUserId, customerUserId));
  const today = getTodayDateValue();
  const currentTime = getCurrentTimeValue();

  const upcoming = records.filter((record) => {
    if (record.status !== "scheduled") {
      return false;
    }

    if (record.appointmentDate > today) {
      return true;
    }

    if (record.appointmentDate < today) {
      return false;
    }

    return record.appointmentTime >= currentTime;
  });

  const past = records
    .filter((record) => !upcoming.some((upcomingRecord) => upcomingRecord.id === record.id))
    .sort((left, right) =>
      left.appointmentDate === right.appointmentDate
        ? right.appointmentTime.localeCompare(left.appointmentTime)
        : right.appointmentDate.localeCompare(left.appointmentDate)
    );

  return {
    upcoming,
    past,
  };
}

export async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentRecord> {
  const appointmentDate = assertDateValue(input.appointmentDate);
  const appointmentTime = assertTimeValue(input.appointmentTime);
  const notes = normalizeNotes(input.notes);
  await ensureCustomerUser(input.customerUserId);
  await assertAvailableScheduledSlot(appointmentDate, appointmentTime);

  const db = getDb();
  const now = new Date();

  try {
    const inserted = await db.transaction(async (tx) => {
      const insertedRows = await tx
        .insert(appointments)
        .values({
          customerUserId: input.customerUserId,
          appointmentDate,
          appointmentTime,
          status: "scheduled",
          source: input.source,
          notes,
          createdByUserId: input.createdByUserId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: appointments.id,
          customerUserId: appointments.customerUserId,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          status: appointments.status,
          source: appointments.source,
          notes: appointments.notes,
          createdByUserId: appointments.createdByUserId,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
        });

      const insertedRecord = insertedRows[0];

      if (!insertedRecord) {
        throw new Error("Randevu kaydedilemedi.");
      }

      await writeAuditLog(
        {
          actorUserId: input.createdByUserId,
          action: "appointment.created",
          entityType: "appointment",
          entityId: insertedRecord.id,
          payload: {
            customerUserId: insertedRecord.customerUserId,
            appointmentDate: insertedRecord.appointmentDate,
            appointmentTime: insertedRecord.appointmentTime,
            source: insertedRecord.source,
            hasNotes: Boolean(insertedRecord.notes),
          },
        },
        tx
      );

      return insertedRecord;
    });

    const presentations = await getUserPresentationMap([
      inserted.customerUserId,
      inserted.createdByUserId,
    ]);

    return toAppointmentRecord(inserted, presentations);
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new Error(APPOINTMENT_SLOT_CONFLICT_MESSAGE);
    }

    throw error;
  }
}

export async function updateAppointment(
  input: UpdateAppointmentInput
): Promise<UpdateAppointmentResult> {
  const current = await findAppointmentRowById(input.appointmentId);
  const customerUserId = input.customerUserId;
  const appointmentDate = assertDateValue(input.appointmentDate);
  const appointmentTime = assertTimeValue(input.appointmentTime);
  const notes = normalizeNotes(input.notes);

  await ensureCustomerUser(customerUserId);

  if (current.status === "scheduled") {
    await assertAvailableScheduledSlot(appointmentDate, appointmentTime, current.id);
  }

  try {
    const db = getDb();
    const updated = await db.transaction(async (tx) => {
      const now = new Date();
      const currentLinkedServiceIntakes = await tx
        .select({
          id: serviceIntakes.id,
          collectedAmountCents: serviceIntakes.collectedAmountCents,
        })
        .from(serviceIntakes)
        .where(
          and(
            eq(serviceIntakes.appointmentId, input.appointmentId),
            eq(serviceIntakes.flowType, "appointment")
          )
        );
      const previousCollectedByServiceIntakeId = new Map(
        currentLinkedServiceIntakes.map((serviceIntake) => [
          serviceIntake.id,
          serviceIntake.collectedAmountCents,
        ])
      );
      const updatedRows = await tx
        .update(appointments)
        .set({
          customerUserId,
          appointmentDate,
          appointmentTime,
          notes,
          updatedAt: now,
        })
        .where(eq(appointments.id, input.appointmentId))
        .returning({
          id: appointments.id,
          customerUserId: appointments.customerUserId,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          status: appointments.status,
          source: appointments.source,
          notes: appointments.notes,
          createdByUserId: appointments.createdByUserId,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
        });

      const updatedRecord = updatedRows[0];

      if (!updatedRecord) {
        throw new Error("Randevu güncellenemedi.");
      }

      const syncedServiceIntakes = await tx
        .update(serviceIntakes)
        .set({
          customerUserId,
          serviceType: input.serviceType,
          scheduledDate: appointmentDate,
          scheduledTime: appointmentTime,
          totalAmountCents: input.totalAmountCents,
          collectedAmountCents: input.collectedAmountCents,
          notes,
          updatedByUserId: input.actorUserId,
          updatedAt: now,
        })
        .where(
          and(
            eq(serviceIntakes.appointmentId, input.appointmentId),
            eq(serviceIntakes.flowType, "appointment")
          )
        )
        .returning({
          id: serviceIntakes.id,
          flowType: serviceIntakes.flowType,
          serviceType: serviceIntakes.serviceType,
          scheduledDate: serviceIntakes.scheduledDate,
          scheduledTime: serviceIntakes.scheduledTime,
          collectedAmountCents: serviceIntakes.collectedAmountCents,
        });

      for (const serviceIntake of syncedServiceIntakes) {
        await writeAuditLog(
          {
            actorUserId: input.actorUserId,
            action: "service_intake.appointment_synced",
            entityType: "service_intake",
            entityId: serviceIntake.id,
            payload: {
              appointmentId: input.appointmentId,
              customerUserId,
              serviceType: input.serviceType,
              scheduledDate: appointmentDate,
              scheduledTime: appointmentTime,
              totalAmountCents: input.totalAmountCents,
              collectedAmountCents: input.collectedAmountCents,
              hasNotes: Boolean(notes),
            },
          },
          tx
        );

        await postServiceIntakeCashDelta(
          {
            serviceIntakeId: serviceIntake.id,
            flowType: serviceIntake.flowType,
            serviceType: serviceIntake.serviceType,
            scheduledDate: serviceIntake.scheduledDate,
            scheduledTime: serviceIntake.scheduledTime,
            previousCollectedAmountCents:
              previousCollectedByServiceIntakeId.get(serviceIntake.id) ?? 0,
            nextCollectedAmountCents: serviceIntake.collectedAmountCents,
            actorUserId: input.actorUserId,
          },
          tx
        );
      }

      await writeAuditLog(
        {
          actorUserId: input.actorUserId,
          action: "appointment.updated",
          entityType: "appointment",
          entityId: updatedRecord.id,
          payload: {
            previousCustomerUserId: current.customerUserId,
            nextCustomerUserId: updatedRecord.customerUserId,
            previousAppointmentDate: current.appointmentDate,
            nextAppointmentDate: updatedRecord.appointmentDate,
            previousAppointmentTime: current.appointmentTime,
            nextAppointmentTime: updatedRecord.appointmentTime,
            previousHasNotes: Boolean(current.notes),
            nextHasNotes: Boolean(updatedRecord.notes),
          },
        },
        tx
      );

      return updatedRecord;
    });

    const presentations = await getUserPresentationMap([
      updated.customerUserId,
      updated.createdByUserId,
    ]);

    return {
      appointment: toAppointmentRecord(updated, presentations),
      previousCustomerUserId: current.customerUserId,
    };
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new Error(APPOINTMENT_SLOT_CONFLICT_MESSAGE);
    }

    throw error;
  }
}

export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput
): Promise<AppointmentRecord> {
  const db = getDb();
  const current = await findAppointmentRowById(input.appointmentId);

  if (input.status === "scheduled") {
    await assertAvailableScheduledSlot(
      current.appointmentDate,
      current.appointmentTime,
      current.id
    );
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const updatedRows = await tx
        .update(appointments)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, input.appointmentId))
        .returning({
          id: appointments.id,
          customerUserId: appointments.customerUserId,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          status: appointments.status,
          source: appointments.source,
          notes: appointments.notes,
          createdByUserId: appointments.createdByUserId,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
        });

      const updatedRecord = updatedRows[0];

      if (!updatedRecord) {
        throw new Error("Randevu durumu güncellenemedi.");
      }

      await writeAuditLog(
        {
          actorUserId: input.actorUserId,
          action: "appointment.status_updated",
          entityType: "appointment",
          entityId: updatedRecord.id,
          payload: {
            previousStatus: current.status,
            nextStatus: updatedRecord.status,
            appointmentDate: updatedRecord.appointmentDate,
            appointmentTime: updatedRecord.appointmentTime,
            customerUserId: updatedRecord.customerUserId,
          },
        },
        tx
      );

      return updatedRecord;
    });

    const presentations = await getUserPresentationMap([
      updated.customerUserId,
      updated.createdByUserId,
    ]);

    return toAppointmentRecord(updated, presentations);
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new Error(APPOINTMENT_SLOT_CONFLICT_MESSAGE);
    }

    throw error;
  }
}

export async function deleteAppointment(
  input: DeleteAppointmentInput
): Promise<DeleteAppointmentResult> {
  const db = getDb();
  const current = await findAppointmentRowById(input.appointmentId);

  return db.transaction(async (tx) => {
    const now = new Date();
    const linkedServiceIntakeRows = await tx
      .select({
        id: serviceIntakes.id,
        flowType: serviceIntakes.flowType,
      })
      .from(serviceIntakes)
      .where(eq(serviceIntakes.appointmentId, input.appointmentId));

    const appointmentServiceIntakeIds = linkedServiceIntakeRows
      .filter((serviceIntake) => serviceIntake.flowType === "appointment")
      .map((serviceIntake) => serviceIntake.id);
    const detachedServiceIntakeIds = linkedServiceIntakeRows
      .filter((serviceIntake) => serviceIntake.flowType !== "appointment")
      .map((serviceIntake) => serviceIntake.id);

    if (
      appointmentServiceIntakeIds.length &&
      (await hasActiveCashEntriesForServiceIntakeIds(appointmentServiceIntakeIds, tx))
    ) {
      throw new Error(APPOINTMENT_DELETE_WITH_CASH_ENTRIES_MESSAGE);
    }

    const deletedServiceIntakes = appointmentServiceIntakeIds.length
      ? await tx
          .delete(serviceIntakes)
          .where(inArray(serviceIntakes.id, appointmentServiceIntakeIds))
          .returning({
            id: serviceIntakes.id,
          })
      : [];

    const detachedServiceIntakes = detachedServiceIntakeIds.length
      ? await tx
          .update(serviceIntakes)
          .set({
            appointmentId: null,
            updatedByUserId: input.actorUserId,
            updatedAt: now,
          })
          .where(inArray(serviceIntakes.id, detachedServiceIntakeIds))
          .returning({
            id: serviceIntakes.id,
          })
      : [];

    const deletedRows = await tx
      .delete(appointments)
      .where(eq(appointments.id, input.appointmentId))
      .returning({
        id: appointments.id,
        customerUserId: appointments.customerUserId,
      });

    const deletedAppointment = deletedRows[0];

    if (!deletedAppointment) {
      throw new Error("Randevu bulunamadı.");
    }

    for (const serviceIntake of deletedServiceIntakes) {
      await writeAuditLog(
        {
          actorUserId: input.actorUserId,
          action: "service_intake.deleted",
          entityType: "service_intake",
          entityId: serviceIntake.id,
          payload: {
            appointmentId: input.appointmentId,
            reason: "appointment_deleted",
          },
        },
        tx
      );
    }

    for (const serviceIntake of detachedServiceIntakes) {
      await writeAuditLog(
        {
          actorUserId: input.actorUserId,
          action: "service_intake.appointment_detached",
          entityType: "service_intake",
          entityId: serviceIntake.id,
          payload: {
            previousAppointmentId: input.appointmentId,
            reason: "appointment_deleted",
          },
        },
        tx
      );
    }

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "appointment.deleted",
        entityType: "appointment",
        entityId: deletedAppointment.id,
        payload: {
          customerUserId: current.customerUserId,
          appointmentDate: current.appointmentDate,
          appointmentTime: current.appointmentTime,
          status: current.status,
          deletedAppointmentServiceIntakeCount: deletedServiceIntakes.length,
          detachedServiceIntakeCount: detachedServiceIntakes.length,
        },
      },
      tx
    );

    return {
      appointmentId: deletedAppointment.id,
      customerUserId: deletedAppointment.customerUserId,
      deletedAppointmentServiceIntakeCount: deletedServiceIntakes.length,
      detachedServiceIntakeCount: detachedServiceIntakes.length,
    };
  });
}
