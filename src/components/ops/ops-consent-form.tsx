"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { acceptConsentAction, type OpsFormActionState } from "@/app/ops/user/actions";
import type { ConsentAcceptanceRecord } from "@/lib/ops/user-workspace";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: OpsFormActionState = {
  error: null,
  success: null,
};

type OpsConsentFormProps = {
  consent: ConsentAcceptanceRecord | null;
  canAccept: boolean;
  documentVersion: string;
};

function formatAcceptedAt(value: Date | null): string {
  if (!value) {
    return "Henüz onay verilmedi.";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function OpsConsentForm({ consent, canAccept, documentVersion }: OpsConsentFormProps) {
  const [state, formAction, pending] = useActionState(acceptConsentAction, INITIAL_STATE);
  const alreadyAccepted = Boolean(consent?.accepted);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-border bg-surface-1 p-4">
        <p className="text-sm font-medium text-foreground">Açık onay</p>
        <p className="text-sm text-muted-foreground">
          Form bilgilerimin değerlendirme amacıyla kaydedilmesini ve stüdyo iletişimi için
          kullanılmasını kabul ediyorum.
        </p>
        <div className="text-xs text-muted-foreground">
          Sürüm: <span className="font-medium text-foreground">{documentVersion}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Durum: <span className="font-medium text-foreground">{formatAcceptedAt(consent?.acceptedAt ?? null)}</span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
        <input
          id="accepted"
          name="accepted"
          type="checkbox"
          className="mt-0.5 size-4 rounded border-border text-foreground"
          disabled={pending || alreadyAccepted || !canAccept}
        />
        <Label htmlFor="accepted" className="text-sm leading-6 text-foreground">
          Okudum. Onay kutusunu kendi isteğimle işaretliyorum.
        </Label>
      </div>

      {!canAccept && !alreadyAccepted ? (
        <p className="rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground">
          Onaydan önce dövme formunu tamamlayın.
        </p>
      ) : null}

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

      <Button
        type="submit"
        size="cta"
        className="w-full sm:w-auto"
        disabled={pending || alreadyAccepted || !canAccept}
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Kaydediliyor
          </>
        ) : alreadyAccepted ? (
          "Onay kayıtlı"
        ) : (
          "Onayı kaydet"
        )}
      </Button>
    </form>
  );
}
