"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { UserRole } from "@/db/schema/users";
import { formatOpsMoneyDisplay } from "@/lib/ops/money";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

const INITIAL_ACTION_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

const UNASSIGNED_ARTIST_LABEL = "Kayıtlı değil";

type AppointmentCustomerOption = {
  id: number;
  label: string;
  email: string | null;
};

type StaffServiceSummary = {
  id: number;
  artistUserId: number | null;
  artistName: string | null;
  serviceType: "tattoo" | "piercing";
  totalAmountCents: number;
  collectedAmountCents: number;
};

type StaffServiceSessionView = {
  id: number;
  source: "appointment" | "walk_in";
  appointmentId: number | null;
  serviceIntakeId: number | null;
  customerUserId: number;
  customerName: string;
  customerEmail: string | null;
  scheduledDate: string;
  scheduledTime: string;
  notes: string | null;
  serviceSummary: StaffServiceSummary | null;
};

type FormState =
  | {
      mode: "create";
      day: string;
    }
  | {
      mode: "edit";
      session: StaffServiceSessionView;
    };

type ViewMode = "root" | "detail" | "create" | "edit";

type OpsStaffAppointmentsWorkspaceProps = {
  monthValue: string;
  initialSelectedDay: string | null;
  sessions: StaffServiceSessionView[];
  customerOptions: AppointmentCustomerOption[];
  artistOptions: Array<{
    id: number;
    label: string;
  }>;
  currentStaffUserId: number;
  currentStaffRoles: UserRole[];
};

function sortCustomerOptions(options: AppointmentCustomerOption[]): AppointmentCustomerOption[] {
  return [...options].sort((left, right) => {
    const leftValue = left.email ? `${left.label} ${left.email}` : left.label;
    const rightValue = right.email ? `${right.label} ${right.email}` : right.label;

    return leftValue.localeCompare(rightValue, "tr");
  });
}

function getSessionKey(session: Pick<StaffServiceSessionView, "source" | "id">): string {
  return `${session.source}:${session.id}`;
}

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
  daySessions: StaffServiceSessionView[]
): string {
  const scheduledMinutes = daySessions.map((session) => toMinutes(session.scheduledTime));

  let candidateMinutes = scheduledMinutes.length ? Math.max(...scheduledMinutes) + 30 : 12 * 60;

  if (selectedDay === getTodayDateValue()) {
    candidateMinutes = Math.max(
      candidateMinutes,
      roundUpToHalfHour(toMinutes(getCurrentTimeValue()))
    );
  }

  return toTimeValue(candidateMinutes);
}

function compareSessions(
  left: Pick<StaffServiceSessionView, "scheduledTime" | "source" | "id">,
  right: Pick<StaffServiceSessionView, "scheduledTime" | "source" | "id">
): number {
  if (left.scheduledTime !== right.scheduledTime) {
    return left.scheduledTime.localeCompare(right.scheduledTime);
  }

  if (left.source !== right.source) {
    return left.source === "appointment" ? -1 : 1;
  }

  return left.id - right.id;
}

function getAppointmentCountLabel(appointmentCount: number): string {
  if (!appointmentCount) {
    return "İşlem yok";
  }

  if (appointmentCount === 1) {
    return "1 işlem";
  }

  return `${appointmentCount} işlem`;
}

function getServiceTypeLabel(value: StaffServiceSummary["serviceType"]): string {
  return value === "piercing" ? "Piercing" : "Dövme";
}

function getRemainingAmountCents(serviceSummary: StaffServiceSummary): number {
  return Math.max(0, serviceSummary.totalAmountCents - serviceSummary.collectedAmountCents);
}

