"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, LoaderCircle } from "lucide-react";
import {
  createCashEntryAction,
  type OpsCashEntryActionState,
} from "@/app/ops/kasa/actions";
import {
  CASH_ENTRY_PAYMENT_METHOD_LABELS,
  CASH_ENTRY_PAYMENT_METHOD_VALUES,
  CASH_ENTRY_PRESETS,
  CASH_ENTRY_TYPE_VALUES,
  type CashEntryPreset,
  type CashEntryPaymentMethodValue,
  type CashEntryTypeValue,
} from "@/lib/ops/cashbook-copy";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OpsCashEntryActionState = {
  error: null,
  success: null,
};

function getNotePlaceholder(entryType: CashEntryTypeValue, activePreset: CashEntryPreset | null): string {
  if (activePreset) {
    return `${activePreset.label} için kısa ek not`;
  }

  if (entryType === "income") {
    return "Örn. Piercing / kapora";
  }

  return "Örn. Temizlik bezi / 3 iğne";
}

type OpsCashEntryFormProps = {
  defaultDate: string;
  canChooseDate: boolean;
};

export function OpsCashEntryForm({ defaultDate, canChooseDate }: OpsCashEntryFormProps) {
  const [state, formAction, pending] = useActionState(createCashEntryAction, INITIAL_STATE);
  const [entryType, setEntryType] = useState<CashEntryTypeValue>("income");
  const [paymentMethod, setPaymentMethod] = useState<CashEntryPaymentMethodValue>("cash");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(null);
  const [amountValue, setAmountValue] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [entryDateValue, setEntryDateValue] = useState(defaultDate);
  const [noteOpen, setNoteOpen] = useState(false);
  const activePresetNoteRef = useRef("");

  const presets = CASH_ENTRY_PRESETS[entryType];
  const activePreset = presets.find((preset) => preset.key === selectedPresetKey) ?? null;

  useEffect(() => {
    setEntryDateValue(defaultDate);
  }, [defaultDate]);

  useEffect(() => {
    activePresetNoteRef.current = activePreset?.note ?? "";
  }, [activePreset]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setAmountValue("");
    setNoteValue(activePresetNoteRef.current);
    setNoteOpen(false);
  }, [state]);

  function handleEntryTypeSelect(nextType: CashEntryTypeValue) {
    const previousPreset = activePreset;

    setEntryType(nextType);
    setSelectedPresetKey(null);
    setNoteValue((currentValue) =>
      previousPreset && currentValue === previousPreset.note ? "" : currentValue
    );
  }

  function handlePresetSelect(preset: CashEntryPreset) {
    if (selectedPresetKey === preset.key) {
      setSelectedPresetKey(null);
      setNoteValue((currentValue) => (currentValue === preset.note ? "" : currentValue));
      return;
    }

    setSelectedPresetKey(preset.key);
    setNoteValue(preset.note);
  }

  function handlePresetClear() {
    setSelectedPresetKey(null);
    setNoteValue((currentValue) =>
      activePreset && currentValue === activePreset.note ? "" : currentValue
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="entryType" value={entryType} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      {canChooseDate ? null : <input type="hidden" name="entryDate" value={entryDateValue} />}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">İşlem</p>

        <div className="grid grid-cols-2 rounded-2xl border border-border bg-surface-1 p-1">
          {CASH_ENTRY_TYPE_VALUES.map((value) => {
            const isActive = value === entryType;

            return (
              <Button
                key={value}
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={isActive}
                disabled={pending}
                onClick={() => handleEntryTypeSelect(value)}
                className={cn(
                  "h-10 rounded-xl px-3 text-sm",
                  isActive
                    ? "bg-foreground text-background hover:bg-foreground"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                {value === "income" ? "Gelir" : "Gider"}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ödeme tipi
        </p>

        <div className="grid grid-cols-2 gap-2">
          {CASH_ENTRY_PAYMENT_METHOD_VALUES.map((value) => {
            const isActive = value === paymentMethod;

            return (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={isActive}
                disabled={pending}
                onClick={() => setPaymentMethod(value)}
                className={cn(
                  "h-10 rounded-xl px-3 text-sm",
                  isActive
                    ? "border-foreground bg-foreground text-background hover:bg-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {CASH_ENTRY_PAYMENT_METHOD_LABELS[value]}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Kategori
          </p>
          {activePreset ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={pending}
              onClick={handlePresetClear}
              className="rounded-full px-2 text-muted-foreground"
            >
              Temizle
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const isActive = preset.key === selectedPresetKey;

            return (
              <Button
                key={preset.key}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                aria-pressed={isActive}
                disabled={pending}
                onClick={() => handlePresetSelect(preset)}
                className="h-8 rounded-full px-3"
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tutar
        </Label>
        <div className="relative">
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0,00"
            value={amountValue}
            disabled={pending}
            required
            onChange={(event) => setAmountValue(event.target.value)}
            className="h-14 rounded-2xl pr-14 text-2xl font-semibold tracking-tight md:text-2xl"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
            TL
          </span>
        </div>
      </div>

      <Button type="submit" size="cta" className="h-12 w-full rounded-2xl text-base" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : (
          "Kaydı ekle"
        )}
      </Button>

      {canChooseDate ? (
        <div className="border-t border-border pt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden />
              <Label htmlFor="entryDate">Tarih</Label>
            </div>
            <Input
              id="entryDate"
              name="entryDate"
              type="date"
              value={entryDateValue}
              disabled={pending}
              required
              onChange={(event) => setEntryDateValue(event.target.value)}
              className="h-10 rounded-xl sm:max-w-52"
            />
          </div>
        </div>
      ) : (
        <div className="border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">Artist yalnız bugünün kasasına kayıt açabilir.</p>
        </div>
      )}

      <Collapsible open={noteOpen} onOpenChange={setNoteOpen} className="border-t border-border pt-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-medium text-foreground">Not</p>

          <CollapsibleTrigger asChild className="h-auto w-auto min-h-0 shrink-0 py-0 hover:no-underline">
            <Button type="button" variant="ghost" size="xs" className="rounded-full px-2 text-muted-foreground">
              {noteOpen ? "Kapat" : "Ekle"}
              <ChevronDown
                className={cn("size-4 transition-transform", noteOpen && "rotate-180")}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {noteOpen ? (
          <CollapsibleContent className="pt-2.5">
            <Textarea
              id="note"
              name="note"
              rows={2}
              value={noteValue}
              disabled={pending}
              onChange={(event) => setNoteValue(event.target.value)}
              placeholder={getNotePlaceholder(entryType, activePreset)}
              className="min-h-[72px] rounded-xl"
            />
          </CollapsibleContent>
        ) : (
          <input type="hidden" name="note" value={noteValue} />
        )}
      </Collapsible>

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
    </form>
  );
}
