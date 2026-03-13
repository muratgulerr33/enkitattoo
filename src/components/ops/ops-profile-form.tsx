"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { updateUserProfileAction, type OpsFormActionState } from "@/app/ops/user/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: OpsFormActionState = {
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
  const [state, formAction, pending] = useActionState(updateUserProfileAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" value={email ?? ""} disabled readOnly />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Ad soyad</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ad soyad"
            defaultValue={fullName ?? ""}
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
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Görünen ad</Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="İsterseniz kısa ad"
            defaultValue={displayName ?? ""}
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

      <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : (
          "Profili kaydet"
        )}
      </Button>
    </form>
  );
}
