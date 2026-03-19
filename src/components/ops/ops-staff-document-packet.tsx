"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { Button } from "@/components/ui/button";
import type { StaffDocumentPacket } from "@/lib/ops/document-packets";
import { cn } from "@/lib/utils";

type OpsStaffDocumentPacketProps = {
  packet: StaffDocumentPacket;
};

const COPY_LABELS = {
  1: ["Müşteri nüshası"] as const,
  2: ["Müşteri nüshası", "Stüdyo nüshası"] as const,
} satisfies Record<1 | 2, readonly string[]>;

function formatMoney(amountCents: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatSessionDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getServiceTypeLabel(value: StaffDocumentPacket["serviceType"]): string {
  return value === "piercing" ? "Piercing" : "Dövme";
}

function getCustomerName(packet: StaffDocumentPacket): string {
  return (
    packet.customer.fullName ??
    packet.customer.displayName ??
    `Kullanıcı #${packet.customer.userId}`
  );
}

function ContractCopy({
  packet,
  copyLabel,
}: {
  packet: StaffDocumentPacket;
  copyLabel: string;
}) {
  const customerName = getCustomerName(packet);
  const scheduledAt = `${formatSessionDate(packet.scheduledDate)} · ${packet.scheduledTime}`;

  return (
    <article className="document-packet-copy border border-border bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="document-packet-sheet document-contract-sheet flex min-h-[272mm] flex-col px-6 py-6 text-foreground sm:px-8 sm:py-7">
        <header className="space-y-3 border-b border-border pb-3">
          <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="space-y-1">
              <p>Sayı</p>
              <p className="text-[13px] font-semibold tracking-[0.08em] text-foreground">
                {packet.displayNo}
              </p>
            </div>

            <div className="space-y-1 text-right">
              <p>Sözleşme tarihi</p>
              <p className="text-[13px] font-semibold tracking-normal text-foreground">
                {formatDate(packet.contractDate)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {copyLabel}
            </p>
            <h1 className="text-[1.38rem] font-semibold tracking-[-0.02em] text-foreground sm:text-[1.55rem]">
              Enki Tattoo Dövme ve Piercing Sözleşmesi
            </h1>
          </div>
        </header>

        <section className="flex-1 py-4">
          <LegalMarkdown
            markdown={packet.legal.markdown}
            className="document-contract-body space-y-3 text-[12px] leading-[1.48] text-foreground [&>h2]:hidden [&>h3]:hidden [&>ol]:space-y-1.5 [&>ol]:pl-5 [&>ol]:leading-[1.48] [&>p]:text-foreground [&>p]:leading-[1.48]"
          />
        </section>

        <footer className="border-t border-border pt-4">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <section className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  İsim Soyisim
                </p>
                <div className="border-b border-foreground/45 pb-1.5 text-[13px] font-medium text-foreground">
                  {customerName}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Telefon
                </p>
                <div className="border-b border-foreground/45 pb-1.5 text-[13px] font-medium text-foreground">
                  {packet.customer.phone ?? "Kayıt yok"}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  İmza
                </p>
                <div className="h-11 border-b border-foreground/45" />
              </div>
            </section>

            <section className="space-y-2.5 text-[12px] leading-[1.45]">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-1.5">
                <span className="text-muted-foreground">İşlem Tipi</span>
                <span className="text-right font-medium text-foreground">
                  {getServiceTypeLabel(packet.serviceType)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border pb-1.5">
                <span className="text-muted-foreground">İşlem Tarihi ve Saati</span>
                <span className="text-right font-medium text-foreground">{scheduledAt}</span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border pb-1.5">
                <span className="text-muted-foreground">Toplam Tutar</span>
                <span className="text-right font-medium text-foreground">
                  {formatMoney(packet.totalAmountCents)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border pb-1.5">
                <span className="text-muted-foreground">Alınan Kapora</span>
                <span className="text-right font-medium text-foreground">
                  {formatMoney(packet.collectedAmountCents)}
                </span>
              </div>
            </section>
          </div>
        </footer>
      </div>
    </article>
  );
}

export function OpsStaffDocumentPacket({ packet }: OpsStaffDocumentPacketProps) {
  const [copyCount, setCopyCount] = useState<1 | 2>(2);
  const copyLabels = COPY_LABELS[copyCount];

  return (
    <div className="document-packet-preview safe-pl-edge-12 safe-pr-edge-12 safe-pt safe-pb-24 mx-auto flex w-full max-w-[216mm] flex-col gap-4 px-3 pt-3 pb-6 sm:px-5 sm:pt-5 sm:pb-8">
      <div className="document-packet-screenbar sticky top-0 z-20 border border-border bg-background/94 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/88">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/ops/staff/randevular">
                <ArrowLeft className="size-4" aria-hidden />
                Geri
              </Link>
            </Button>

            <Button type="button" className="rounded-none" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden />
              Yazdır
            </Button>
          </div>

          <div className="document-packet-screen-only inline-flex items-center gap-1 border border-border bg-card p-1">
            <Button
              type="button"
              size="sm"
              variant={copyCount === 1 ? "default" : "ghost"}
              className={cn("rounded-none", copyCount === 1 ? "" : "text-muted-foreground")}
              onClick={() => setCopyCount(1)}
              aria-pressed={copyCount === 1}
            >
              1 kopya
            </Button>
            <Button
              type="button"
              size="sm"
              variant={copyCount === 2 ? "default" : "ghost"}
              className={cn("rounded-none", copyCount === 2 ? "" : "text-muted-foreground")}
              onClick={() => setCopyCount(2)}
              aria-pressed={copyCount === 2}
            >
              2 kopya
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-1 sm:pb-2">
        {copyLabels.map((copyLabel) => (
          <ContractCopy key={copyLabel} packet={packet} copyLabel={copyLabel} />
        ))}
      </div>
    </div>
  );
}
