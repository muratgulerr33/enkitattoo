import { and, desc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import {
  cashEntries,
  type CashEntryPaymentMethod,
  type CashEntryType,
  userProfiles,
  users,
  type UserRole,
} from "@/db/schema";
import { writeAuditLog } from "./audit";

export const CASHBOOK_DATE_LOCK_MESSAGE =
  "Artist yalnız bugün için kasa kaydı açabilir.";

export type CashEntryRecord = {
  id: number;
  entryDate: string;
  entryType: CashEntryType;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  createdByUserId: number;
  createdByName: string;
  updatedByUserId: number | null;
  updatedByName: string | null;
  deletedAt: Date | null;
  deletedByUserId: number | null;
  deletedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CashEntrySummary = {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
  entryCount: number;
  paymentMethodTotals: Record<CashEntryPaymentMethod, number>;
};

export type CreateCashEntryInput = {
  entryDate: string;
  entryType: CashEntryType;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  actorUserId: number;
};

export type UpdateCashEntryInput = {
  entryId: number;
  entryDate: string;
  entryType: CashEntryType;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  actorUserId: number;
};

export type SoftDeleteCashEntryInput = {
  entryId: number;
  actorUserId: number;
};

export type CashbookSnapshot = {
  selectedDate: string;
  todayDate: string;
  canManageHistory: boolean;
  entries: CashEntryRecord[];
  selectedSummary: CashEntrySummary;
  todaySummary: CashEntrySummary;
};

type CashEntryRow = {
  id: number;
  entryDate: string;
  entryType: CashEntryType;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  createdByUserId: number;
  createdByEmail: string | null;
  createdByFullName: string | null;
  createdByDisplayName: string | null;
  updatedByUserId: number | null;
  updatedByEmail: string | null;
  updatedByFullName: string | null;
  updatedByDisplayName: string | null;
  deletedAt: Date | null;
  deletedByUserId: number | null;
  deletedByEmail: string | null;
  deletedByFullName: string | null;
  deletedByDisplayName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CashEntryMutationRecord = {
  id: number;
  entryDate: string;
  entryType: CashEntryType;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
};

type CashEntryLookupExecutor = Pick<ReturnType<typeof getDb>, "select">;

function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getTodayCashDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
}

export function isValidCashDateValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function assertCashDateValue(value: string): string {
  if (!isValidCashDateValue(value)) {
    throw new Error("Tarih geçerli değil.");
  }

  return value;
}

export function isAdminCashUser(roles: UserRole[]): boolean {
  return roles.includes("admin");
}

export function canManageCashHistory(roles: UserRole[]): boolean {
  return isAdminCashUser(roles);
}

export function resolveCashbookDate(roles: UserRole[], requestedDate?: string | null): string {
  const today = getTodayCashDateValue();

  if (!canManageCashHistory(roles)) {
    return today;
  }

  if (requestedDate && isValidCashDateValue(requestedDate)) {
    return requestedDate;
  }

  return today;
}

function getDisplayName(
  email: string | null,
  fullName: string | null,
  displayName: string | null,
  fallback: string
): string {
  return displayName ?? fullName ?? email ?? fallback;
}

function toCashEntryRecord(row: CashEntryRow): CashEntryRecord {
  return {
    id: row.id,
    entryDate: row.entryDate,
    entryType: row.entryType,
    paymentMethod: row.paymentMethod,
    amountCents: row.amountCents,
    note: row.note,
    createdByUserId: row.createdByUserId,
    createdByName: getDisplayName(
      row.createdByEmail,
      row.createdByFullName,
      row.createdByDisplayName,
      "Bilinmeyen"
    ),
    updatedByUserId: row.updatedByUserId,
    updatedByName: row.updatedByUserId
      ? getDisplayName(
          row.updatedByEmail,
          row.updatedByFullName,
          row.updatedByDisplayName,
          "Bilinmeyen"
        )
      : null,
    deletedAt: row.deletedAt,
    deletedByUserId: row.deletedByUserId,
    deletedByName: row.deletedByUserId
      ? getDisplayName(
          row.deletedByEmail,
          row.deletedByFullName,
          row.deletedByDisplayName,
          "Bilinmeyen"
        )
      : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function summarizeCashEntries(entries: CashEntryRecord[]): CashEntrySummary {
  let incomeCents = 0;
  let expenseCents = 0;
  const paymentMethodTotals: Record<CashEntryPaymentMethod, number> = {
    cash: 0,
    card: 0,
    bank_transfer: 0,
    other: 0,
  };

  for (const entry of entries) {
    paymentMethodTotals[entry.paymentMethod] += entry.amountCents;

    if (entry.entryType === "income") {
      incomeCents += entry.amountCents;
      continue;
    }

    expenseCents += entry.amountCents;
  }

  return {
    incomeCents,
    expenseCents,
    netCents: incomeCents - expenseCents,
    entryCount: entries.length,
    paymentMethodTotals,
  };
}

export function formatCashAmount(amountCents: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatCashAmountInput(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export function formatCashDateLong(entryDate: string): string {
  const [year, month, day] = entryDate.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function formatCashTime(timestamp: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function parseCashAmountToCents(value: string): number {
  const normalized = value.trim().replace(",", ".");

  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Tutarı 12.50 gibi yazın.");
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const amountCents =
    Number(wholePart) * 100 + Number(fractionPart.padEnd(2, "0").slice(0, 2));

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Tutar sıfırdan büyük olmalı.");
  }

  return amountCents;
}

function assertPositiveAmountCents(amountCents: number): number {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Tutar sıfırdan büyük olmalı.");
  }

  return amountCents;
}

function assertCashEntryType(value: string): CashEntryType {
  if (value === "income" || value === "expense") {
    return value;
  }

  throw new Error("İşlem türü geçerli değil.");
}

export function toCashEntryType(value: string): CashEntryType {
  return assertCashEntryType(value);
}

function assertCashEntryPaymentMethod(value: string): CashEntryPaymentMethod {
  if (value === "cash" || value === "card" || value === "bank_transfer" || value === "other") {
    return value;
  }

  throw new Error("Ödeme tipi geçerli değil.");
}

export function toCashEntryPaymentMethod(value: string): CashEntryPaymentMethod {
  return assertCashEntryPaymentMethod(value);
}

async function listActiveCashEntriesForDate(entryDate: string): Promise<CashEntryRecord[]> {
  const db = getDb();
  const createdByUsers = alias(users, "cash_created_by_users");
  const createdByProfiles = alias(userProfiles, "cash_created_by_profiles");
  const updatedByUsers = alias(users, "cash_updated_by_users");
  const updatedByProfiles = alias(userProfiles, "cash_updated_by_profiles");
  const deletedByUsers = alias(users, "cash_deleted_by_users");
  const deletedByProfiles = alias(userProfiles, "cash_deleted_by_profiles");

  const rows = await db
    .select({
      id: cashEntries.id,
      entryDate: cashEntries.entryDate,
      entryType: cashEntries.entryType,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
      createdByUserId: cashEntries.createdByUserId,
      createdByEmail: createdByUsers.email,
      createdByFullName: createdByProfiles.fullName,
      createdByDisplayName: createdByProfiles.displayName,
      updatedByUserId: cashEntries.updatedByUserId,
      updatedByEmail: updatedByUsers.email,
      updatedByFullName: updatedByProfiles.fullName,
      updatedByDisplayName: updatedByProfiles.displayName,
      deletedAt: cashEntries.deletedAt,
      deletedByUserId: cashEntries.deletedByUserId,
      deletedByEmail: deletedByUsers.email,
      deletedByFullName: deletedByProfiles.fullName,
      deletedByDisplayName: deletedByProfiles.displayName,
      createdAt: cashEntries.createdAt,
      updatedAt: cashEntries.updatedAt,
    })
    .from(cashEntries)
    .innerJoin(createdByUsers, eq(createdByUsers.id, cashEntries.createdByUserId))
    .leftJoin(createdByProfiles, eq(createdByProfiles.userId, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(updatedByUsers.id, cashEntries.updatedByUserId))
    .leftJoin(updatedByProfiles, eq(updatedByProfiles.userId, updatedByUsers.id))
    .leftJoin(deletedByUsers, eq(deletedByUsers.id, cashEntries.deletedByUserId))
    .leftJoin(deletedByProfiles, eq(deletedByProfiles.userId, deletedByUsers.id))
    .where(and(eq(cashEntries.entryDate, entryDate), isNull(cashEntries.deletedAt)))
    .orderBy(desc(cashEntries.createdAt), desc(cashEntries.id));

  return rows.map(toCashEntryRecord);
}

async function getActiveCashEntry(
  entryId: number,
  executor: CashEntryLookupExecutor = getDb()
): Promise<CashEntryMutationRecord | null> {
  const rows = await executor
    .select({
      id: cashEntries.id,
      entryDate: cashEntries.entryDate,
      entryType: cashEntries.entryType,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
    })
    .from(cashEntries)
    .where(and(eq(cashEntries.id, entryId), isNull(cashEntries.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getCashbookSnapshot(
  roles: UserRole[],
  requestedDate?: string | null
): Promise<CashbookSnapshot> {
  const selectedDate = resolveCashbookDate(roles, requestedDate);
  const todayDate = getTodayCashDateValue();
  const [selectedEntries, todayEntries] =
    selectedDate === todayDate
      ? await Promise.all([listActiveCashEntriesForDate(selectedDate), Promise.resolve(null)])
      : await Promise.all([
          listActiveCashEntriesForDate(selectedDate),
          listActiveCashEntriesForDate(todayDate),
        ]);

  const todayVisibleEntries = todayEntries ?? selectedEntries;

  return {
    selectedDate,
    todayDate,
    canManageHistory: canManageCashHistory(roles),
    entries: selectedEntries,
    selectedSummary: summarizeCashEntries(selectedEntries),
    todaySummary: summarizeCashEntries(todayVisibleEntries),
  };
}

export async function createCashEntry(input: CreateCashEntryInput): Promise<CashEntryMutationRecord> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const insertedRows = await tx
      .insert(cashEntries)
      .values({
        entryDate: assertCashDateValue(input.entryDate),
        entryType: assertCashEntryType(input.entryType),
        paymentMethod: assertCashEntryPaymentMethod(input.paymentMethod),
        amountCents: assertPositiveAmountCents(input.amountCents),
        note: input.note,
        createdByUserId: input.actorUserId,
      })
      .returning({
        id: cashEntries.id,
        entryDate: cashEntries.entryDate,
        entryType: cashEntries.entryType,
        paymentMethod: cashEntries.paymentMethod,
        amountCents: cashEntries.amountCents,
        note: cashEntries.note,
      });

    const inserted = insertedRows[0];

    if (!inserted) {
      throw new Error("Kasa kaydı eklenemedi.");
    }

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "cash_entry.created",
        entityType: "cash_entry",
        entityId: inserted.id,
        payload: {
          entryDate: inserted.entryDate,
          entryType: inserted.entryType,
          paymentMethod: inserted.paymentMethod,
          amountCents: inserted.amountCents,
          hasNote: Boolean(inserted.note),
        },
      },
      tx
    );

    return inserted;
  });
}

export async function updateCashEntry(input: UpdateCashEntryInput): Promise<CashEntryMutationRecord> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const current = await getActiveCashEntry(input.entryId, tx);

    if (!current) {
      throw new Error("Kasa kaydı bulunamadı.");
    }

    const updatedRows = await tx
      .update(cashEntries)
      .set({
        entryDate: assertCashDateValue(input.entryDate),
        entryType: assertCashEntryType(input.entryType),
        paymentMethod: assertCashEntryPaymentMethod(input.paymentMethod),
        amountCents: assertPositiveAmountCents(input.amountCents),
        note: input.note,
        updatedByUserId: input.actorUserId,
        updatedAt: new Date(),
      })
      .where(eq(cashEntries.id, input.entryId))
      .returning({
        id: cashEntries.id,
        entryDate: cashEntries.entryDate,
        entryType: cashEntries.entryType,
        paymentMethod: cashEntries.paymentMethod,
        amountCents: cashEntries.amountCents,
        note: cashEntries.note,
      });

    const updated = updatedRows[0];

    if (!updated) {
      throw new Error("Kasa kaydı güncellenemedi.");
    }

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "cash_entry.updated",
        entityType: "cash_entry",
        entityId: updated.id,
        payload: {
          changedFields: [
            current.entryDate !== updated.entryDate ? "entryDate" : null,
            current.entryType !== updated.entryType ? "entryType" : null,
            current.paymentMethod !== updated.paymentMethod ? "paymentMethod" : null,
            current.amountCents !== updated.amountCents ? "amountCents" : null,
            current.note !== updated.note ? "note" : null,
          ].filter((value): value is string => Boolean(value)),
          entryDate: updated.entryDate,
          entryType: updated.entryType,
          paymentMethod: updated.paymentMethod,
          amountCents: updated.amountCents,
          hasNote: Boolean(updated.note),
        },
      },
      tx
    );

    return updated;
  });
}

export async function softDeleteCashEntry(
  input: SoftDeleteCashEntryInput
): Promise<CashEntryMutationRecord> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const current = await getActiveCashEntry(input.entryId, tx);

    if (!current) {
      throw new Error("Kasa kaydı bulunamadı.");
    }

    const updatedRows = await tx
      .update(cashEntries)
      .set({
        deletedAt: new Date(),
        deletedByUserId: input.actorUserId,
        updatedByUserId: input.actorUserId,
        updatedAt: new Date(),
      })
      .where(eq(cashEntries.id, input.entryId))
      .returning({
        id: cashEntries.id,
        entryDate: cashEntries.entryDate,
        entryType: cashEntries.entryType,
        paymentMethod: cashEntries.paymentMethod,
        amountCents: cashEntries.amountCents,
        note: cashEntries.note,
      });

    const deleted = updatedRows[0];

    if (!deleted) {
      throw new Error("Kasa kaydı kaldırılamadı.");
    }

    await writeAuditLog(
      {
        actorUserId: input.actorUserId,
        action: "cash_entry.soft_deleted",
        entityType: "cash_entry",
        entityId: deleted.id,
        payload: {
          entryDate: current.entryDate,
          entryType: current.entryType,
          paymentMethod: current.paymentMethod,
          amountCents: current.amountCents,
          hasNote: Boolean(current.note),
        },
      },
      tx
    );

    return deleted;
  });
}
