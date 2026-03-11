"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, PencilLine, Trash2, X } from "lucide-react";
import {
  deleteStaffAppointmentAction,
  type OpsAppointmentActionState,
} from "@/app/ops/randevular/actions";
import { OpsStaffAppointmentCreateForm } from "@/components/ops/ops-staff-appointment-create-form";
import { Button } from "@/components/ui/button";

const INITIAL_STATE: OpsAppointmentActionState = {
  error: null,
  success: null,
};

type OpsStaffAppointmentManageCardProps = {
  appointmentId: number;
  appointmentDate: string;
  appointmentDateLabel: string;
  appointmentTime: string;
  customerUserId: number;
  customerOptions: Array<{
    id: number;
    label: string;
    email: string | null;
  }>;
  notes: string | null;
};

export function OpsStaffAppointmentManageCard({
  appointmentId,
  appointmentDate,
  appointmentDateLabel,
  appointmentTime,
  customerUserId,
  customerOptions,
  notes,
}: OpsStaffAppointmentManageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteStaffAppointmentAction,
    INITIAL_STATE
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant={isEditing ? "secondary" : "outline"}
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => setIsEditing((current) => !current)}
          disabled={deletePending}
        >
          {isEditing ? (
            <>
              <X className="size-4" aria-hidden />
              Vazgeç
            </>
          ) : (
            <>
              <PencilLine className="size-4" aria-hidden />
              Düzenle
            </>
          )}
        </Button>

        <form
          action={deleteAction}
          className="w-full sm:w-auto"
          onSubmit={(event) => {
            if (!window.confirm("Bu randevuyu silmek istiyor musunuz?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="appointmentId" value={appointmentId} />

          <Button
            type="submit"
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
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

      {deleteState.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {deleteState.error}
        </p>
      ) : null}

      {deleteState.success ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
          {deleteState.success}
        </p>
      ) : null}

      {isEditing ? (
        <div className="rounded-[1.35rem] border border-border bg-surface-1/80 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Randevuyu düzenle</p>
              <p className="text-xs text-muted-foreground">
                Seçili gün içinde saat, müşteri ve notu güncelleyin.
              </p>
            </div>
          </div>

          <OpsStaffAppointmentCreateForm
            appointmentId={appointmentId}
            mode="edit"
            customerOptions={customerOptions}
            defaultDate={appointmentDate}
            defaultDateLabel={appointmentDateLabel}
            defaultTime={appointmentTime}
            defaultCustomerUserId={customerUserId}
            defaultNotes={notes}
            submitLabel="Kaydı güncelle"
            compact
          />
        </div>
      ) : null}
    </div>
  );
}
