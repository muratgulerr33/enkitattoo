import { eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import {
  serviceIntakes,
  userProfiles,
  users,
  type CashEntryReason,
  type CashEntryType,
  type ServiceIntakeFlowType,
  type ServiceIntakeServiceType,
  type UserRole,
} from "@/db/schema";
import {
  getArtistPresentationLabel,
  listActiveArtistOptions,
  type ActiveArtistOption,
} from "@/lib/ops/artists";
import { hasStaffRole } from "@/lib/ops/auth/roles";
import { formatAppointmentDateLong, getTodayDateValue } from "@/lib/ops/appointments";
import {
  formatCashTime,
  listActiveCashEntriesForDateRange,
  summarizeCashEntries,
  type CashEntryRecord,
  type CashEntrySummary,
} from "@/lib/ops/cashbook";

export type ReportsRange = {
  from: string;
  to: string;
  label: string;
};

export type ReportsCashSummary = Pick<
  CashEntrySummary,
  "incomeCents" | "expenseCents" | "netCents" | "entryCount"
>;

export type ReportsServiceTypeFilter = "all" | ServiceIntakeServiceType;
export type ReportsSourceFilter = "all" | ServiceIntakeFlowType | "manual";

export type StaffReportsFilters = {
  from: string;
  to: string;
  serviceType: ReportsServiceTypeFilter;
  artistUserId: number | null;
  source: ReportsSourceFilter;
};

export type ReportsCashListItem = {
  id: number;
  entryType: CashEntryType;
  entryReason: CashEntryReason;
  amountCents: number;
  primaryLabel: string;
  reasonLabel: string;
  sourceLabel: string | null;
  supportLabel: string;
};

export type StaffReportsSnapshot = {
  filters: StaffReportsFilters;
  range: ReportsRange;
  summary: ReportsCashSummary;
  entries: ReportsCashListItem[];
  artistOptions: ActiveArtistOption[];
};

type ServiceIntakeReportMeta = {
  serviceIntakeId: number;
  flowType: ServiceIntakeFlowType;
  serviceType: ServiceIntakeServiceType;
  artistUserId: number | null;
  artistName: string | null;
  scheduledDate: string;
  scheduledTime: string;
};

function parseDateValue(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isValidDateValue(value?: string | null): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatShortDate(dateValue: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(parseDateValue(dateValue));
}

function formatRangeLabel(from: string, to: string): string {
  if (from === to) {
    return formatAppointmentDateLong(from);
  }

  return `${formatShortDate(from)} - ${formatShortDate(to)}`;
}

function getDefaultRange(): ReportsRange {
  const today = getTodayDateValue();

  return {
    from: today,
    to: today,
    label: formatAppointmentDateLong(today),
  };
}

export function canViewAdminReports(roles: UserRole[]): boolean {
  return hasStaffRole(roles);
}

function resolveServiceTypeFilter(value?: string | null): ReportsServiceTypeFilter {
  if (value === "tattoo" || value === "piercing") {
    return value;
  }

  return "all";
}

function resolveSourceFilter(value?: string | null): ReportsSourceFilter {
  if (value === "appointment" || value === "walk_in" || value === "manual") {
    return value;
  }

  return "all";
}

function resolveArtistUserId(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function resolveStaffReportsFilters(searchParams: {
  from?: string;
  to?: string;
  serviceType?: string;
  artistUserId?: string;
  source?: string;
}): StaffReportsFilters {
  const fallbackRange = getDefaultRange();
  const hasValidRange =
    isValidDateValue(searchParams.from) &&
    isValidDateValue(searchParams.to) &&
    searchParams.from <= searchParams.to;
  const from = hasValidRange && searchParams.from ? searchParams.from : fallbackRange.from;
  const to = hasValidRange && searchParams.to ? searchParams.to : fallbackRange.to;

  return {
    from,
    to,
    serviceType: resolveServiceTypeFilter(searchParams.serviceType),
    artistUserId: resolveArtistUserId(searchParams.artistUserId),
    source: resolveSourceFilter(searchParams.source),
  };
}

function toCashSummary(summary: CashEntrySummary): ReportsCashSummary {
  return {
    incomeCents: summary.incomeCents,
    expenseCents: summary.expenseCents,
    netCents: summary.netCents,
    entryCount: summary.entryCount,
  };
}

function getServiceTypeLabel(value: ServiceIntakeServiceType): string {
  return value === "piercing" ? "Piercing" : "Dövme";
}

function getSourceLabel(value: ServiceIntakeFlowType): string {
  return value === "walk_in" ? "Walk-in" : "Randevu";
}

function getReasonLabel(value: CashEntryReason): string {
  if (value === "service_collection") {
    return "Tahsilat";
  }

  if (value === "service_adjustment") {
    return "Düzeltme";
  }

  return "Manuel";
}

function formatCompactDateTime(dateValue: string, timeValue: string): string {
  return `${formatShortDate(dateValue)} · ${timeValue}`;
}

async function getServiceIntakeReportMetaMap(
  serviceIntakeIds: number[]
): Promise<Map<number, ServiceIntakeReportMeta>> {
  if (!serviceIntakeIds.length) {
    return new Map();
  }

  const db = getDb();
  const artistUsers = alias(users, "reports_artist_users");
  const artistProfiles = alias(userProfiles, "reports_artist_profiles");
  const rows = await db
    .select({
      serviceIntakeId: serviceIntakes.id,
      flowType: serviceIntakes.flowType,
      serviceType: serviceIntakes.serviceType,
      artistUserId: serviceIntakes.artistUserId,
      artistEmail: artistUsers.email,
      artistPhone: artistUsers.phone,
      artistFullName: artistProfiles.fullName,
      artistDisplayName: artistProfiles.displayName,
      scheduledDate: serviceIntakes.scheduledDate,
      scheduledTime: serviceIntakes.scheduledTime,
    })
    .from(serviceIntakes)
    .leftJoin(artistUsers, eq(artistUsers.id, serviceIntakes.artistUserId))
    .leftJoin(artistProfiles, eq(artistProfiles.userId, artistUsers.id))
    .where(inArray(serviceIntakes.id, [...new Set(serviceIntakeIds)]));

  return new Map(
    rows.map((row) => [
      row.serviceIntakeId,
      {
        serviceIntakeId: row.serviceIntakeId,
        flowType: row.flowType,
        serviceType: row.serviceType,
        artistUserId: row.artistUserId,
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
        scheduledDate: row.scheduledDate,
        scheduledTime: row.scheduledTime,
      },
    ])
  );
}

function matchesReportsFilters(
  entry: CashEntryRecord,
  serviceMeta: ServiceIntakeReportMeta | null,
  filters: StaffReportsFilters
): boolean {
  if (filters.serviceType !== "all" && serviceMeta?.serviceType !== filters.serviceType) {
    return false;
  }

  if (filters.artistUserId !== null && serviceMeta?.artistUserId !== filters.artistUserId) {
    return false;
  }

  if (filters.source === "all") {
    return true;
  }

  if (filters.source === "manual") {
    return entry.entryReason === "manual";
  }

  return serviceMeta?.flowType === filters.source;
}

function toReportsCashListItem(
  entry: CashEntryRecord,
  serviceMeta: ServiceIntakeReportMeta | null
): ReportsCashListItem {
  if (entry.entryReason === "manual") {
    return {
      id: entry.id,
      entryType: entry.entryType,
      entryReason: entry.entryReason,
      amountCents: entry.amountCents,
      primaryLabel:
        entry.note?.trim() || (entry.entryType === "income" ? "Manuel gelir" : "Manuel gider"),
      reasonLabel: getReasonLabel(entry.entryReason),
      sourceLabel: null,
      supportLabel: `${entry.createdByName} · ${formatCompactDateTime(
        entry.entryDate,
        formatCashTime(entry.createdAt)
      )}`,
    };
  }

  if (serviceMeta) {
    return {
      id: entry.id,
      entryType: entry.entryType,
      entryReason: entry.entryReason,
      amountCents: entry.amountCents,
      primaryLabel: getServiceTypeLabel(serviceMeta.serviceType),
      reasonLabel: getReasonLabel(entry.entryReason),
      sourceLabel: getSourceLabel(serviceMeta.flowType),
      supportLabel: `${serviceMeta.artistName ?? "Artist atanmadı"} · ${formatCompactDateTime(
        serviceMeta.scheduledDate,
        serviceMeta.scheduledTime
      )}`,
    };
  }

  return {
    id: entry.id,
    entryType: entry.entryType,
    entryReason: entry.entryReason,
    amountCents: entry.amountCents,
    primaryLabel: "İşlem kaydı",
    reasonLabel: getReasonLabel(entry.entryReason),
    sourceLabel: null,
    supportLabel: formatCompactDateTime(entry.entryDate, formatCashTime(entry.createdAt)),
  };
}

export async function getStaffReportsSnapshot(searchParams: {
  from?: string;
  to?: string;
  serviceType?: string;
  artistUserId?: string;
  source?: string;
}): Promise<StaffReportsSnapshot> {
  const filters = resolveStaffReportsFilters(searchParams);
  const [cashEntries, artistOptions] = await Promise.all([
    listActiveCashEntriesForDateRange(filters.from, filters.to),
    listActiveArtistOptions(),
  ]);
  const serviceMetaMap = await getServiceIntakeReportMetaMap(
    cashEntries.flatMap((entry) => (entry.serviceIntakeId ? [entry.serviceIntakeId] : []))
  );
  const filteredEntries = cashEntries.filter((entry) =>
    matchesReportsFilters(
      entry,
      entry.serviceIntakeId ? serviceMetaMap.get(entry.serviceIntakeId) ?? null : null,
      filters
    )
  );

  return {
    filters,
    range: {
      from: filters.from,
      to: filters.to,
      label: formatRangeLabel(filters.from, filters.to),
    },
    summary: toCashSummary(summarizeCashEntries(filteredEntries)),
    entries: filteredEntries.map((entry) =>
      toReportsCashListItem(
        entry,
        entry.serviceIntakeId ? serviceMetaMap.get(entry.serviceIntakeId) ?? null : null
      )
    ),
    artistOptions,
  };
}
