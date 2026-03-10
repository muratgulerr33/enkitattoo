"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  updateAppointmentStatusAction,
  type OpsAppointmentActionState,
} from "@/app/ops/randevular/actions";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/ops/appointment-copy";
import { APPOINTMENT_STATUS_VALUES, type AppointmentStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

type AppointmentStatusFormProps = {
  appointmentId: number;
  status: AppointmentStatus;
};

export function OpsAppointmentStatusForm({
  appointmentId,
  status,
}: AppointmentStatusFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAppointmentStatusAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <div className="space-y-2">
        <Label htmlFor={`status-${appointmentId}`}>Durum</Label>
        <select
          id={`status-${appointmentId}`}
          name="status"
          defaultValue={status}
          className={selectClassName}
          disabled={pending}
        >
          {APPOINTMENT_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {APPOINTMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
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

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Guncelleniyor
          </>
        ) : (
          "Durumu kaydet"
        )}
      </Button>
    </form>
  );
}
