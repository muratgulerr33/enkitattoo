"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createStaffCustomerAction,
  type OpsCustomerCreateActionState,
} from "@/app/ops/musteriler/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Müşteri adı"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">Kısa not</Label>
          <Textarea
            id="note"
            name="note"
            rows={3}
            placeholder="İsterseniz kısa bir not bırakın."
            disabled={pending}
          />
        </div>
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