function getMonthCellOccupancyLabel(appointmentCount: number): string {
  if (!appointmentCount) {
    return "İşlem yok";
  }

  if (appointmentCount === 1) {
    return "Hafif yoğunluk";
  }

  if (appointmentCount === 2) {
    return "Orta yoğunluk";
  }

  return "Yoğun";
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

function getOccupancyMarkerClassName(appointmentCount: number, isSelected: boolean): string {
  const level = getOccupancyLevel(appointmentCount);

  if (level === "low") {
    return isSelected
      ? "h-1.5 w-6 bg-background shadow-[0_1px_10px_rgba(255,255,255,0.18)]"
      : "h-1.5 w-6 bg-foreground/42";
  }

  if (level === "medium") {
    return isSelected
      ? "h-2 w-10 bg-background shadow-[0_1px_12px_rgba(255,255,255,0.2)]"
      : "h-2 w-10 bg-foreground/65 shadow-[0_1px_6px_rgba(15,23,42,0.12)]";
  }

  return isSelected
    ? "h-2.5 w-14 bg-background shadow-[0_2px_14px_rgba(255,255,255,0.22)]"
    : "h-2.5 w-14 bg-foreground/88 shadow-[0_2px_10px_rgba(15,23,42,0.14)]";
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
      <span className="sr-only">Yeni işlem</span>
    </Button>
  );
}

