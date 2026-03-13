"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createUserAppointmentAction,
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

type UserAppointmentCreateFormProps = {
  defaultDate: string;
};

export function OpsUserAppointmentCreateForm({
  defaultDate,
}: UserAppointmentCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createUserAppointmentAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appointmentDate">Tarih</Label>
          <Input
            id="appointmentDate"
            name="appointmentDate"
            type="date"
            defaultValue={defaultDate}
            disabled={pending}
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
            disabled={pending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Not</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Eklemek istediğiniz kısa bilgi."
          rows={2}
          disabled={pending}
        />
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

      <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : (
          "Randevu oluştur"
        )}
      </Button>
    </form>
  );
}
