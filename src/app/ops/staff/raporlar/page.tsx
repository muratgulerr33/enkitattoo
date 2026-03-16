import Link from "next/link";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppointmentStatus } from "@/db/schema";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/ops/appointment-copy";
import { formatAppointmentDateLong } from "@/lib/ops/appointments";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { formatCashAmount } from "@/lib/ops/cashbook";
import {
  canViewAdminReports,
  getAdminReportsSnapshot,
  getArtistReportsSnapshot,
  resolveSelectedAdminRange,
  type AdminReportSection,
  type ArtistReportSection,
  type ReportsAppointmentListItem,
} from "@/lib/ops/reports";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

function getStatusClassName(status: AppointmentStatus): string {
  if (status === "completed") {
    return "text-emerald-700";
  }

  if (status === "scheduled") {
    return "text-sky-700";
  }

  if (status === "cancelled") {
    return "text-amber-700";
  }

  return "text-rose-700";
}

function truncateNote(note: string | null): string | null {
  const normalized = note?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= 88) {
    return normalized;
  }

  return `${normalized.slice(0, 85)}...`;
}

function MetricGrid({
  items,
  columns = 2,
}: {
  items: Array<{
    label: string;
    value: string | number;
    toneClassName?: string;
  }>;
  columns?: 2 | 4;
}) {
  return (
    <div className={cn("grid gap-2", columns === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2")}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-surface-1 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </p>
          <p className={cn("mt-1 text-base font-semibold font-numbers text-foreground", item.toneClassName)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function CashSummaryBlock({ section }: { section: AdminReportSection }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">Kasa özeti</p>
        <p className="text-xs text-muted-foreground">{section.range.label}</p>
      </div>

      <MetricGrid
        columns={4}
        items={[
          {
            label: "Toplam gelir",
            value: formatCashAmount(section.cashSummary.incomeCents),
            toneClassName: "text-emerald-700",
          },
          {
            label: "Toplam gider",
            value: formatCashAmount(section.cashSummary.expenseCents),
            toneClassName: "text-amber-700",
          },
          {
            label: "Net",
            value: formatCashAmount(section.cashSummary.netCents),
            toneClassName:
              section.cashSummary.netCents > 0
                ? "text-emerald-700"
                : section.cashSummary.netCents < 0
                  ? "text-amber-700"
                  : undefined,
          },
          {
            label: "Kayıt",
            value: section.cashSummary.entryCount,
          },
        ]}
      />
    </div>
  );
}

function AppointmentSummaryBlock({
  title,
  label,
  summary,
}: {
  title: string;
  label: string;
  summary: ArtistReportSection["appointmentSummary"];
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>

      <MetricGrid
        columns={4}
        items={[
          { label: "Toplam", value: summary.totalCount },
          { label: "Planlı", value: summary.scheduledCount, toneClassName: "text-sky-700" },
          { label: "Tamamlanan", value: summary.completedCount, toneClassName: "text-emerald-700" },
          { label: "İptal", value: summary.cancelledCount, toneClassName: "text-amber-700" },
          { label: "No-show", value: summary.noShowCount, toneClassName: "text-rose-700" },
        ]}
      />
    </div>
  );
}

function AppointmentList({
  title,
  description,
  appointments,
}: {
  title: string;
  description: string;
  appointments: ReportsAppointmentListItem[];
}) {
  return (
    <Card>
      <CardHeader className="gap-1.5 border-b pb-4">
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-0 pt-1">
        {appointments.length ? (
          <div className="divide-y divide-border">
            {appointments.map((appointment) => {
              const notePreview = truncateNote(appointment.notes);

              return (
                <div key={appointment.id} className="space-y-1.5 px-4 py-3 xl:px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        {appointment.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAppointmentDateLong(appointment.appointmentDate)} · {appointment.appointmentTime}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-[11px] font-medium uppercase tracking-wide",
                        getStatusClassName(appointment.status)
                      )}
                    >
                      {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </span>
                  </div>

                  {notePreview ? (
                    <p className="text-sm text-muted-foreground">{notePreview}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-5 text-sm text-muted-foreground xl:px-5">Kayıt yok.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function OpsStaffReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionUser = await requireOpsSessionArea("staff");
  const isAdmin = canViewAdminReports(sessionUser.roles);

  if (isAdmin) {
    const selectedRange = resolveSelectedAdminRange(params);
    const reports = await getAdminReportsSnapshot(params);

    return (
      <div className="ops-page-shell space-y-4">
        <Card>
          <CardHeader className="gap-2 border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg">Raporlar</CardTitle>
                <CardDescription>
                  Günlük, haftalık ve seçili aralık özeti burada toplanır.
                </CardDescription>
              </div>

              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link href="/ops/staff/kasa">
                  <ArrowLeft className="size-4" aria-hidden />
                  Kasaya dön
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-border px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarRange className="size-4" aria-hidden />
                  {reports.today.range.title}
                </div>
                <div className="space-y-4">
                  <CashSummaryBlock section={reports.today} />
                  <AppointmentSummaryBlock
                    title="Randevu özeti"
                    label={reports.today.range.label}
                    summary={reports.today.appointmentSummary}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarRange className="size-4" aria-hidden />
                  {reports.week.range.title}
                </div>
                <div className="space-y-4">
                  <CashSummaryBlock section={reports.week} />
                  <AppointmentSummaryBlock
                    title="Randevu özeti"
                    label={reports.week.range.label}
                    summary={reports.week.appointmentSummary}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Genel rapor</p>
                  <p className="text-xs text-muted-foreground">{reports.selected.range.label}</p>
                </div>

                <form action="/ops/staff/raporlar" className="grid w-full gap-2 sm:w-auto sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <Input
                    type="date"
                    name="from"
                    defaultValue={selectedRange.from}
                    aria-label="Başlangıç tarihi"
                  />
                  <Input
                    type="date"
                    name="to"
                    defaultValue={selectedRange.to}
                    aria-label="Bitiş tarihi"
                  />
                  <Button type="submit" variant="outline" size="sm" className="rounded-lg">
                    Uygula
                  </Button>
                </form>
              </div>

              <div className="mt-4 space-y-4">
                <CashSummaryBlock section={reports.selected} />
                <AppointmentSummaryBlock
                  title="Randevu özeti"
                  label={reports.selected.range.label}
                  summary={reports.selected.appointmentSummary}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AppointmentList
          title="Seçilen aralıktaki randevular"
          description={`${reports.selected.range.label} için ${reports.selected.appointments.length} kayıt bulundu.`}
          appointments={reports.selected.appointments}
        />
      </div>
    );
  }

  const reports = await getArtistReportsSnapshot();

  return (
    <div className="ops-page-shell space-y-4">
      <Card>
        <CardHeader className="gap-2 border-b pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg">Raporlar</CardTitle>
              <CardDescription>
                Bugün ve bu hafta özetiyle tüm randevuları buradan okuyabilirsiniz.
              </CardDescription>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/ops/staff/kasa">
                <ArrowLeft className="size-4" aria-hidden />
                Kasaya dön
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 pt-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarRange className="size-4" aria-hidden />
              {reports.today.range.title}
            </div>
            <AppointmentSummaryBlock
              title="Randevu özeti"
              label={reports.today.range.label}
              summary={reports.today.appointmentSummary}
            />
          </div>

          <div className="rounded-2xl border border-border px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarRange className="size-4" aria-hidden />
              {reports.week.range.title}
            </div>
            <AppointmentSummaryBlock
              title="Randevu özeti"
              label={reports.week.range.label}
              summary={reports.week.appointmentSummary}
            />
          </div>
        </CardContent>
      </Card>

      <AppointmentList
        title="Tüm randevular"
        description={`${reports.appointments.length} kayıt read-only listede gösterilir.`}
        appointments={reports.appointments}
      />
    </div>
  );
}
