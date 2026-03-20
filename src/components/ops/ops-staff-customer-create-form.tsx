"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";
import {
  createStaffCustomerAction,
  type OpsCustomerCreateActionState,
} from "@/app/ops/musteriler/actions";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const INITIAL_STATE: OpsCustomerCreateActionState = {
  error: null,
  success: null,
  createdCustomerId: null,
};

export function OpsStaffCustomerCreateForm() {
  const [state, formAction, pending] = useActionState(
    createStaffCustomerAction,
    INITIAL_STATE
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState("");

  return (
    <form action={formAction} className="space-y-2.5">
      <div className="grid gap-2.5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            className="h-9 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            className="h-9 rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>
      </div>

      <Collapsible open={noteOpen} onOpenChange={setNoteOpen} className="border-t border-border/80 pt-2.5 dark:border-border/85">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p id="customer-note-label" className="min-w-0 text-sm font-medium text-foreground">
            Not
          </p>

          <CollapsibleTrigger asChild className="h-auto w-auto min-h-0 shrink-0 py-0 hover:no-underline">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="rounded-full px-2 text-muted-foreground dark:text-muted-foreground/92 dark:hover:bg-surface-1/72"
              disabled={pending}
            >
              {noteOpen ? "Kapat" : "Ekle"}
              <ChevronDown
                className={cn("size-4 transition-transform", noteOpen && "rotate-180")}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {noteOpen ? (
          <CollapsibleContent className="pt-2 pb-0">
            <Textarea
              id="note"
              name="note"
              aria-labelledby="customer-note-label"
              rows={2}
              value={noteValue}
              onChange={(event) => setNoteValue(event.target.value)}
              placeholder="Kısa not"
              className="min-h-[64px] rounded-xl bg-background dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
              disabled={pending}
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
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-surface-1/72">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" size="sm" className="w-full rounded-xl sm:w-auto" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Oluşturuluyor
            </>
          ) : (
            "Müşteri oluştur"
          )}
        </Button>

        {state.createdCustomerId ? (
          <>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl sm:w-auto">
              <Link href="/ops/staff/randevular">İşlemde kullan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full rounded-xl sm:w-auto">
              <Link href={`/ops/staff/musteriler/${state.createdCustomerId}`}>Detaya git</Link>
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}
