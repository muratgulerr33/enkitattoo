import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";
import { OpsAppointmentStatusForm } from "@/components/ops/ops-appointment-status-form";
import { OpsStaffAppointmentCreateForm } from "@/components/ops/ops-staff-appointment-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  buildMonthCalendar,
  formatAppointmentDateLong,
  getDefaultSelectedDay,
  getMonthLabel,
  listAppointmentsForMonth,
  listCustomerOptions,
  parseMonthValue,
  shiftMonthValue,
} from "@/lib/ops/appointments";
import {
  APPOINTMENT_SOURCE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/ops/appointment-copy";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

type PageProps = {
  searchParams: Promise<{
    month?: string;
    day?: string;
  }>;
};

function getStatusBadgeClassName(status: keyof typeof APPOINTMENT_STATUS_LABELS): string {
  if (status === "scheduled") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "completed") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-700";
  }

  if (status === "cancelled") {
    return "border-border bg-muted/40 text-foreground";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-700";
}

export default async function OpsStaffAppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const monthValue = parseMonthValue(params.month);
  const selectedDay = getDefaultSelectedDay(monthValue, params.day);
  const [monthAppointments, customerOptions] = await Promise.all([
    listAppointmentsForMonth(monthValue),
    listCustomerOptions(),
  ]);

  const countsByDate = new Map<string, number>();

  for (const appointment of monthAppointments) {
    countsByDate.set(
      appointment.appointmentDate,
      (countsByDate.get(appointment.appointmentDate) ?? 0) + 1
    );
  }

  const dayAppointments = monthAppointments.filter(
    (appointment) => appointment.appointmentDate === selectedDay
  );
  const scheduledCount = dayAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  ).length;
  const calendarCells = buildMonthCalendar(monthValue, countsByDate, selectedDay);
  const previousMonth = shiftMonthValue(monthValue, -1);
  const nextMonth = shiftMonthValue(monthValue, 1);

  return (
    <div className="ops-page-shell">
      <section className="ops-page-header">
        <h1 className="typo-page-title">Randevular</h1>
        <p className="ops-page-intro">
          Seçilen gün ana akıştır. Aylık görünüm yön bulma ve hızlı geçiş içindir.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:gap-6">
        <div className="flex flex-col gap-5 sm:gap-6">
          <Card className="order-2 xl:order-1">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{getMonthLabel(monthValue)}</CardTitle>
                  <CardDescription>
                    Gün seçin, seçili gün listesi buna göre yenilensin.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/ops/staff/randevular?month=${previousMonth}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href={`/ops/staff/randevular?month=${nextMonth}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) =>
                cell.kind === "empty" ? (
                  <div
                    key={cell.key}
                    className="min-h-24 rounded-2xl border border-dashed border-border/60 bg-muted/15"
                  />
                ) : (
                  <Link
                    key={cell.key}
                    href={`/ops/staff/randevular?month=${monthValue}&day=${cell.date}`}
                    className={cn(
                      "flex min-h-24 flex-col rounded-2xl border p-3 text-left transition-[transform,background-color,color,border-color] duration-150 hover:bg-muted/35 active:scale-[0.99]",
                      cell.isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{cell.dayNumber}</span>
                      {cell.isToday ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                            cell.isSelected
                              ? "bg-background/15 text-background"
                              : "bg-foreground text-background"
                          )}
                        >
                          Bugün
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-auto text-xs">
                      {cell.count ? `${cell.count} kayıt` : "Boş"}
                    </div>
                  </Link>
                )
              )}
            </CardContent>
          </Card>

          <Card className="order-1 xl:order-2">
            <CardHeader className="gap-1.5">
              <CardTitle>{formatAppointmentDateLong(selectedDay)}</CardTitle>
              <CardDescription>
                {dayAppointments.length
                  ? `${dayAppointments.length} kayıt var. ${scheduledCount} tanesi planlı.`
                  : "Bu gün için kayıt yok."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayAppointments.length ? (
                dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full border",
                              getStatusBadgeClassName(appointment.status)
                            )}
                          >
                            {APPOINTMENT_STATUS_LABELS[appointment.status]}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {APPOINTMENT_SOURCE_LABELS[appointment.source]}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-foreground">
                            {appointment.customerName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-4" aria-hidden />
                              {appointment.appointmentTime}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <UserRound className="size-4" aria-hidden />
                              {appointment.createdByName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,18rem)]">
                      <div className="space-y-2 rounded-2xl border border-border bg-surface-1 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Not
                        </p>
                        <p className="text-sm text-foreground">
                          {appointment.notes ?? "Not yok."}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.customerEmail ?? "E-posta yok"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border p-4">
                        <OpsAppointmentStatusForm
                          appointmentId={appointment.id}
                          status={appointment.status}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Seçilen günde kayıt yok. Sağdaki formdan yeni bir randevu açabilirsiniz.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <Card>
            <CardHeader className="gap-1.5">
              <CardTitle>Yeni randevu</CardTitle>
              <CardDescription>
                Müşteri, tarih ve saat seçerek hızlıca yeni kayıt açın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpsStaffAppointmentCreateForm
                customerOptions={customerOptions}
                defaultDate={selectedDay}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1.5">
              <CardTitle>Gün özeti</CardTitle>
              <CardDescription>Seçilen günün sayı özetini görün.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Planlı
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{scheduledCount}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tüm kayıt
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {dayAppointments.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Aylık toplam sayı
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {monthAppointments.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
