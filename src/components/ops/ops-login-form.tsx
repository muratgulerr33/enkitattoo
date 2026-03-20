"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/ops/giris/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: LoginActionState = {
  error: null,
};

type OpsLoginFormProps = {
  disabled?: boolean;
};

export function OpsLoginForm({ disabled = false }: OpsLoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3.5">
      <div className="space-y-2">
        <Label htmlFor="identifier">Telefon veya e-posta</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="Telefon numarası veya e-posta adresi"
          inputMode="text"
          className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
          disabled={disabled || pending}
          required
        />
        <p className="text-xs text-muted-foreground dark:text-muted-foreground/92">
          Hesabınızda kayıtlı bilgiyi girin.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-xl bg-surface-1/40 dark:border-border/90 dark:bg-surface-1/78 dark:placeholder:text-muted-foreground/78"
          disabled={disabled || pending}
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="cta" className="w-full" disabled={disabled || pending}>
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Giriş yapılıyor
          </>
        ) : (
          "Giriş yap"
        )}
      </Button>
    </form>
  );
}