function AppointmentServiceSummarySection({
  serviceSummary,
  emptyMessage,
}: {
  serviceSummary: StaffServiceSummary | null;
  emptyMessage: string;
}) {
  return (
    <section className="rounded-[1.55rem] border border-border bg-card p-3.5 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        İşlem özeti
      </p>

      {serviceSummary ? (
        <div className="mt-3 space-y-2.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-1/35 px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                İşlem tipi
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {getServiceTypeLabel(serviceSummary.serviceType)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-1/35 px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Artist
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {serviceSummary.artistName ?? UNASSIGNED_ARTIST_LABEL}
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-border px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Toplam
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatOpsMoneyDisplay(serviceSummary.totalAmountCents)}
              </p>
            </div>

            <div className="rounded-2xl border border-border px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kapora
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatOpsMoneyDisplay(serviceSummary.collectedAmountCents)}
              </p>
            </div>

            <div className="rounded-2xl border border-border px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kalan
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatOpsMoneyDisplay(getRemainingAmountCents(serviceSummary))}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function AppointmentContextCard({
  customerName,
  scheduledDate,
  scheduledTime,
}: {
  customerName: string;
  scheduledDate: string;
  scheduledTime: string;
}) {
  return (
    <section className="rounded-[1.55rem] border border-border bg-surface-1/45 px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Müşteri
          </p>
          <p className="text-base font-semibold text-foreground">{customerName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium">
            <CalendarDays className="size-4" aria-hidden />
            {formatAppointmentDateLong(scheduledDate)}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium">
            <Clock3 className="size-4" aria-hidden />
            {scheduledTime}
          </Badge>
        </div>
      </div>
    </section>
  );
}

function AppointmentFormSheet({
  formState,
  customerOptions,
  artistOptions,
  currentStaffUserId,
  currentStaffRoles,
  daySessions,
  onOpenChange,
  createMode,
  onCustomerCreated,
}: {
  formState: FormState | null;
  customerOptions: AppointmentCustomerOption[];
  artistOptions: Array<{
    id: number;
    label: string;
  }>;
  currentStaffUserId: number;
  currentStaffRoles: UserRole[];
  daySessions: StaffServiceSessionView[];
  onOpenChange: (open: boolean) => void;
  createMode: boolean;
  onCustomerCreated: (customer: AppointmentCustomerOption) => void;
}) {
  const open = formState !== null;

  if (!formState) {
    return null;
  }

  const defaultDate =
    formState.mode === "create" ? formState.day : formState.session.scheduledDate;
  const defaultTime =
    formState.mode === "create"
      ? getQuickCreateDefaultTime(formState.day, daySessions)
      : formState.session.scheduledTime;
  const defaultCustomerUserId =
    formState.mode === "edit" ? formState.session.customerUserId : undefined;
  const defaultArtistUserId =
    formState.mode === "edit" ? formState.session.serviceSummary?.artistUserId : undefined;
  const defaultNotes = formState.mode === "edit" ? formState.session.notes : null;
  const defaultServiceType =
    formState.mode === "edit" ? formState.session.serviceSummary?.serviceType : "tattoo";
  const defaultTotalAmountCents =
    formState.mode === "edit" ? formState.session.serviceSummary?.totalAmountCents : null;
  const defaultCollectedAmountCents =
    formState.mode === "edit" ? formState.session.serviceSummary?.collectedAmountCents : null;
  const appointmentId =
    formState.mode === "edit" && formState.session.source === "appointment"
      ? formState.session.appointmentId ?? formState.session.id
      : undefined;
  const serviceIntakeId =
    formState.mode === "edit"
      ? (formState.session.serviceIntakeId ?? formState.session.serviceSummary?.id ?? undefined)
      : undefined;
  const source = formState.mode === "edit" ? formState.session.source : "appointment";

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
            : "max-h-[90vh] w-full max-w-3xl lg:inset-x-auto lg:right-6 lg:left-auto lg:top-16 lg:bottom-6 lg:max-h-none lg:h-[calc(100vh-5.5rem)] lg:w-[36rem] lg:max-w-[36rem] lg:rounded-[2rem] lg:border"
        )}
      >
        <div className="flex h-full max-h-[92vh] flex-col bg-background">
          <SheetHandle />
          <SheetHeader className="border-b border-border px-5 py-3 text-left sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle>
                  {formState.mode === "edit" ? "İşlemi düzenle" : "Yeni işlem"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Personel işlem workspace formu
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

          <div className="overflow-y-auto px-5 py-4 pb-5 sm:px-6">
            {formState.mode === "edit" ? (
              <div className="mb-3 space-y-3">
                <AppointmentContextCard
                  customerName={formState.session.customerName}
                  scheduledDate={formState.session.scheduledDate}
                  scheduledTime={formState.session.scheduledTime}
                />

                <AppointmentServiceSummarySection
                  serviceSummary={formState.session.serviceSummary}
                  emptyMessage="Bağlı işlem özeti yok."
                />
              </div>
            ) : null}

            <OpsStaffAppointmentCreateForm
              key={
                formState.mode === "edit"
                  ? `${formState.session.source}-${formState.session.id}`
                  : `create-${formState.day}`
              }
              appointmentId={appointmentId}
              serviceIntakeId={serviceIntakeId}
              source={source}
              mode={formState.mode}
              customerOptions={customerOptions}
              artistOptions={artistOptions}
              currentStaffUserId={currentStaffUserId}
              currentStaffRoles={currentStaffRoles}
              onCustomerCreated={onCustomerCreated}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              defaultCustomerUserId={defaultCustomerUserId}
              defaultArtistUserId={defaultArtistUserId}
              defaultNotes={defaultNotes}
              defaultServiceType={defaultServiceType}
              defaultTotalAmountCents={defaultTotalAmountCents}
              defaultCollectedAmountCents={defaultCollectedAmountCents}
              dateMode={formState.mode === "edit" ? "editable" : "context"}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AppointmentDetailSheet({
  session,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: {
  session: StaffServiceSessionView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (session: StaffServiceSessionView) => void;
  onDeleted: () => void;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteStaffAppointmentAction,
    INITIAL_ACTION_STATE
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const effectiveDeleteDialogOpen = open && deleteDialogOpen && !deleteState.success;

  useEffect(() => {
    if (deleteState.success) {
      onDeleted();
    }
  }, [deleteState.success, onDeleted]);

  if (!session) {
    return null;
  }

  const canDelete = session.source === "appointment" && session.appointmentId !== null;
  const canOpenPacket = session.serviceIntakeId !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        data-testid="appointments-detail-sheet"
        className="mx-auto max-h-[76vh] w-full max-w-xl overflow-hidden rounded-t-[2rem] p-0 lg:inset-x-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:bottom-auto lg:max-h-[78vh] lg:w-[29rem] lg:max-w-[29rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[2rem] lg:border"
      >
        <div className="flex h-full max-h-[76vh] flex-col bg-background lg:max-h-[78vh]">
          <SheetHandle />
          <SheetHeader className="border-b border-border bg-surface-1/40 px-5 py-3 text-left sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <SheetTitle>İşlem detayı</SheetTitle>
                <SheetDescription className="sr-only">
                  İşlem detayları ve aksiyonlar
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

          <div className="space-y-3.5 overflow-y-auto px-5 py-4 pb-5 sm:px-6">
            <AppointmentContextCard
              customerName={session.customerName}
              scheduledDate={session.scheduledDate}
              scheduledTime={session.scheduledTime}
            />

            <AppointmentServiceSummarySection
              serviceSummary={session.serviceSummary}
              emptyMessage="Bağlı işlem özeti yok."
            />

            <section className="rounded-[1.55rem] border border-border bg-card p-3.5 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Not
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {session.notes ?? "Not yok."}
              </p>
            </section>

            {deleteState.error && canDelete ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {deleteState.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-border pt-2.5">
              {canOpenPacket ? (
                <Button asChild size="cta" className="w-full">
                  <Link href={`/ops/staff/belgeler/${session.serviceIntakeId}`}>
                    Belge paketi
                  </Link>
                </Button>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  size="cta"
                  variant="outline"
                  className="w-full"
                  disabled={deletePending}
                  onClick={() => onEdit(session)}
                >
                  <PencilLine className="size-4" aria-hidden />
                  Düzenle
                </Button>

                {canDelete ? (
                  <div className="w-full border-t border-border/60 pt-3">
                    <Button
                      type="button"
                      variant="destructive"
                      size="cta"
                      className="w-full"
                      disabled={deletePending}
                      onClick={() => setDeleteDialogOpen(true)}
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
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>

      {canDelete ? (
        <Dialog open={effectiveDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>İşlemi sil</DialogTitle>
              <DialogDescription>
                Bu işlem silinecek. Bağlı kayıt yalnız bu işlem akışına aitse birlikte kaldırılır.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-border bg-surface-1/45 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{session.customerName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatAppointmentDateLong(session.scheduledDate)} · {session.scheduledTime}
              </p>
            </div>

            {deleteState.error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {deleteState.error}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deletePending}
              >
                Vazgeç
              </Button>

              <form action={deleteAction}>
                <input type="hidden" name="appointmentId" value={session.appointmentId ?? ""} />
                <Button type="submit" variant="destructive" disabled={deletePending}>
                  {deletePending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                      Siliniyor
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" aria-hidden />
                      İşlemi sil
                    </>
                  )}
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </Sheet>
  );
}

function AppointmentDayWorkspacePanel({
  selectedDay,
  selectedDayLabel,
  selectedDaySessions,
  recommendedTime,
  onSessionOpen,
  onCreate,
  className,
}: {
  selectedDay: string | null;
  selectedDayLabel: string;
  selectedDaySessions: StaffServiceSessionView[];
  recommendedTime: string | null;
  onSessionOpen: (session: StaffServiceSessionView) => void;
  onCreate: () => void;
  className?: string;
}) {
  if (!selectedDay) {
    return null;
  }

  return (
    <Card className={cn("order-2 overflow-hidden xl:sticky xl:top-24", className)}>
      <CardHeader className="gap-3 border-b bg-surface-1/35 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Seçili gün
            </p>
            <CardTitle className="text-base leading-tight sm:text-lg">
              {selectedDayLabel || "Gün workspace"}
            </CardTitle>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="hidden rounded-xl xl:inline-flex"
            onClick={onCreate}
          >
            <Plus className="size-4" aria-hidden />
            Yeni işlem
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <p className="font-medium text-foreground">
            {getAppointmentCountLabel(selectedDaySessions.length)}
          </p>
          {recommendedTime ? (
            <p className="text-muted-foreground">Yeni işlem için {recommendedTime} uygun.</p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="px-4 py-4 sm:px-5">
        {selectedDaySessions.length ? (
          <div className="space-y-2.5">
            {selectedDaySessions.map((session) => (
              <button
                key={getSessionKey(session)}
                type="button"
                onClick={() => onSessionOpen(session)}
                data-testid={`day-appointment-${getSessionKey(session)}`}
                className="w-full rounded-[1.45rem] border border-border bg-card px-3.5 py-3.5 text-left transition-[transform,background-color,border-color,box-shadow] duration-150 hover:bg-surface-1/65 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex min-h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-surface-1/80 text-foreground">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Saat
                    </span>
                    <span className="mt-0.5 text-base font-semibold font-numbers">
                      {session.scheduledTime}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {session.customerName}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {session.serviceSummary ? (
                            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                              {getServiceTypeLabel(session.serviceSummary.serviceType)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <ChevronRightIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </div>

                    {session.notes ? (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {session.notes}
                      </p>
                    ) : null}

                    {session.customerEmail ? (
                      <p className="mt-1 hidden truncate text-[11px] text-muted-foreground/68 sm:block">
                        {session.customerEmail}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.45rem] border border-dashed border-border bg-surface-1/20 px-4 py-4">
            <p className="text-sm font-medium text-foreground">Seçili gün için işlem yok.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Takvimden başka bir gün seçin veya bu gün için yeni işlem açın.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OpsStaffAppointmentsWorkspace({
  monthValue,
  initialSelectedDay,
  sessions,
  customerOptions,
  artistOptions,
  currentStaffUserId,
  currentStaffRoles,
}: OpsStaffAppointmentsWorkspaceProps) {
  const [availableCustomerOptions, setAvailableCustomerOptions] = useState(() =>
    sortCustomerOptions(customerOptions)
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(initialSelectedDay);
  const [viewMode, setViewMode] = useState<ViewMode>("root");
  const [activeSessionKey, setActiveSessionKey] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);

  useEffect(() => {
    setAvailableCustomerOptions(sortCustomerOptions(customerOptions));
  }, [customerOptions]);

  useEffect(() => {
    setSelectedDay(initialSelectedDay);
  }, [initialSelectedDay]);

  const countsByDate = new Map<string, number>();

  for (const session of sessions) {
    countsByDate.set(
      session.scheduledDate,
      (countsByDate.get(session.scheduledDate) ?? 0) + 1
    );
  }

  const calendarCells = buildMonthCalendar(monthValue, countsByDate, selectedDay ?? "");
  const previousMonth = shiftMonthValue(monthValue, -1);
  const nextMonth = shiftMonthValue(monthValue, 1);
  const todayDateValue = getTodayDateValue();
  const todayMonthValue = todayDateValue.slice(0, 7);
  const showTodayShortcut = monthValue !== todayMonthValue;
  const selectedDaySessions = selectedDay
    ? sessions
        .filter((session) => session.scheduledDate === selectedDay)
        .sort(compareSessions)
    : [];
  const selectedDayLabel = selectedDay ? formatAppointmentDateLong(selectedDay) : "";
  const recommendedTime = selectedDay
    ? getQuickCreateDefaultTime(selectedDay, selectedDaySessions)
    : null;
  const activeSession =
    activeSessionKey === null
      ? null
      : sessions.find((session) => getSessionKey(session) === activeSessionKey) ?? null;
  const rootFabDay = selectedDay ?? todayDateValue;
  const showRootFab = viewMode === "root";

  function handleDaySelect(day: string) {
    setSelectedDay(day);
    setActiveSessionKey(null);
    setFormState(null);
    setViewMode("root");
  }

  function handleDetailOpenChange(open: boolean) {
    if (!open) {
      setActiveSessionKey(null);
      setViewMode("root");
    }
  }

  function handleFormOpenChange(open: boolean) {
    if (!open) {
      setFormState(null);
      setViewMode("root");
    }
  }

  function handleEditFromDetail(session: StaffServiceSessionView) {
    setFormState({
      mode: "edit",
      session,
    });
    setActiveSessionKey(null);
    setViewMode("edit");
  }

  function handleDeleteComplete() {
    setActiveSessionKey(null);
    setFormState(null);
    setViewMode("root");
  }

  function startCreateForDay(day: string) {
    setSelectedDay(day);
    setFormState({
      mode: "create",
      day,
    });
    setViewMode("create");
  }

  function handleSessionOpen(session: StaffServiceSessionView) {
    setActiveSessionKey(getSessionKey(session));
    setViewMode("detail");
  }

  return (
    <div
      className="ops-page-shell relative"
      data-testid="appointments-workspace"
      data-view-mode={viewMode}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(24rem,0.8fr)] xl:items-start xl:gap-5">
        <Card
          className="-mx-4 -mt-3 order-1 gap-0 overflow-hidden rounded-none border-x-0 border-t-0 py-0 shadow-none sm:-mx-6 sm:-mt-4 md:gap-6 md:py-4 lg:mx-0 lg:mt-0 lg:rounded-[2rem] lg:border lg:border-border/80 lg:bg-card lg:shadow-sm xl:py-5"
          data-testid="appointments-month-card"
        >
          <CardHeader className="border-b px-1.5 py-2.5 sm:px-3 sm:py-3 lg:px-6 lg:py-4 xl:px-7 2xl:px-8">
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

          <CardContent className="px-1 pt-2 pb-4 sm:px-3 sm:pt-3 sm:pb-5 lg:px-6 lg:pt-4 lg:pb-5 xl:px-7 2xl:px-8">
            <div
              className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2.5 xl:gap-3"
              data-testid="appointments-month-grid"
            >
              {calendarCells.map((cell) =>
                cell.kind === "empty" ? (
                  <div
                    key={cell.key}
                    className="min-h-[4.4rem] rounded-[1.15rem] border border-transparent bg-transparent sm:min-h-24 xl:min-h-[8.25rem]"
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
                      "group relative isolate flex min-h-[4.45rem] w-full flex-col overflow-hidden rounded-[1.15rem] border px-1.5 py-1.5 text-left transition-[transform,background-color,color,border-color,box-shadow] duration-150 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] sm:min-h-24 sm:px-2.5 sm:py-2.5 xl:min-h-[8.25rem] xl:px-4 xl:py-3",
                      cell.isSelected
                        ? "border-foreground bg-foreground text-background shadow-[0_18px_40px_rgba(15,23,42,0.24)] ring-2 ring-foreground/12"
                        : cell.count
                          ? "border-foreground/18 bg-surface-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.34)]"
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
                              ? "bg-background text-foreground ring-2 ring-foreground/34"
                              : "bg-transparent"
                        )}
                      >
                        {cell.dayNumber}
                      </span>
                    </div>

                    {cell.count ? (
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center sm:bottom-3"
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

        <AppointmentDayWorkspacePanel
          selectedDay={selectedDay}
          selectedDayLabel={selectedDayLabel}
          selectedDaySessions={selectedDaySessions}
          recommendedTime={recommendedTime}
          onSessionOpen={handleSessionOpen}
          onCreate={() => startCreateForDay(selectedDay as string)}
        />
      </div>

      {showRootFab ? (
        <AppointmentFab
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+4.4rem)] z-20 shadow-[0_18px_34px_rgba(15,23,42,0.2)] sm:right-5 sm:bottom-[calc(env(safe-area-inset-bottom)+4.55rem)] md:bottom-6 xl:hidden"
          onClick={() => startCreateForDay(rootFabDay)}
          testId="appointments-root-fab"
        />
      ) : null}

      <AppointmentDetailSheet
        key={activeSession ? getSessionKey(activeSession) : "empty"}
        session={activeSession}
        open={viewMode === "detail" && activeSession !== null}
        onOpenChange={handleDetailOpenChange}
        onEdit={handleEditFromDetail}
        onDeleted={handleDeleteComplete}
      />

      <AppointmentFormSheet
        formState={viewMode === "create" || viewMode === "edit" ? formState : null}
        customerOptions={availableCustomerOptions}
        artistOptions={artistOptions}
        currentStaffUserId={currentStaffUserId}
        currentStaffRoles={currentStaffRoles}
        daySessions={formState?.mode === "create" && selectedDay ? selectedDaySessions : []}
        onOpenChange={handleFormOpenChange}
        createMode={viewMode === "create"}
        onCustomerCreated={(customer) => {
          setAvailableCustomerOptions((current) => {
            const withoutDuplicate = current.filter((option) => option.id !== customer.id);
            return sortCustomerOptions([...withoutDuplicate, customer]);
          });
        }}
      />
    </div>
  );
}
