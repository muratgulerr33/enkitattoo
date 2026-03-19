import type { UserRole } from "@/db/schema";
import { hasStaffRole } from "@/lib/ops/auth/roles";
import {
  formatAppointmentDateLong,
  getTodayDateValue,
  listAppointmentsForDateRange,
  summarizeAppointments,
  type AppointmentRecord,
  type AppointmentSummary,
} from "@/lib/ops/appointments";
import {
  listActiveCashEntriesForDateRange,
  summarizeCashEntries,
  type CashEntrySummary,
} from "@/lib/ops/cashbook";

export type ReportRangePreset = "today" | "week" | "custom";

export type ReportsRange = {
  title: string;
  from: string;
  to: string;
  label: string;
  preset: ReportRangePreset;
};

export type ReportsCashSummary = Pick<
  CashEntrySummary,
  "incomeCents" | "expenseCents" | "netCents" | "entryCount"
>;

export type ReportsAppointmentListItem = Pick<
  AppointmentRecord,
  "id" | "appointmentDate" | "appointmentTime" | "customerName" | "status" | "notes"
>;

export type AdminReportSection = {
  range: ReportsRange;
  cashSummary: ReportsCashSummary;
  appointmentSummary: AppointmentSummary;
  appointments: ReportsAppointmentListItem[];
};

export type ArtistReportSection = {
  range: ReportsRange;
  appointmentSummary: AppointmentSummary;
};

export type AdminReportsSnapshot = {
  today: AdminReportSection;
  week: AdminReportSection;
  selected: AdminReportSection;
};

function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

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
    month: "long",
  }).format(parseDateValue(dateValue));
}

function formatRangeLabel(from: string, to: string): string {
  if (from === to) {
    return formatAppointmentDateLong(from);
  }

  return `${formatShortDate(from)} - ${formatShortDate(to)}`;
}

function getWeekStartDateValue(dateValue: string): string {
  const date = parseDateValue(dateValue);
  const weekdayOffset = (date.getDay() + 6) % 7;

  date.setDate(date.getDate() - weekdayOffset);

  return toDateValue(date);
}

function getWeekEndDateValue(startDateValue: string): string {
  const date = parseDateValue(startDateValue);

  date.setDate(date.getDate() + 6);

  return toDateValue(date);
}

function getTodayRange(): ReportsRange {
  const today = getTodayDateValue();

  return {
    title: "Bugün",
    from: today,
    to: today,
    label: formatAppointmentDateLong(today),
    preset: "today",
  };
}

function getWeekRange(): ReportsRange {
  const today = getTodayDateValue();
  const from = getWeekStartDateValue(today);
  const to = getWeekEndDateValue(from);

  return {
    title: "Bu hafta",
    from,
    to,
    label: formatRangeLabel(from, to),
    preset: "week",
  };
}

export function canViewAdminReports(roles: UserRole[]): boolean {
  return hasStaffRole(roles);
}

export function resolveSelectedAdminRange(searchParams: {
  from?: string;
  to?: string;
}): ReportsRange {
  const fallbackRange = getWeekRange();

  if (!isValidDateValue(searchParams.from) || !isValidDateValue(searchParams.to)) {
    return {
      ...fallbackRange,
      title: "Genel rapor",
      preset: "custom",
    };
  }

  if (searchParams.from > searchParams.to) {
    return {
      ...fallbackRange,
      title: "Genel rapor",
      preset: "custom",
    };
  }

  return {
    title: "Genel rapor",
    from: searchParams.from,
    to: searchParams.to,
    label: formatRangeLabel(searchParams.from, searchParams.to),
    preset: "custom",
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

function toAppointmentListItems(
  appointments: AppointmentRecord[]
): ReportsAppointmentListItem[] {
  return [...appointments]
    .sort((left, right) =>
      left.appointmentDate === right.appointmentDate
        ? right.appointmentTime.localeCompare(left.appointmentTime)
        : right.appointmentDate.localeCompare(left.appointmentDate)
    )
    .map((appointment) => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      customerName: appointment.customerName,
      status: appointment.status,
      notes: appointment.notes,
    }));
}

async function buildAdminReportSection(
  range: ReportsRange,
  includeAppointmentsList: boolean
): Promise<AdminReportSection> {
  const [cashEntries, appointments] = await Promise.all([
    listActiveCashEntriesForDateRange(range.from, range.to),
    listAppointmentsForDateRange(range.from, range.to),
  ]);

  return {
    range,
    cashSummary: toCashSummary(summarizeCashEntries(cashEntries)),
    appointmentSummary: summarizeAppointments(appointments),
    appointments: includeAppointmentsList ? toAppointmentListItems(appointments) : [],
  };
}

export async function getAdminReportsSnapshot(searchParams: {
  from?: string;
  to?: string;
}): Promise<AdminReportsSnapshot> {
  const todayRange = getTodayRange();
  const weekRange = getWeekRange();
  const selectedRange = resolveSelectedAdminRange(searchParams);
  const [today, week, selected] = await Promise.all([
    buildAdminReportSection(todayRange, false),
    buildAdminReportSection(weekRange, false),
    buildAdminReportSection(selectedRange, true),
  ]);

  return {
    today,
    week,
    selected,
  };
}
