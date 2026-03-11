"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createStaffAppointmentAction,
  type OpsAppointmentActionState,
} from "@/app/ops/randevular/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
};

export function OpsStaffAppointmentCreateForm({
  customerOptions,
  defaultDate,
}: StaffAppointmentCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createStaffAppointmentAction,
    INITIAL_STATE
  );
  const isDisabled = pending || customerOptions.length === 0;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerUserId">Müşteri</Label>
          <select
            id="customerUserId"
            name="customerUserId"
            defaultValue={customerOptions[0]?.id.toString() ?? ""}
            className={selectClassName}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Tarih</Label>
            <Input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              defaultValue={defaultDate}
              disabled={isDisabled}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Saat</Label>
            <Input
              id="appointmentTime"
              name="appointmentTime"
              type="time"
              defaultValue="12:00"
              step={1800}
              disabled={isDisabled}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Not</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Kısa bir not ekleyin."
            rows={3}
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
