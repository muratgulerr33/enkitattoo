"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  saveCustomerNoteAction,
  type OpsCustomerActionState,
} from "@/app/ops/musteriler/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE: OpsCustomerActionState = {
  error: null,
  success: null,
};

type OpsCustomerNoteFormProps = {
  customerUserId: number;
  note: string | null;
};

export function OpsCustomerNoteForm({
  customerUserId,
  note,
}: OpsCustomerNoteFormProps) {
  const [state, formAction, pending] = useActionState(saveCustomerNoteAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="customerUserId" value={customerUserId} />

      <Textarea
        id={`customer-note-${customerUserId}`}
        name="note"
        defaultValue={note ?? ""}
        rows={4}
        placeholder="Kısa not"
        disabled={pending}
      />

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
          "Notu kaydet"
        )}
      </Button>
    </form>
  );
}
