"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { saveTattooFormAction, type OpsFormActionState } from "@/app/ops/user/actions";
import type { TattooFormSnapshot } from "@/lib/ops/user-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE: OpsFormActionState = {
  error: null,
  success: null,
};

type OpsTattooFormProps = {
  latestTattooForm: TattooFormSnapshot | null;
};

export function OpsTattooForm({ latestTattooForm }: OpsTattooFormProps) {
  const [state, formAction, pending] = useActionState(saveTattooFormAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Önce bunları ekle</p>
          <p className="text-sm text-muted-foreground">
            Randevu talebi açmadan önce bu üç detayı paylaş.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placement">Bölge</Label>
          <Input
            id="placement"
            name="placement"
            placeholder="Örn. kol içi, bilek, sırt"
            defaultValue={latestTattooForm?.placement ?? ""}
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeNotes">Boyut</Label>
          <Input
            id="sizeNotes"
            name="sizeNotes"
            placeholder="Örn. 8-10 cm, avuç içi kadar"
            defaultValue={latestTattooForm?.sizeNotes ?? ""}
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designNotes">Tasarım notu</Label>
          <Textarea
            id="designNotes"
            name="designNotes"
            placeholder="Ne istediğinizi kısaca anlatın."
            defaultValue={latestTattooForm?.designNotes ?? ""}
            disabled={pending}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">İsteğe bağlı notlar</p>
          <p className="text-sm text-muted-foreground">
            Taslağı netleştirmek için ek detay bırakabilirsiniz.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="styleNotes">Stil notu</Label>
            <Textarea
              id="styleNotes"
              name="styleNotes"
              placeholder="Örn. minimal, fine line, blackwork"
              defaultValue={latestTattooForm?.styleNotes ?? ""}
              disabled={pending}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorNotes">Renk tercihi</Label>
            <Input
              id="colorNotes"
              name="colorNotes"
              placeholder="Siyah gri, renkli veya kararsız"
              defaultValue={latestTattooForm?.colorNotes ?? ""}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNotes">Referans notu</Label>
            <Textarea
              id="referenceNotes"
              name="referenceNotes"
              placeholder="Referansınız varsa kısaca belirtin."
              defaultValue={latestTattooForm?.referenceNotes ?? ""}
              disabled={pending}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthNotes">Sağlık / hassasiyet notu</Label>
            <Textarea
              id="healthNotes"
              name="healthNotes"
              placeholder="Varsa alerji, hassasiyet veya dikkat edilmesi gereken not."
              defaultValue={latestTattooForm?.healthNotes ?? ""}
              disabled={pending}
              rows={2}
            />
          </div>
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

      <div className="grid gap-2.5">
        <Button
          type="submit"
          size="cta"
          name="intent"
          value="submit"
          className="w-full"
          disabled={pending}
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Tamamlanıyor
            </>
          ) : (
            "Detayları tamamla"
          )}
        </Button>

        <Button
          type="submit"
          name="intent"
          value="save"
          size="cta"
          variant="outline"
          className="w-full"
          disabled={pending}
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Kaydediliyor
            </>
          ) : (
            "Taslak olarak kaydet"
          )}
        </Button>
      </div>
    </form>
  );
}
