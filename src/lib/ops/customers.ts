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
  consentAcceptances,
  customerNotes,
  tattooForms,
  userProfiles,
  userRoles,
  users,
} from "@/db/schema";
import type { AppointmentRecord } from "./appointments";
import {
  formatAppointmentDateLong,
  getCurrentTimeValue,
  getTodayDateValue,
  listUserAppointments,
} from "./appointments";
import {
  getUserWorkspaceOverview,
  OPS_TATTOO_CONSENT_VERSION,
  type UserWorkspaceOverview,
} from "./user-workspace";

export type CustomerFormStatus = "none" | "draft" | "submitted";
export type CustomerConsentStatus = "none" | "accepted";

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
  formStatus: CustomerFormStatus;
  consentStatus: CustomerConsentStatus;
  nextAppointment: CustomerUpcomingAppointment | null;
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
  return customer.displayName ?? customer.fullName ?? customer.email ?? "Isimsiz musteri";
}

export function formatCustomerAppointmentShort(
  appointment: CustomerUpcomingAppointment | null
): string | null {
  if (!appointment) {
    return null;
  }

  return `${formatAppointmentDateLong(appointment.appointmentDate)} · ${appointment.appointmentTime}`;
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

function getFormStatus(status: "draft" | "submitted" | null | undefined): CustomerFormStatus {
  if (status === "draft" || status === "submitted") {
    return status;
  }

  return "none";
}

function getConsentStatus(hasAcceptedConsent: boolean): CustomerConsentStatus {
  return hasAcceptedConsent ? "accepted" : "none";
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
      formStatus: sql<"draft" | "submitted" | null>`(
        select ${tattooForms.status}
        from ${tattooForms}
        where ${tattooForms.userId} = ${users.id}
          and ${tattooForms.isCurrent} = true
        order by ${tattooForms.snapshotVersion} desc
        limit 1
      )`,
      hasAcceptedConsent: sql<boolean>`exists(
        select 1
        from ${consentAcceptances}
        where ${consentAcceptances.userId} = ${users.id}
          and ${consentAcceptances.documentType} = 'tattoo_form_consent'
          and ${consentAcceptances.documentVersion} = ${OPS_TATTOO_CONSENT_VERSION}
          and ${consentAcceptances.accepted} = true
      )`,
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
    formStatus: getFormStatus(row.formStatus),
    consentStatus: getConsentStatus(Boolean(row.hasAcceptedConsent)),
    nextAppointment: nextAppointmentMap.get(row.userId) ?? null,
  }));
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

  const [workspace, appointmentsList, note] = await Promise.all([
    getUserWorkspaceOverview(userId),
    listUserAppointments(userId),
    getCustomerNote(userId),
  ]);

  return {
    ...customer,
    note,
    workspace,
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

export async function saveCustomerNote(
  userId: number,
  note: string | null,
  actorUserId: number
): Promise<CustomerNoteRecord | null> {
  const db = getDb();
  const now = new Date();
  const customer = await getCustomerDetail(userId);

  if (!customer) {
    throw new Error("Musteri bulunamadi.");
  }

  if (!note) {
    await db.delete(customerNotes).where(eq(customerNotes.userId, userId));
    return null;
  }

  await db
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

  return getCustomerNote(userId);
}

export function parseCustomerUserId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
