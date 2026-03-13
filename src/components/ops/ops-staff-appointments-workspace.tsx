"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  PencilLine,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteStaffAppointmentAction,
  type OpsAppointmentActionState,
} from "@/app/ops/randevular/actions";
import { OpsStaffAppointmentCreateForm } from "@/components/ops/ops-staff-appointment-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  buildMonthCalendar,
  formatAppointmentDateLong,
  getCurrentTimeValue,
  getMonthLabel,
  getTodayDateValue,
  shiftMonthValue,
} from "@/lib/ops/appointment-calendar";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

const INITIAL_ACTION_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

type AppointmentCustomerOption = {
  id: number;
  label: string;
  email: string | null;
};

type StaffAppointmentView = {
  id: number;
  customerUserId: number;
  customerName: string;
  customerEmail: string | null;
  appointmentDate: string;
  appointmentTime: string;
  notes: string | null;
};

type FormState =
  | {
      mode: "create";
      day: string;
    }
  | {
      mode: "edit";
      appointment: StaffAppointmentView;
    };

type ViewMode = "root" | "day" | "detail" | "create" | "edit";

type OpsStaffAppointmentsWorkspaceProps = {
  monthValue: string;
  initialSelectedDay: string | null;
  appointments: StaffAppointmentView[];
  customerOptions: AppointmentCustomerOption[];
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
  dayAppointments: StaffAppointmentView[]
): string {
  const scheduledMinutes = dayAppointments.map((appointment) => toMinutes(appointment.appointmentTime));

  let candidateMinutes = scheduledMinutes.length ? Math.max(...scheduledMinutes) + 30 : 12 * 60;

  if (selectedDay === getTodayDateValue()) {
    candidateMinutes = Math.max(
      candidateMinutes,
      roundUpToHalfHour(toMinutes(getCurrentTimeValue()))
    );
  }

  return toTimeValue(candidateMinutes);
}

function getAppointmentCountLabel(appointmentCount: number): string {
  if (!appointmentCount) {
    return "0 kayıt";
  }

  if (appointmentCount === 1) {
    return "1 kayıt";
  }

  return `${appointmentCount} kayıt`;
}

function getMonthCellOccupancyLabel(appointmentCount: number): string {
  if (!appointmentCount) {
    return "Boş gün";
  }

  if (appointmentCount === 1) {
    return "Dolu gün";
  }

  if (appointmentCount === 2) {
    return "Orta doluluk";
  }

  return "Yoğun gün";
}

function getOccupancyLevel(appointmentCount: number): "none" | "low" | "medium" | "high" {
  if (!appointmentCount) {
    return "none";
  }

  if (appointmentCount === 1) {
    return "low";
  }

  if (appointmentCount === 2) {
    return "medium";
  }

  return "high";
}

function getOccupancyMarkerClassName(
  appointmentCount: number,
  isSelected: boolean
): string {
  const level = getOccupancyLevel(appointmentCount);

  if (level === "low") {
    return isSelected
      ? "h-1.5 w-6 bg-background shadow-[0_1px_10px_rgba(255,255,255,0.16)]"
      : "h-1.5 w-6 bg-foreground/55";
  }

  if (level === "medium") {
    return isSelected
      ? "h-2 w-10 bg-background shadow-[0_1px_12px_rgba(255,255,255,0.18)]"
      : "h-2 w-10 bg-foreground/78 shadow-[0_1px_6px_rgba(15,23,42,0.14)]";
  }

  return isSelected
    ? "h-2.5 w-14 bg-background shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
    : "h-2.5 w-14 bg-foreground shadow-[0_2px_10px_rgba(15,23,42,0.18)]";
}

function SheetHandle() {
  return <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border/80" aria-hidden />;
}

function AppointmentFab({
  onClick,
  className,
  testId,
}: {
  onClick: () => void;
  className?: string;
  testId?: string;
}) {
  return (
    <Button
      type="button"
      size="icon-lg"
      className={cn("size-14 rounded-full shadow-lg", className)}
      onClick={onClick}
      data-testid={testId}
    >
      <Plus className="size-6" aria-hidden />
      <span className="sr-only">Yeni randevu</span>
    </Button>
  );
}

