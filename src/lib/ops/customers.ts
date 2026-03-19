import {
  and,
  asc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import {
  customerNotes,
  userProfiles,
  userRoles,
  users,
} from "@/db/schema";
import { writeAuditLog } from "./audit";
import type { AppointmentRecord } from "./appointments";
import {
  getLatestServiceIntakeForCustomer,
  type ServiceIntakeRecord,
} from "./service-intakes";
import {
  getCurrentTimeValue,
  getTodayDateValue,
  listUserAppointments,
} from "./appointments";
import {
  getUserWorkspaceOverview,
  type UserWorkspaceOverview,
} from "./user-workspace";

export type CustomerUpcomingAppointment = {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
};

export type CustomerListItem = {
  userId: number;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  displayName: string | null;
  nextAppointment: CustomerUpcomingAppointment | null;
  searchMatch: CustomerSearchMatch | null;
};

export type CustomerSearchMatchField = "name" | "phone" | "email";

export type CustomerSearchMatch = {
  field: CustomerSearchMatchField;
};

export type CustomerNoteRecord = {
  id: number;
  note: string;
  updatedByUserId: number;
  updatedByName: string;
  updatedAt: Date;
};

export type CustomerDetail = {
  userId: number;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  displayName: string | null;
  note: CustomerNoteRecord | null;
  workspace: UserWorkspaceOverview;
  latestServiceIntake: ServiceIntakeRecord | null;
  upcomingAppointments: AppointmentRecord[];
  pastAppointments: AppointmentRecord[];
};

type CustomerNoteRow = {
  id: number;
  note: string;
  updatedByUserId: number;
  updatedByEmail: string | null;
  updatedByFullName: string | null;
  updatedByDisplayName: string | null;
  updatedAt: Date;
};

function getDisplayName(
  email: string | null,
  fullName: string | null,
  displayName: string | null,
  fallback: string
): string {
  return displayName ?? fullName ?? email ?? fallback;
}

export function getCustomerLabel(customer: {
  fullName: string | null;
  displayName: string | null;
  email: string | null;
}): string {
  return customer.displayName ?? customer.fullName ?? customer.email ?? "İsimsiz müşteri";
}

export function formatCustomerAppointmentShort(
  appointment: CustomerUpcomingAppointment | null
): string | null {
  if (!appointment) {
    return null;
  }

  const [year, month, day] = appointment.appointmentDate.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
  const parts = formatter.formatToParts(new Date(year, month - 1, day));
  const dayLabel = parts.find((part) => part.type === "day")?.value;
  const monthLabel = parts.find((part) => part.type === "month")?.value;
  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value;
  const dateLabel = [dayLabel, monthLabel, weekdayLabel].filter(Boolean).join(" ");

  return `${dateLabel} · ${appointment.appointmentTime}`;
}

function toCustomerNote(row: CustomerNoteRow | undefined): CustomerNoteRecord | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    note: row.note,
    updatedByUserId: row.updatedByUserId,
    updatedByName: getDisplayName(
      row.updatedByEmail,
      row.updatedByFullName,
      row.updatedByDisplayName,
      "Bilinmeyen"
    ),
    updatedAt: row.updatedAt,
  };
}

function normalizeCustomerSearchValue(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("tr-TR") ?? "";
}

function customerFieldMatches(value: string | null | undefined, query: string): boolean {
  const normalizedValue = normalizeCustomerSearchValue(value);

  if (!normalizedValue) {
    return false;
  }

  return normalizedValue.includes(normalizeCustomerSearchValue(query));
}

function getCustomerSearchMatch(
  customer: Pick<CustomerListItem, "email" | "phone" | "fullName" | "displayName">,
  query: string | null | undefined
): CustomerSearchMatch | null {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return null;
  }

  if (customerFieldMatches(customer.phone, trimmedQuery)) {
    return { field: "phone" };
  }

  if (customerFieldMatches(customer.email, trimmedQuery)) {
    return { field: "email" };
  }

  if (
    customerFieldMatches(customer.displayName, trimmedQuery) ||
    customerFieldMatches(customer.fullName, trimmedQuery)
  ) {
    return { field: "name" };
  }

  return null;
}

function isUpcomingScheduledAppointment(record: AppointmentRecord): boolean {
  if (record.status !== "scheduled") {
    return false;
  }

  const today = getTodayDateValue();

  if (record.appointmentDate > today) {
    return true;
  }

  if (record.appointmentDate < today) {
    return false;
  }

  return record.appointmentTime >= getCurrentTimeValue();
}

function sortUpcomingAppointments(
  left: CustomerUpcomingAppointment,
  right: CustomerUpcomingAppointment
): number {
  return left.appointmentDate === right.appointmentDate
    ? left.appointmentTime.localeCompare(right.appointmentTime)
    : left.appointmentDate.localeCompare(right.appointmentDate);
}

async function getNextAppointmentMap(
  customerUserIds: number[]
): Promise<Map<number, CustomerUpcomingAppointment>> {
  if (!customerUserIds.length) {
    return new Map();
  }

  const appointmentLists = await Promise.all(
    customerUserIds.map(async (customerUserId) => ({
      customerUserId,
      appointments: await listUserAppointments(customerUserId),
    }))
  );

  const nextAppointmentMap = new Map<number, CustomerUpcomingAppointment>();

  for (const item of appointmentLists) {
    const nextAppointment = item.appointments.upcoming
      .filter(isUpcomingScheduledAppointment)
      .map((appointment) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
      }))
      .sort(sortUpcomingAppointments)[0];

    if (nextAppointment) {
      nextAppointmentMap.set(item.customerUserId, nextAppointment);
    }
  }

  return nextAppointmentMap;
}

