"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { updateOwnProfileAction } from "@/app/ops/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OpsSettingsActionState } from "@/lib/ops/settings";

const INITIAL_STATE: OpsSettingsActionState = {
  error: null,
  success: null,
};

type OpsProfileFormProps = {
  email: string | null;
  fullName: string | null;
  displayName: string | null;
  phone: string | null;
};

export function OpsProfileForm({
  email,
  fullName,
  displayName,
  phone,
}: OpsProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateOwnProfileAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" value={email ?? ""} className="dark:border-border/90 dark:bg-surface-1/78" disabled readOnly />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ad soyad"
            defaultValue={fullName ?? ""}
            className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
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
            defaultValue={phone ?? ""}
            className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Görünen ad</Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="Kısa ad"
            defaultValue={displayName ?? ""}
            className="dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
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
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground dark:border-border/90 dark:bg-surface-1/72">
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
          "Bilgileri kaydet"
        )}
      </Button>
    </form>
  );
}
