"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { changeOwnPasswordAction } from "@/app/ops/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OpsSettingsActionState } from "@/lib/ops/settings";

const INITIAL_STATE: OpsSettingsActionState = {
  error: null,
  success: null,
};

export function OpsPasswordChangeForm() {
  const [state, formAction, pending] = useActionState(
    changeOwnPasswordAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="currentPassword">Eski şifre</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Mevcut şifre"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextPassword">Yeni şifre</Label>
          <Input
            id="nextPassword"
            name="nextPassword"
            type="password"
            autoComplete="new-password"
            placeholder="En az 8 karakter"
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextPasswordRepeat">Yeni şifre tekrar</Label>
          <Input
            id="nextPasswordRepeat"
            name="nextPasswordRepeat"
            type="password"
            autoComplete="new-password"
            placeholder="Yeni şifreyi tekrar yazın"
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

      {state.success ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-foreground">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Değiştiriliyor
          </>
        ) : (
          "Şifreyi değiştir"
        )}
      </Button>
    </form>
  );
}