export async function listCustomers(searchQuery?: string | null): Promise<CustomerListItem[]> {
  const db = getDb();
  const query = searchQuery?.trim();
  const conditions = [eq(userRoles.role, "user"), eq(users.isActive, true)];

  if (query) {
    const pattern = `%${query}%`;
    conditions.push(
      or(
        ilike(users.email, pattern),
        ilike(users.phone, pattern),
        ilike(userProfiles.fullName, pattern),
        ilike(userProfiles.displayName, pattern)
      )!
    );
  }

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      phone: users.phone,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .innerJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.role, "user")))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(
      asc(sql`coalesce(${userProfiles.fullName}, ${userProfiles.displayName}, ${users.email}, '')`),
      asc(users.id)
    )
    .limit(60);

  const nextAppointmentMap = await getNextAppointmentMap(rows.map((row) => row.userId));

  return rows.map((row) => ({
    userId: row.userId,
    email: row.email,
    phone: row.phone,
    fullName: row.fullName,
    displayName: row.displayName,
    nextAppointment: nextAppointmentMap.get(row.userId) ?? null,
    searchMatch: getCustomerSearchMatch(row, query),
  }));
}

export type CreateCustomerRecordInput = {
  email: string | null;
  passwordHash: string | null;
  phone: string;
  fullName: string;
  displayName?: string | null;
};

export async function createCustomerRecord(
  input: CreateCustomerRecordInput
): Promise<{
  userId: number;
  email: string | null;
  phone: string;
  fullName: string;
  displayName: string | null;
}> {
  const db = getDb();
  const now = new Date();

  const createdCustomer = await db.transaction(async (tx) => {
    const insertedUsers = await tx
      .insert(users)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        phone: input.phone,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        userId: users.id,
        email: users.email,
        phone: users.phone,
      });

    const user = insertedUsers[0];

    if (!user) {
      throw new Error("Müşteri oluşturulamadı.");
    }

    await tx.insert(userProfiles).values({
      userId: user.userId,
      fullName: input.fullName,
      displayName: input.displayName ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(userRoles).values({
      userId: user.userId,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    return user;
  });

  return {
    userId: createdCustomer.userId,
    email: createdCustomer.email,
    phone: createdCustomer.phone ?? input.phone,
    fullName: input.fullName,
    displayName: input.displayName ?? null,
  };
}

export async function getCustomerDetail(userId: number): Promise<CustomerDetail | null> {
  const db = getDb();
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      phone: users.phone,
      fullName: userProfiles.fullName,
      displayName: userProfiles.displayName,
    })
    .from(users)
    .innerJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.role, "user")))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  const customer = rows[0];

  if (!customer) {
    return null;
  }

  const [workspace, appointmentsList, note, latestServiceIntake] = await Promise.all([
    getUserWorkspaceOverview(userId),
    listUserAppointments(userId),
    getCustomerNote(userId),
    getLatestServiceIntakeForCustomer(userId),
  ]);

  return {
    ...customer,
    note,
    workspace,
    latestServiceIntake,
    upcomingAppointments: appointmentsList.upcoming,
    pastAppointments: appointmentsList.past,
  };
}

export async function getCustomerNote(userId: number): Promise<CustomerNoteRecord | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: customerNotes.id,
      note: customerNotes.note,
      updatedByUserId: customerNotes.updatedByUserId,
      updatedByEmail: users.email,
      updatedByFullName: userProfiles.fullName,
      updatedByDisplayName: userProfiles.displayName,
      updatedAt: customerNotes.updatedAt,
    })
    .from(customerNotes)
    .innerJoin(users, eq(users.id, customerNotes.updatedByUserId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(customerNotes.userId, userId))
    .limit(1);

  return toCustomerNote(rows[0]);
}

async function assertCustomerExists(
  userId: number,
  executor: Pick<ReturnType<typeof getDb>, "select"> = getDb()
): Promise<void> {
  const rows = await executor
    .select({ id: users.id })
    .from(users)
    .innerJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.role, "user")))
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (!rows[0]) {
    throw new Error("Müşteri bulunamadı.");
  }
}

export async function saveCustomerNote(
  userId: number,
  note: string | null,
  actorUserId: number
): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.transaction(async (tx) => {
    await assertCustomerExists(userId, tx);

    const currentRows = await tx
      .select({
        id: customerNotes.id,
        note: customerNotes.note,
      })
      .from(customerNotes)
      .where(eq(customerNotes.userId, userId))
      .limit(1);

    const current = currentRows[0] ?? null;

    if (!note) {
      await tx.delete(customerNotes).where(eq(customerNotes.userId, userId));

      if (!current) {
        return;
      }

      await writeAuditLog(
        {
          actorUserId,
          action: "customer_note.saved",
          entityType: "customer_note",
          entityId: userId,
          payload: {
            cleared: true,
            hadExistingNote: Boolean(current),
          },
        },
        tx
      );

      return;
    }

    await tx
      .insert(customerNotes)
      .values({
        userId,
        note,
        updatedByUserId: actorUserId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: customerNotes.userId,
        set: {
          note,
          updatedByUserId: actorUserId,
          updatedAt: now,
        },
      });

    await writeAuditLog(
      {
        actorUserId,
        action: "customer_note.saved",
        entityType: "customer_note",
        entityId: userId,
        payload: {
          notePresent: true,
          noteLength: note.length,
          replacedExistingNote: Boolean(current),
        },
      },
      tx
    );
  });
}

export function parseCustomerUserId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
