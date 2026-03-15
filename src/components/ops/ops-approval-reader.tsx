"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import {
  saveTattooApprovalAction,
  type OpsFormActionState,
} from "@/app/ops/user/actions";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { LegalDocumentId } from "@/lib/legal/legal-registry";

const INITIAL_STATE: OpsFormActionState = {
  error: null,
  success: null,
};

type OpsApprovalReaderProps = {
  documentId: LegalDocumentId;
  markdown: string;
  approvalEnabled: boolean;
  approvalRecorded: boolean;
  approvalRecordedAtLabel: string | null;
  documentAnchorId: string;
};

export function OpsApprovalReader({
  documentId,
  markdown,
  approvalEnabled,
  approvalRecorded,
  approvalRecordedAtLabel,
  documentAnchorId,
}: OpsApprovalReaderProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveTattooApprovalAction, INITIAL_STATE);
  const endMarkerRef = useRef<HTMLDivElement>(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(approvalRecorded || !approvalEnabled);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (approvalRecorded || !approvalEnabled) {
      setHasReachedEnd(true);
      return;
    }

    const endMarker = endMarkerRef.current;

    if (!endMarker) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && entry.intersectionRatio >= 0.95) {
          setHasReachedEnd(true);
        }
      },
      {
        threshold: [0.95, 1],
      }
    );

    observer.observe(endMarker);

    return () => observer.disconnect();
  }, [approvalEnabled, approvalRecorded]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-background px-5 py-5 sm:px-6">
        <LegalMarkdown markdown={markdown} />
      </div>

      {!approvalRecorded && approvalEnabled ? (
        <div
          ref={endMarkerRef}
          className="rounded-2xl border border-dashed border-border bg-surface-1/70 px-4 py-3 text-sm text-muted-foreground"
        >
          <p className="font-medium text-foreground">Belgenin sonu</p>
          <p className="mt-1">
            Bu alanı gördüğünde onay bölümü açılır.
          </p>
        </div>
      ) : null}

      {approvalEnabled ? (
        approvalRecorded ? (
          <div className="rounded-2xl border border-border bg-surface-1/70 px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-foreground/6 p-2 text-foreground">
                <CircleCheckBig className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="font-medium text-foreground">Onay kaydedildi.</p>
                <p>Bu kayıt hesabında tamamlandı.</p>
                {approvalRecordedAtLabel ? <p>Kaydedildi: {approvalRecordedAtLabel}</p> : null}
                <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
                  <Link href={`#${documentAnchorId}`}>Belgeye dön</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 rounded-3xl border border-border bg-surface-1/70 px-5 py-5 sm:px-6">
            <input type="hidden" name="documentId" value={documentId} />

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {hasReachedEnd
                  ? "Onay vermeye hazırsın."
                  : "Devam etmek için belgenin sonuna gel."}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasReachedEnd
                  ? "Kutuyu işaretleyip onayını tamamlayabilirsin."
                  : "Onay kutusu belgeyi tamamladığında açılır."}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <input
                id={`approval-${documentId}`}
                type="checkbox"
                name="accepted"
                checked={isChecked}
                onChange={(event) => setIsChecked(event.target.checked)}
                disabled={!hasReachedEnd || pending}
                className="mt-1 size-4 rounded border-border accent-foreground"
              />
              <Label
                htmlFor={`approval-${documentId}`}
                className={!hasReachedEnd || pending ? "cursor-not-allowed opacity-65" : "cursor-pointer"}
              >
                Okudum, anladım ve onaylıyorum.
              </Label>
            </div>

            {state.error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            {state.success ? (
              <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                {state.success}
              </p>
            ) : null}

            <Button type="submit" size="cta" className="w-full sm:w-auto" disabled={!hasReachedEnd || !isChecked || pending}>
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Kaydediliyor
                </>
              ) : (
                "Onayı kaydet"
              )}
            </Button>
          </form>
        )
      ) : (
        <div className="rounded-2xl border border-border bg-surface-1/70 px-4 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Bu belgeyi ops içinde okuyabilirsin.</p>
          <p className="mt-2">
            Bu belge için hesap kaydı bu yüzeyde açılmadı.
          </p>
        </div>
      )}
    </div>
  );
}
