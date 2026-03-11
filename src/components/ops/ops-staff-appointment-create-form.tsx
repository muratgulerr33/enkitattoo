"use client";

import { useActionState } from "react";
import { CalendarDays, Clock3, LoaderCircle } from "lucide-react";
import {
  createStaffAppointmentAction,
  type OpsAppointmentActionState,
} from "@/app/ops/randevular/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  defaultDateLabel: string;
  defaultTime: string;
  compact?: boolean;
};

export function OpsStaffAppointmentCreateForm({
  customerOptions,
  defaultDate,
  defaultDateLabel,
  defaultTime,
  compact = false,
}: StaffAppointmentCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createStaffAppointmentAction,
    INITIAL_STATE
  );
  const isDisabled = pending || customerOptions.length === 0;

  return (
    <form action={formAction} className={cn("space-y-4", compact && "space-y-3")}>
      <input type="hidden" name="appointmentDate" value={defaultDate} />

      <div className={cn("grid gap-4", compact && "gap-3")}>
        <div className="grid gap-3 rounded-2xl border border-border bg-background/80 p-3 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-center">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seçili gün
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
              {defaultDateLabel}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Saat</Label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerUserId">Müşteri</Label>
          <select
            id="customerUserId"
            name="customerUserId"
            defaultValue={customerOptions[0]?.id.toString() ?? ""}
            className={cn(selectClassName, compact && "h-10 rounded-xl")}
            disabled={isDisabled}
            required
          >
            {customerOptions.length ? null : <option value="">Müşteri bulunamadı</option>}
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
            placeholder="Kısa bir not ekleyin."
            rows={compact ? 2 : 3}
            disabled={isDisabled}
          />
        </div>
      </div>

      {!customerOptions.length ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground">
          Randevu açmak için önce müşteri hesabı oluşturun.
        </p>
      ) : null}

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

      <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={isDisabled}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : (
          "Randevu aç"
        )}
      </Button>
    </form>
  );
}
