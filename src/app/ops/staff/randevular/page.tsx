import Link from "next/link";
import { ChevronLeft, ChevronRight, Circle, Clock3, UserRound } from "lucide-react";
import { OpsAppointmentStatusForm } from "@/components/ops/ops-appointment-status-form";
import { OpsStaffAppointmentCreateForm } from "@/components/ops/ops-staff-appointment-create-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  buildDateValue,
  type AppointmentRecord,
  buildMonthCalendar,
  formatAppointmentDateLong,
  getCurrentTimeValue,
  getDefaultSelectedDay,
  getMonthLabel,
  getMonthBounds,
  getTodayDateValue,
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

function toMinutes(timeValue: string): number {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeValue(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(totalMinutes, 23 * 60 + 30));
  const hours = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (clamped % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

function roundUpToHalfHour(totalMinutes: number): number {
  return totalMinutes % 30 === 0 ? totalMinutes : totalMinutes + (30 - (totalMinutes % 30));
}

function getQuickCreateDefaultTime(
  selectedDay: string,
  dayAppointments: AppointmentRecord[]
): string {
  const scheduledMinutes = dayAppointments
    .filter((appointment) => appointment.status === "scheduled")
    .map((appointment) => toMinutes(appointment.appointmentTime));

  let candidateMinutes = scheduledMinutes.length ? Math.max(...scheduledMinutes) + 30 : 12 * 60;

  if (selectedDay === getTodayDateValue()) {
    candidateMinutes = Math.max(
      candidateMinutes,
      roundUpToHalfHour(toMinutes(getCurrentTimeValue()))
    );
  }

  return toTimeValue(candidateMinutes);
}

function getShiftedSelectedDay(monthValue: string, selectedDay: string, offset: number): string {
  const [, , dayValue] = selectedDay.split("-").map(Number);
  const shiftedMonthValue = shiftMonthValue(monthValue, offset);
  const { year, monthIndex, daysInMonth } = getMonthBounds(shiftedMonthValue);

  return buildDateValue(year, monthIndex, Math.min(dayValue, daysInMonth));
}

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
  const completedCount = dayAppointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;
  const otherCount = dayAppointments.length - scheduledCount - completedCount;
  const calendarCells = buildMonthCalendar(monthValue, countsByDate, selectedDay);
  const previousMonth = shiftMonthValue(monthValue, -1);
  const nextMonth = shiftMonthValue(monthValue, 1);
  const previousSelectedDay = getShiftedSelectedDay(monthValue, selectedDay, -1);
  const nextSelectedDay = getShiftedSelectedDay(monthValue, selectedDay, 1);
  const todayDateValue = getTodayDateValue();
  const todayMonthValue = todayDateValue.slice(0, 7);
  const selectedDayLabel = formatAppointmentDateLong(selectedDay);
  const quickCreateDefaultTime = getQuickCreateDefaultTime(selectedDay, dayAppointments);
  const isSelectedDayToday = selectedDay === todayDateValue;
  const showTodayShortcut = monthValue !== todayMonthValue || selectedDay !== todayDateValue;
  const monthSummaryText = monthAppointments.length
    ? `${monthAppointments.length} kayıt, ${countsByDate.size} dolu gün`
    : "Bu ay için kayıt görünmüyor.";
  const selectedDaySummaryText = dayAppointments.length
    ? `${dayAppointments.length} kayıt var. ${scheduledCount} planlı, ${completedCount} tamamlandı.`
    : "Seçili gün açık görünüyor. Saat seçip ilk randevuyu açın.";

  return (
    <div className="ops-page-shell">
      <section className="ops-page-header">
        <h1 className="typo-page-title">Randevular</h1>
        <p className="ops-page-intro">Önce günü seçin, ardından seçili gün operasyonunu yönetin.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.14fr)_minmax(360px,0.86fr)] xl:items-start xl:gap-6">
        <Card className="order-1">
          <CardHeader className="gap-3 border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg">{getMonthLabel(monthValue)}</CardTitle>
                <CardDescription>{monthSummaryText}</CardDescription>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {showTodayShortcut ? (
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href={`/ops/staff/randevular?month=${todayMonthValue}&day=${todayDateValue}`}>
                      Bugün
                    </Link>
                  </Button>
                ) : null}

                <Button asChild variant="outline" size="icon" className="rounded-xl" aria-label="Önceki ay">
                  <Link href={`/ops/staff/randevular?month=${previousMonth}&day=${previousSelectedDay}`}>
                    <ChevronLeft className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-xl" aria-label="Sonraki ay">
                  <Link href={`/ops/staff/randevular?month=${nextMonth}&day=${nextSelectedDay}`}>
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
              {calendarCells.map((cell) =>
                cell.kind === "empty" ? (
                  <div
                    key={cell.key}
                    className="min-h-[5.75rem] rounded-[1.35rem] border border-dashed border-border/60 bg-muted/10"
                  />
                ) : (
                  <Link
                    key={cell.key}
                    href={`/ops/staff/randevular?month=${monthValue}&day=${cell.date}`}
                    className={cn(
                      "flex min-h-[5.75rem] flex-col rounded-[1.35rem] border px-3 py-2.5 text-left transition-[transform,background-color,color,border-color,box-shadow] duration-150 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] sm:min-h-28",
                      cell.isSelected
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : cell.count
                          ? "border-border bg-surface-1/85 text-foreground"
                          : "border-border/80 bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold sm:text-base">{cell.dayNumber}</span>
                      <span
                        className={cn(
                          "mt-1 inline-flex size-2 shrink-0 rounded-full",
                          cell.isSelected
                            ? "bg-background"
                            : cell.count
                              ? "bg-foreground"
                              : "bg-border"
                        )}
                        aria-hidden
                      />
                    </div>

                    <div className="mt-auto space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-medium">
                        {cell.isToday ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-1.5 py-0.5",
                              cell.isSelected
                                ? "bg-background/15 text-background"
                                : "bg-foreground text-background"
                            )}
                          >
                            Bugün
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          "text-[11px] leading-none",
                          cell.isSelected
                            ? "text-background/82"
                            : cell.count
                              ? "text-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {cell.count ? `${cell.count} kayıt` : "Açık"}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="order-2 xl:sticky xl:top-20">
          <CardHeader className="gap-4 border-b pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Seçili gün</span>
                  {isSelectedDayToday ? (
                    <Badge variant="outline" className="rounded-full">
                      Bugün
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-lg leading-tight">{selectedDayLabel}</CardTitle>
                <CardDescription>{selectedDaySummaryText}</CardDescription>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-2 text-xs text-muted-foreground sm:flex">
                <Circle className="size-3 fill-current" aria-hidden />
                Gün operasyonu
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-border bg-surface-1/70 px-3 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Planlı
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{scheduledCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1/70 px-3 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tamamlanan
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{completedCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1/70 px-3 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Toplam
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{dayAppointments.length}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            <section className="space-y-3 rounded-[1.6rem] border border-border bg-surface-1/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Hızlı randevu aç</h2>
                  <p className="text-sm text-muted-foreground">
                    Saati seçin, randevuyu seçili güne ekleyin.
                  </p>
                </div>
                <p className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                  Önerilen saat: {quickCreateDefaultTime}
                </p>
              </div>
              <OpsStaffAppointmentCreateForm
                key={`${selectedDay}-${quickCreateDefaultTime}`}
                customerOptions={customerOptions}
                defaultDate={selectedDay}
                defaultDateLabel={selectedDayLabel}
                defaultTime={quickCreateDefaultTime}
                compact
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Günün kayıtları</h2>
                  <p className="text-sm text-muted-foreground">
                    {dayAppointments.length
                      ? `${dayAppointments.length} kayıt görüntüleniyor.`
                      : "Henüz kayıt yok."}
                  </p>
                </div>
                {otherCount > 0 ? (
                  <p className="text-xs text-muted-foreground">{otherCount} kayıt farklı durumda</p>
                ) : null}
              </div>

              {dayAppointments.length ? (
                <div className="space-y-3">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[1.45rem] border border-border bg-card p-4"
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

                      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,15rem)]">
                        <div className="rounded-2xl border border-border bg-surface-1/75 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Not
                          </p>
                          <p className="mt-1 text-sm text-foreground">
                            {appointment.notes ?? "Not eklenmedi."}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {appointment.customerEmail ?? "E-posta yok"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border p-3">
                          <OpsAppointmentStatusForm
                            appointmentId={appointment.id}
                            status={appointment.status}
                            compact
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.45rem] border border-dashed border-border px-4 py-5 text-sm">
                  <p className="font-medium text-foreground">Seçili gün boş.</p>
                  <p className="mt-1 text-muted-foreground">
                    Yukarıdan saat seçip ilk randevuyu açın.
                  </p>
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
