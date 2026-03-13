"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { CalendarDays, Clock3, LoaderCircle } from "lucide-react";
import {
  createStaffAppointmentAction,
  type OpsAppointmentActionState,
  updateStaffAppointmentAction,
} from "@/app/ops/randevular/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAppointmentDateLong } from "@/lib/ops/appointment-calendar";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

type StaffAppointmentCreateFormProps = {
  customerOptions: Array<{
    id: number;
    label: string;
    email: string | null;
  }>;
  defaultDate: string;
  defaultTime: string;
  defaultCustomerUserId?: number;
  defaultNotes?: string | null;
  appointmentId?: number;
  mode?: "create" | "edit";
  submitLabel?: string;
  onSuccess?: () => void;
  dateMode?: "context" | "editable";
};

export function OpsStaffAppointmentCreateForm({
  customerOptions,
  defaultDate,
  defaultTime,
  defaultCustomerUserId,
  defaultNotes,
  appointmentId,
  mode = "create",
  submitLabel,
  onSuccess,
  dateMode = "editable",
}: StaffAppointmentCreateFormProps) {
  const action = mode === "edit" ? updateStaffAppointmentAction : createStaffAppointmentAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const isDisabled = pending;

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  if (!customerOptions.length) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background/80 p-4 text-sm">
          <p className="font-medium text-foreground">Seçilebilir müşteri yok.</p>
        </div>

        <Button asChild size="cta" className="w-full sm:w-auto">
          <Link href="/ops/staff/musteriler#yeni-musteri">Müşteri oluştur</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn("space-y-4", mode === "create" && "space-y-3.5")}
      data-testid={mode === "edit" ? "appointment-edit-form" : "appointment-create-form"}
    >
      {mode === "edit" && appointmentId ? (
        <input type="hidden" name="appointmentId" value={appointmentId} />
      ) : null}

      <div className={cn("grid gap-4", mode === "create" && "gap-3.5")}>
        {dateMode === "context" ? (
          <>
            <input type="hidden" name="appointmentDate" value={defaultDate} />
            <div className="rounded-xl bg-surface-1/55 px-3.5 py-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Tarih
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                {formatAppointmentDateLong(defaultDate)}
              </p>
            </div>
          </>
        ) : null}

        <div
          className={cn(
            "grid gap-4",
            dateMode === "editable"
              ? "sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              : "sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Saat</Label>
            <div className="relative">
              <Clock3
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="appointmentTime"
                name="appointmentTime"
                type="time"
                defaultValue={defaultTime}
                step={1800}
                className="pl-9"
                disabled={isDisabled}
                required
              />
            </div>
          </div>

          {dateMode === "editable" ? (
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Tarih</Label>
              <div className="relative rounded-2xl border border-border bg-surface-1/40 px-3 py-1.5">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  defaultValue={defaultDate}
                  className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                  disabled={isDisabled}
                  required
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerUserId">Müşteri</Label>
          <select
            id="customerUserId"
            name="customerUserId"
            defaultValue={(defaultCustomerUserId ?? customerOptions[0]?.id)?.toString() ?? ""}
            className={cn(selectClassName, "h-10 rounded-xl")}
            disabled={isDisabled}
            required
          >
            {customerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.email ? `${option.label} · ${option.email}` : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Not</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Kısa not"
            rows={mode === "create" ? 2 : 3}
            defaultValue={defaultNotes ?? ""}
            disabled={isDisabled}
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
          {state.success}
        </p>
      ) : null}

      <Button
        type="submit"
        size="cta"
        className={cn("w-full", mode === "edit" && "sm:w-auto")}
        disabled={isDisabled}
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            {mode === "edit" ? "Güncelleniyor" : "Kaydediliyor"}
          </>
        ) : (
          submitLabel ?? (mode === "edit" ? "Kaydı güncelle" : "Randevu aç")
        )}
      </Button>
    </form>
  );
}
