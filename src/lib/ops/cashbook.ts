import { and, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, type Db } from "@/db";
import {
  cashEntries,
  type CashEntryPaymentMethod,
  type CashEntryReason,
  type CashEntryType,
  type ServiceIntakeFlowType,
  type ServiceIntakeServiceType,
  userProfiles,
  users,
  type UserRole,
} from "@/db/schema";
import { writeAuditLog } from "./audit";
import { hasStaffRole } from "./auth/roles";
import { formatOpsMoneyDisplay } from "./money";

export const CASHBOOK_DATE_LOCK_MESSAGE = "Bu tarih için kasa kaydı açılamadı.";
export const SYSTEM_CASH_ENTRY_UPDATE_MESSAGE = "Sistem kaydı düzenlenemez.";
export const SYSTEM_CASH_ENTRY_DELETE_MESSAGE = "Sistem kaydı kaldırılamaz.";

export type CashEntryRecord = {
  id: number;
  entryDate: string;
  entryType: CashEntryType;
  entryReason: CashEntryReason;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  serviceIntakeId: number | null;
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
  entryReason?: CashEntryReason;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  serviceIntakeId?: number | null;
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
  entryReason: CashEntryReason;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  serviceIntakeId: number | null;
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
  entryReason: CashEntryReason;
  paymentMethod: CashEntryPaymentMethod;
  amountCents: number;
  note: string | null;
  serviceIntakeId: number | null;
};

type CashEntryLookupExecutor = Pick<Db, "select">;
type CashEntryMutationExecutor = Pick<Db, "insert">;

export type PostServiceIntakeCashDeltaInput = {
  serviceIntakeId: number;
  flowType: ServiceIntakeFlowType;
  serviceType: ServiceIntakeServiceType;
  scheduledDate: string;
  scheduledTime: string;
  previousCollectedAmountCents: number;
  nextCollectedAmountCents: number;
  actorUserId: number;
};

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

