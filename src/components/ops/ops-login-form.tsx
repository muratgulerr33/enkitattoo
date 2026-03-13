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
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@enki.com"
          inputMode="email"
          disabled={disabled || pending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
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
