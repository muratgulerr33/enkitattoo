"use client";

import { useActionState } from "react";
import { LoaderCircle, PencilLine, Trash2 } from "lucide-react";
import {
  deleteCashEntryAction,
  type OpsCashEntryActionState,
  updateCashEntryAction,
} from "@/app/ops/kasa/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CASH_ENTRY_TYPE_LABELS, CASH_ENTRY_TYPE_VALUES } from "@/lib/ops/cashbook-copy";

const INITIAL_STATE: OpsCashEntryActionState = {
  error: null,
  success: null,
};

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

type OpsCashEntryManageDialogProps = {
  entryId: number;
  entryDate: string;
  entryType: "income" | "expense";
  amountInput: string;
  note: string | null;
  createdByName: string;
  createdAtLabel: string;
  updatedByName: string | null;
  updatedAtLabel: string;
};

export function OpsCashEntryManageDialog({
  entryId,
  entryDate,
  entryType,
  amountInput,
  note,
  createdByName,
  createdAtLabel,
  updatedByName,
  updatedAtLabel,
}: OpsCashEntryManageDialogProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateCashEntryAction,
    INITIAL_STATE
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCashEntryAction,
    INITIAL_STATE
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PencilLine className="size-4" aria-hidden />
          Detay
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-3xl p-0">
        <div className="space-y-6 p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Kasa kaydi</DialogTitle>
            <DialogDescription>
              Gecmis kayitlari yalniz yonetici duzenler veya kaldirir.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
            <p>Olusturan: {createdByName}</p>
            <p>Olusturma: {createdAtLabel}</p>
            <p>Son guncelleme: {updatedByName ? `${updatedByName} · ${updatedAtLabel}` : updatedAtLabel}</p>
          </div>

          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="entryId" value={entryId} />

            <div className="space-y-2">
              <Label htmlFor={`entryDate-${entryId}`}>Tarih</Label>
              <Input
                id={`entryDate-${entryId}`}
                name="entryDate"
                type="date"
                defaultValue={entryDate}
                disabled={updatePending || deletePending}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="space-y-2">
                <Label htmlFor={`entryType-${entryId}`}>Islem turu</Label>
                <select
                  id={`entryType-${entryId}`}
                  name="entryType"
                  defaultValue={entryType}
                  className={selectClassName}
                  disabled={updatePending || deletePending}
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
                <Label htmlFor={`amount-${entryId}`}>Tutar</Label>
                <Input
                  id={`amount-${entryId}`}
                  name="amount"
                  inputMode="decimal"
                  defaultValue={amountInput}
                  disabled={updatePending || deletePending}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`note-${entryId}`}>Not</Label>
              <Textarea
                id={`note-${entryId}`}
                name="note"
                rows={4}
                defaultValue={note ?? ""}
                disabled={updatePending || deletePending}
              />
            </div>

            {updateState.error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {updateState.error}
              </p>
            ) : null}

            {updateState.success ? (
              <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
                {updateState.success}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="cta" disabled={updatePending || deletePending}>
                {updatePending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Kaydediliyor
                  </>
                ) : (
                  "Degisiklikleri kaydet"
                )}
              </Button>
            </div>
          </form>

          <form action={deleteAction} className="space-y-3 border-t border-border pt-4">
            <input type="hidden" name="entryId" value={entryId} />

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

            <Button
              type="submit"
              variant="destructive"
              size="cta"
              disabled={updatePending || deletePending}
            >
              {deletePending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Kaldiriliyor
                </>
              ) : (
                <>
                  <Trash2 className="size-4" aria-hidden />
                  Kaydi kaldir
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
