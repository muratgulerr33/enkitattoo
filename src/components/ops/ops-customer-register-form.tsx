"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  registerCustomerAccountAction,
  type CustomerRegisterActionState,
} from "@/app/ops/giris/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: CustomerRegisterActionState = {
  error: null,
};

export function OpsCustomerRegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerCustomerAccountAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-2.5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ad soyad"
            className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="ornek@enki.com"
            className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="En az 8 karakter"
            className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="cta" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Hesap oluşturuluyor
          </>
        ) : (
          "Hesabı oluştur"
        )}
      </Button>
    </form>
  );
}