export function canManageCashHistory(roles: UserRole[]): boolean {
  return hasStaffRole(roles);
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
    entryReason: row.entryReason,
    paymentMethod: row.paymentMethod,
    amountCents: row.amountCents,
    note: row.note,
    serviceIntakeId: row.serviceIntakeId,
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

export function isSystemGeneratedCashEntry(
  entry: Pick<CashEntryRecord, "entryReason">
): boolean {
  return entry.entryReason !== "manual";
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
  return formatOpsMoneyDisplay(amountCents);
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

function assertCashEntryReason(value: string): CashEntryReason {
  if (
    value === "manual" ||
    value === "service_collection" ||
    value === "service_adjustment"
  ) {
    return value;
  }

  throw new Error("Kasa kayıt nedeni geçerli değil.");
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
      entryReason: cashEntries.entryReason,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
      serviceIntakeId: cashEntries.serviceIntakeId,
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

export async function listActiveCashEntriesForDateRange(
  startDateValue: string,
  endDateValue: string
): Promise<CashEntryRecord[]> {
  const startDate = assertCashDateValue(startDateValue);
  const endDate = assertCashDateValue(endDateValue);

  if (startDate > endDate) {
    throw new Error("Tarih aralığı geçerli değil.");
  }

  const db = getDb();
  const createdByUsers = alias(users, "cash_created_by_range_users");
  const createdByProfiles = alias(userProfiles, "cash_created_by_range_profiles");
  const updatedByUsers = alias(users, "cash_updated_by_range_users");
  const updatedByProfiles = alias(userProfiles, "cash_updated_by_range_profiles");
  const deletedByUsers = alias(users, "cash_deleted_by_range_users");
  const deletedByProfiles = alias(userProfiles, "cash_deleted_by_range_profiles");

  const rows = await db
    .select({
      id: cashEntries.id,
      entryDate: cashEntries.entryDate,
      entryType: cashEntries.entryType,
      entryReason: cashEntries.entryReason,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
      serviceIntakeId: cashEntries.serviceIntakeId,
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
    .where(
      and(
        gte(cashEntries.entryDate, startDate),
        lte(cashEntries.entryDate, endDate),
        isNull(cashEntries.deletedAt)
      )
    )
    .orderBy(desc(cashEntries.entryDate), desc(cashEntries.createdAt), desc(cashEntries.id));

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
      entryReason: cashEntries.entryReason,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
      serviceIntakeId: cashEntries.serviceIntakeId,
    })
    .from(cashEntries)
    .where(and(eq(cashEntries.id, entryId), isNull(cashEntries.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}

export async function hasActiveCashEntriesForServiceIntakeIds(
  serviceIntakeIds: number[],
  executor: CashEntryLookupExecutor = getDb()
): Promise<boolean> {
  if (!serviceIntakeIds.length) {
    return false;
  }

  const rows = await executor
    .select({ id: cashEntries.id })
    .from(cashEntries)
    .where(
      and(
        isNull(cashEntries.deletedAt),
        inArray(cashEntries.entryReason, ["service_collection", "service_adjustment"]),
        inArray(cashEntries.serviceIntakeId, serviceIntakeIds)
      )
    )
    .limit(1);

  return Boolean(rows[0]);
}

function getServiceLabel(serviceType: ServiceIntakeServiceType): string {
  return serviceType === "piercing" ? "Piercing" : "Dövme";
}

function buildServiceIntakeCashEntryNote(
  input: Pick<
    PostServiceIntakeCashDeltaInput,
    "flowType" | "serviceType" | "scheduledDate" | "scheduledTime"
  > & {
    entryReason: CashEntryReason;
  }
): string {
  const eventLabel =
    input.entryReason === "service_collection" ? "tahsilatı" : "düzeltmesi";

  return `İşlem ${eventLabel} · ${getServiceLabel(input.serviceType)} · ${input.scheduledDate} ${input.scheduledTime}`;
}

async function insertCashEntryRecord(
  executor: CashEntryMutationExecutor,
  input: Required<
    Pick<CreateCashEntryInput, "entryDate" | "entryType" | "entryReason" | "paymentMethod" | "amountCents" | "actorUserId">
  > &
    Pick<CreateCashEntryInput, "note" | "serviceIntakeId">
): Promise<CashEntryMutationRecord> {
  const insertedRows = await executor
    .insert(cashEntries)
    .values({
      entryDate: assertCashDateValue(input.entryDate),
      entryType: assertCashEntryType(input.entryType),
      entryReason: assertCashEntryReason(input.entryReason),
      paymentMethod: assertCashEntryPaymentMethod(input.paymentMethod),
      amountCents: assertPositiveAmountCents(input.amountCents),
      note: input.note,
      serviceIntakeId: input.serviceIntakeId ?? null,
      createdByUserId: input.actorUserId,
    })
    .returning({
      id: cashEntries.id,
      entryDate: cashEntries.entryDate,
      entryType: cashEntries.entryType,
      entryReason: cashEntries.entryReason,
      paymentMethod: cashEntries.paymentMethod,
      amountCents: cashEntries.amountCents,
      note: cashEntries.note,
      serviceIntakeId: cashEntries.serviceIntakeId,
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
        entryReason: inserted.entryReason,
        paymentMethod: inserted.paymentMethod,
        amountCents: inserted.amountCents,
        serviceIntakeId: inserted.serviceIntakeId,
        hasNote: Boolean(inserted.note),
      },
    },
    executor
  );

  return inserted;
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
    return insertCashEntryRecord(tx, {
      entryDate: input.entryDate,
      entryType: input.entryType,
      entryReason: input.entryReason ?? "manual",
      paymentMethod: input.paymentMethod,
      amountCents: input.amountCents,
      note: input.note,
      serviceIntakeId: input.serviceIntakeId ?? null,
      actorUserId: input.actorUserId,
    });
  });
}

export async function postServiceIntakeCashDelta(
  input: PostServiceIntakeCashDeltaInput,
  executor: CashEntryMutationExecutor = getDb()
): Promise<CashEntryMutationRecord | null> {
  const delta = input.nextCollectedAmountCents - input.previousCollectedAmountCents;

  if (delta === 0) {
    return null;
  }

  const entryReason: CashEntryReason =
    delta > 0 ? "service_collection" : "service_adjustment";

  return insertCashEntryRecord(executor, {
    entryDate: getTodayCashDateValue(),
    entryType: delta > 0 ? "income" : "expense",
    entryReason,
    paymentMethod: "cash",
    amountCents: Math.abs(delta),
    note: buildServiceIntakeCashEntryNote({
      flowType: input.flowType,
      serviceType: input.serviceType,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      entryReason,
    }),
    serviceIntakeId: input.serviceIntakeId,
    actorUserId: input.actorUserId,
  });
}

export async function updateCashEntry(input: UpdateCashEntryInput): Promise<CashEntryMutationRecord> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const current = await getActiveCashEntry(input.entryId, tx);

    if (!current) {
      throw new Error("Kasa kaydı bulunamadı.");
    }

    if (current.entryReason !== "manual") {
      throw new Error(SYSTEM_CASH_ENTRY_UPDATE_MESSAGE);
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
        entryReason: cashEntries.entryReason,
        paymentMethod: cashEntries.paymentMethod,
        amountCents: cashEntries.amountCents,
        note: cashEntries.note,
        serviceIntakeId: cashEntries.serviceIntakeId,
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
          entryReason: updated.entryReason,
          paymentMethod: updated.paymentMethod,
          amountCents: updated.amountCents,
          serviceIntakeId: updated.serviceIntakeId,
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

    if (current.entryReason !== "manual") {
      throw new Error(SYSTEM_CASH_ENTRY_DELETE_MESSAGE);
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
        entryReason: cashEntries.entryReason,
        paymentMethod: cashEntries.paymentMethod,
        amountCents: cashEntries.amountCents,
        note: cashEntries.note,
        serviceIntakeId: cashEntries.serviceIntakeId,
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
          entryReason: current.entryReason,
          paymentMethod: current.paymentMethod,
          amountCents: current.amountCents,
          serviceIntakeId: current.serviceIntakeId,
          hasNote: Boolean(current.note),
        },
      },
      tx
    );

    return deleted;
  });
}
