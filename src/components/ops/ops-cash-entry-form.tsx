"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createCashEntryAction,
  type OpsCashEntryActionState,
} from "@/app/ops/kasa/actions";
import { CASH_ENTRY_TYPE_LABELS, CASH_ENTRY_TYPE_VALUES } from "@/lib/ops/cashbook-copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE: OpsCashEntryActionState = {
  error: null,
  success: null,
};

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

type OpsCashEntryFormProps = {
  defaultDate: string;
  canChooseDate: boolean;
};

export function OpsCashEntryForm({ defaultDate, canChooseDate }: OpsCashEntryFormProps) {
  const [state, formAction, pending] = useActionState(createCashEntryAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      {canChooseDate ? (
        <div className="space-y-2">
          <Label htmlFor="entryDate">Tarih</Label>
          <Input
            id="entryDate"
            name="entryDate"
            type="date"
            defaultValue={defaultDate}
            disabled={pending}
            required
          />
        </div>
      ) : (
        <input type="hidden" name="entryDate" value={defaultDate} />
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-2">
          <Label htmlFor="entryType">Islem turu</Label>
          <select
            id="entryType"
            name="entryType"
            defaultValue="income"
            className={selectClassName}
            disabled={pending}
            required
          >
            {CASH_ENTRY_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {CASH_ENTRY_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Tutar</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue=""
            disabled={pending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Not</Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Kisa not"
          disabled={pending}
        />
      </div>

      {!canChooseDate ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground">
          Artist yalniz bugunun kasasina kayit acabilir.
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

      <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : (
          "Kayit ekle"
        )}
      </Button>
    </form>
  );
}