function AppointmentFormSheet({
  formState,
  customerOptions,
  dayAppointments,
  onOpenChange,
  createMode,
}: {
  formState: FormState | null;
  customerOptions: AppointmentCustomerOption[];
  dayAppointments: StaffAppointmentView[];
  onOpenChange: (open: boolean) => void;
  createMode: boolean;
}) {
  const open = formState !== null;

  if (!formState) {
    return null;
  }

  const defaultDate =
    formState.mode === "create" ? formState.day : formState.appointment.appointmentDate;
  const defaultTime =
    formState.mode === "create"
      ? getQuickCreateDefaultTime(formState.day, dayAppointments)
      : formState.appointment.appointmentTime;
  const defaultCustomerUserId =
    formState.mode === "edit" ? formState.appointment.customerUserId : undefined;
  const defaultNotes = formState.mode === "edit" ? formState.appointment.notes : null;
  const appointmentId = formState.mode === "edit" ? formState.appointment.id : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        data-testid={createMode ? "appointments-create-sheet" : "appointments-edit-sheet"}
        className={cn(
          "mx-auto overflow-hidden rounded-t-[2.1rem] p-0",
          createMode
            ? "max-h-[88vh] w-full max-w-2xl lg:inset-x-auto lg:right-6 lg:left-auto lg:top-20 lg:bottom-6 lg:max-h-none lg:h-[calc(100vh-7rem)] lg:w-[28rem] lg:max-w-[28rem] lg:rounded-[2rem] lg:border"
            : "max-h-[92vh] w-full max-w-3xl lg:inset-x-auto lg:right-6 lg:left-auto lg:top-16 lg:bottom-6 lg:max-h-none lg:h-[calc(100vh-5.5rem)] lg:w-[38rem] lg:max-w-[38rem] lg:rounded-[2rem] lg:border"
        )}
      >
        <div className="flex h-full max-h-[92vh] flex-col bg-background">
          <SheetHandle />
          <SheetHeader className="border-b border-border px-5 py-3 text-left sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle>
                  {formState.mode === "edit" ? "Kaydı düzenle" : "Hızlı randevu"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Tek saatli randevu formu
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button type="button" variant="ghost" size="icon-sm" className="rounded-full">
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            <OpsStaffAppointmentCreateForm
              appointmentId={appointmentId}
              mode={formState.mode}
              customerOptions={customerOptions}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              defaultCustomerUserId={defaultCustomerUserId}
              defaultNotes={defaultNotes}
              dateMode={formState.mode === "edit" ? "editable" : "context"}
              submitLabel={formState.mode === "edit" ? "Kaydı güncelle" : "Randevuyu ekle"}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: {
  appointment: StaffAppointmentView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (appointment: StaffAppointmentView) => void;
  onDeleted: () => void;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteStaffAppointmentAction,
    INITIAL_ACTION_STATE
  );

  useEffect(() => {
    if (deleteState.success) {
      onDeleted();
    }
  }, [deleteState.success, onDeleted]);

  if (!appointment) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        data-testid="appointments-detail-sheet"
        className="mx-auto max-h-[68vh] w-full max-w-xl overflow-hidden rounded-t-[2rem] p-0 lg:inset-x-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:bottom-auto lg:max-h-[70vh] lg:w-[30rem] lg:max-w-[30rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[2rem] lg:border"
      >
        <div className="flex h-full max-h-[68vh] flex-col bg-background lg:max-h-[70vh]">
          <SheetHandle />
          <SheetHeader className="border-b border-border bg-surface-1/40 px-5 py-3 text-left sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle>Randevu detayı</SheetTitle>
                <SheetDescription className="sr-only">
                  Randevu detayları ve işlemler
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button type="button" variant="ghost" size="icon-sm" className="rounded-full">
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
            <section className="space-y-4 rounded-[1.7rem] border border-border bg-surface-1/70 p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Müşteri
                </p>
                <p className="text-xl font-semibold text-foreground">{appointment.customerName}</p>
                {appointment.customerEmail ? (
                  <p className="text-sm text-muted-foreground">{appointment.customerEmail}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium">
                  <CalendarDays className="size-4" aria-hidden />
                  {formatAppointmentDateLong(appointment.appointmentDate)}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium">
                  <Clock3 className="size-4" aria-hidden />
                  {appointment.appointmentTime}
                </Badge>
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Not
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {appointment.notes ?? "Not yok."}
              </p>
            </section>

            {deleteState.error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {deleteState.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="cta"
                variant="outline"
                className="w-full sm:flex-1"
                disabled={deletePending}
                onClick={() => onEdit(appointment)}
              >
                <PencilLine className="size-4" aria-hidden />
                Düzenle
              </Button>

              <form
                action={deleteAction}
                className="w-full sm:flex-1"
                onSubmit={(event) => {
                  if (!window.confirm("Bu randevuyu silmek istiyor musunuz?")) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="appointmentId" value={appointment.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  size="cta"
                  className="w-full"
                  disabled={deletePending}
                >
                  {deletePending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      Siliniyor
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" aria-hidden />
                      Sil
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OpsStaffAppointmentsWorkspace({
  monthValue,
  initialSelectedDay,
  appointments,
  customerOptions,
}: OpsStaffAppointmentsWorkspaceProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(initialSelectedDay);
  const [viewMode, setViewMode] = useState<ViewMode>("root");
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [returnToDayAfterForm, setReturnToDayAfterForm] = useState(false);

  const countsByDate = new Map<string, number>();

  for (const appointment of appointments) {
    countsByDate.set(
      appointment.appointmentDate,
      (countsByDate.get(appointment.appointmentDate) ?? 0) + 1
    );
  }

  const calendarCells = buildMonthCalendar(monthValue, countsByDate, selectedDay ?? "");
  const previousMonth = shiftMonthValue(monthValue, -1);
  const nextMonth = shiftMonthValue(monthValue, 1);
  const todayDateValue = getTodayDateValue();
  const todayMonthValue = todayDateValue.slice(0, 7);
  const showTodayShortcut = monthValue !== todayMonthValue;
  const selectedDayAppointments = selectedDay
    ? appointments.filter((appointment) => appointment.appointmentDate === selectedDay)
    : [];
  const selectedDayLabel = selectedDay ? formatAppointmentDateLong(selectedDay) : "";
  const recommendedTime = selectedDay
    ? getQuickCreateDefaultTime(selectedDay, selectedDayAppointments)
    : null;
  const activeAppointment =
    activeAppointmentId === null
      ? null
      : appointments.find((appointment) => appointment.id === activeAppointmentId) ?? null;
  const rootFabDay = selectedDay ?? todayDateValue;
  const showRootFab = viewMode === "root";
  const showDayFab = viewMode === "day" && Boolean(selectedDay);

  function handleDaySelect(day: string) {
    setSelectedDay(day);
    setActiveAppointmentId(null);
    setFormState(null);
    setViewMode("day");
  }

  function handleDayAgendaOpenChange(open: boolean) {
    if (!open) {
      setActiveAppointmentId(null);
      setFormState(null);
      setViewMode("root");
    }
  }

  function handleDetailOpenChange(open: boolean) {
    if (!open) {
      setActiveAppointmentId(null);
      setViewMode("day");
    }
  }

  function handleFormOpenChange(open: boolean) {
    if (!open) {
      setFormState(null);
      setViewMode(returnToDayAfterForm && selectedDay ? "day" : "root");
    }
  }

  function handleEditFromDetail(appointment: StaffAppointmentView) {
    setReturnToDayAfterForm(true);
    setFormState({
      mode: "edit",
      appointment,
    });
    setActiveAppointmentId(null);
    setViewMode("edit");
  }

  function handleDeleteComplete() {
    setActiveAppointmentId(null);
    setViewMode("day");
  }

  function startCreateForDay(day: string, fromDaySheet: boolean) {
    setSelectedDay(day);
    setReturnToDayAfterForm(fromDaySheet);
    setFormState({
      mode: "create",
      day,
    });
    setViewMode("create");
  }

  function handleAppointmentOpen(appointmentId: number) {
    setActiveAppointmentId(appointmentId);
    setViewMode("detail");
  }

  return (
    <div className="ops-page-shell xl:space-y-4" data-testid="appointments-workspace" data-view-mode={viewMode}>
      <Card
        className="-mx-4 -mt-3 overflow-hidden rounded-none border-x-0 border-t-0 shadow-none sm:-mx-6 sm:-mt-4 lg:mx-0 lg:mt-0 lg:rounded-[2rem] lg:border lg:border-border/80 lg:bg-card lg:shadow-sm"
        data-testid="appointments-month-card"
      >
        <CardHeader className="border-b px-2.5 py-2.5 sm:px-3 sm:py-3 lg:px-6 lg:py-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base sm:text-lg xl:text-xl">{getMonthLabel(monthValue)}</CardTitle>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {showTodayShortcut ? (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href={`/ops/staff/randevular?month=${todayMonthValue}`}>Bugün</Link>
                </Button>
              ) : null}

              <Button asChild variant="outline" size="icon-sm" className="rounded-xl" aria-label="Önceki ay">
                <Link href={`/ops/staff/randevular?month=${previousMonth}`}>
                  <ChevronLeft className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon-sm" className="rounded-xl" aria-label="Sonraki ay">
                <Link href={`/ops/staff/randevular?month=${nextMonth}`}>
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:gap-1.5 sm:text-[11px] lg:gap-2.5 xl:gap-3">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-2 pt-2.5 pb-24 sm:px-3 sm:pt-3 sm:pb-28 lg:px-6 lg:pt-4 lg:pb-6">
          <div
            className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2.5 xl:gap-3"
            data-testid="appointments-month-grid"
          >
            {calendarCells.map((cell) =>
              cell.kind === "empty" ? (
                <div
                  key={cell.key}
                  className="min-h-[5.25rem] rounded-[1.2rem] border border-dashed border-border/60 bg-muted/10 sm:min-h-28 xl:min-h-[8.75rem]"
                />
              ) : (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleDaySelect(cell.date)}
                  aria-pressed={cell.isSelected}
                  aria-label={`${cell.dayNumber} ${getMonthCellOccupancyLabel(cell.count)}`}
                  data-testid={`month-cell-${cell.date}`}
                  data-selected={cell.isSelected ? "true" : "false"}
                  data-today={cell.isToday ? "true" : "false"}
                  data-count={cell.count}
                  data-occupancy={getOccupancyLevel(cell.count)}
                  className={cn(
                    "group relative isolate flex min-h-[5.3rem] w-full flex-col overflow-hidden rounded-[1.25rem] border px-1.5 py-1.5 text-left transition-[transform,background-color,color,border-color,box-shadow] duration-150 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] sm:min-h-28 sm:px-2.5 sm:py-2.5 xl:min-h-[8.75rem] xl:px-4 xl:py-3",
                    cell.isSelected
                      ? "border-foreground bg-foreground text-background shadow-[0_10px_30px_rgba(15,23,42,0.22)]"
                      : cell.count
                        ? "border-foreground/20 bg-surface-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.34)]"
                        : "border-border/85 bg-card text-foreground"
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                    <span
                      data-testid={`month-cell-day-${cell.date}`}
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold sm:size-8 sm:text-base xl:size-10 xl:text-lg",
                        cell.isToday && cell.isSelected
                          ? "bg-background text-foreground ring-2 ring-background/65 shadow-sm"
                        : cell.isToday
                            ? "bg-background text-foreground ring-2 ring-foreground/28"
                            : "bg-transparent"
                      )}
                    >
                      {cell.dayNumber}
                    </span>
                  </div>

                  {cell.count ? (
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center sm:bottom-3.5"
                      aria-hidden
                    >
                      <span
                        data-testid={`month-cell-occupancy-${cell.date}`}
                        className={cn(
                          "inline-flex rounded-full transition-[width,height,background-color,box-shadow] duration-150",
                          getOccupancyMarkerClassName(cell.count, cell.isSelected)
                        )}
                      />
                    </span>
                  ) : null}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {showRootFab ? (
        <AppointmentFab
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-20 sm:right-5 lg:right-8 md:bottom-6"
          onClick={() => startCreateForDay(rootFabDay, false)}
          testId="appointments-root-fab"
        />
      ) : null}

      <Sheet open={viewMode === "day"} onOpenChange={handleDayAgendaOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          data-testid="appointments-day-sheet"
          className="mx-auto max-h-[60vh] w-full max-w-2xl overflow-hidden rounded-t-[2rem] p-0 lg:inset-y-6 lg:left-auto lg:right-6 lg:bottom-6 lg:top-20 lg:max-h-none lg:h-[calc(100vh-7rem)] lg:w-[26rem] lg:max-w-[26rem] lg:rounded-[2rem] lg:border"
        >
          <div className="flex h-full max-h-[60vh] flex-col bg-background lg:max-h-none">
            <SheetHandle />
            <SheetHeader className="border-b border-border px-5 py-2.5 text-left sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <SheetTitle>{selectedDayLabel || "Gün ajandası"}</SheetTitle>
                  <SheetDescription className="sr-only">Gün ajandası</SheetDescription>
                </div>
                <SheetClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm" className="rounded-full">
                    <X className="size-4" aria-hidden />
                    <span className="sr-only">Kapat</span>
                  </Button>
                </SheetClose>
              </div>
              {selectedDayAppointments.length ? (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full">
                    {getAppointmentCountLabel(selectedDayAppointments.length)}
                  </Badge>
                  {recommendedTime ? (
                    <Badge variant="outline" className="rounded-full">
                      Yeni {recommendedTime}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </SheetHeader>

            <div className="relative flex-1 overflow-y-auto px-5 py-3 sm:px-6">
              {selectedDayAppointments.length ? (
                <div className="space-y-2 pb-24">
                  {selectedDayAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => handleAppointmentOpen(appointment.id)}
                      data-testid={`day-appointment-${appointment.id}`}
                      className="w-full rounded-[1.45rem] border border-border bg-card px-3.5 py-3.5 text-left transition-[transform,background-color,border-color,box-shadow] duration-150 hover:bg-surface-1/65 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex min-h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-surface-1/80 text-foreground">
                          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Saat
                          </span>
                          <span className="mt-0.5 text-base font-semibold font-numbers">
                            {appointment.appointmentTime}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-base font-semibold text-foreground">
                              {appointment.customerName}
                            </p>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          </div>
                          {appointment.notes ? (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {appointment.notes}
                            </p>
                          ) : null}
                          {appointment.customerEmail ? (
                            <p className="mt-1 hidden truncate text-[11px] text-muted-foreground/68 sm:block">
                              {appointment.customerEmail}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.45rem] border border-dashed border-border px-4 py-3 text-sm text-foreground">
                  Bu gün boş.
                </div>
              )}

              {showDayFab ? (
                <AppointmentFab
                  className="absolute right-1 bottom-3 sm:right-2 sm:bottom-4"
                  onClick={() => startCreateForDay(selectedDay as string, true)}
                  testId="appointments-day-fab"
                />
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AppointmentDetailSheet
        appointment={activeAppointment}
        open={viewMode === "detail" && activeAppointment !== null}
        onOpenChange={handleDetailOpenChange}
        onEdit={handleEditFromDetail}
        onDeleted={handleDeleteComplete}
      />

      <AppointmentFormSheet
        formState={viewMode === "create" || viewMode === "edit" ? formState : null}
        customerOptions={customerOptions}
        dayAppointments={formState?.mode === "create" && selectedDay ? selectedDayAppointments : []}
        onOpenChange={handleFormOpenChange}
        createMode={viewMode === "create"}
      />
    </div>
  );
}
