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
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            className="h-10 rounded-xl"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            className="h-10 rounded-xl"
            disabled={pending}
            required
          />
        </div>
      </div>

      <Collapsible open={noteOpen} onOpenChange={setNoteOpen} className="border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Kısa not</p>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="rounded-full px-2 text-muted-foreground"
              disabled={pending}
            >
              {noteOpen ? "Kapat" : "Not ekle"}
              <ChevronDown
                className={cn("size-4 transition-transform", noteOpen && "rotate-180")}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {noteOpen ? (
          <CollapsibleContent className="pt-2.5 pb-0">
            <div className="space-y-1.5">
              <Label htmlFor="note">Kısa not</Label>
              <Textarea
                id="note"
                name="note"
                rows={2}
                value={noteValue}
                onChange={(event) => setNoteValue(event.target.value)}
                placeholder="Kısa not"
                className="min-h-[72px] rounded-xl"
                disabled={pending}
              />
            </div>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
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
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/ops/staff/randevular">Randevuda kullan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
              <Link href={`/ops/staff/musteriler/${state.createdCustomerId}`}>Detaya git</Link>
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}
