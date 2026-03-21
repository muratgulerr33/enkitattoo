"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { LegalMarkdown } from "@/components/legal/legal-markdown";
import { Button } from "@/components/ui/button";
import type { StaffDocumentPacket } from "@/lib/ops/document-packets";
import { formatOpsMoneyDisplay } from "@/lib/ops/money";
import { cn } from "@/lib/utils";

type OpsStaffDocumentPacketProps = {
  packet: StaffDocumentPacket;
};

const UNASSIGNED_ARTIST_LABEL = "Kayıtlı değil";

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

function ContractCopy({ packet }: { packet: StaffDocumentPacket }) {
  const customerName = getCustomerName(packet);
  const scheduledAt = `${formatSessionDate(packet.scheduledDate)} · ${packet.scheduledTime}`;

  return (
    <article className="document-packet-copy border border-border/85 bg-card shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="document-packet-sheet document-contract-sheet flex min-h-[272mm] flex-col px-6 py-5 text-foreground sm:px-8 sm:py-6">
        <header className="space-y-3.5 border-b border-border/80 pb-5">
          <div className="flex items-end justify-between gap-6 text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
            <div className="space-y-1">
              <p>Sayı</p>
              <p className="text-[12.5px] font-medium tracking-[0.03em] text-foreground sm:text-[13px]">
                {packet.displayNo}
              </p>
            </div>

            <div className="space-y-1 text-right">
              <p>Kayıt tarihi</p>
              <p className="text-[12.5px] font-medium tracking-normal text-foreground sm:text-[13px]">
                {formatDate(packet.contractDate)}
              </p>
            </div>
          </div>

          <h1 className="mx-auto max-w-none text-center text-[1.34rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[1.54rem] sm:whitespace-nowrap">
            Enki Tattoo Dövme / Piercing Sözleşmesi
          </h1>
        </header>

        <section className="flex-1 pt-4 pb-5">
          <LegalMarkdown
            markdown={packet.legal.markdown}
            className="document-contract-body mx-auto w-full max-w-[170mm] space-y-3.5 text-[12px] leading-[1.56] text-foreground [&>h2]:hidden [&>h3]:hidden [&>ol]:space-y-2 [&>ol]:pl-5 [&>ol]:leading-[1.56] [&>ol>li]:leading-[1.56] [&>p]:text-foreground [&>p]:leading-[1.56]"
          />
        </section>

        <footer className="border-t border-border/80 pt-5">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <section className="space-y-3.5 border border-border/80 bg-transparent px-4 pt-4 pb-4 sm:px-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Müşteri bilgisi
              </p>

              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  İsim Soyisim
                </p>
                <div className="border-b border-foreground/40 pb-2 text-[13px] font-medium text-foreground">
                  {customerName}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Telefon
                </p>
                <div className="border-b border-foreground/40 pb-2 text-[13px] font-medium text-foreground">
                  {packet.customer.phone ?? "Kayıt yok"}
                </div>
              </div>

              <div className="space-y-1 pt-0.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  İmza
                </p>
                <div className="mt-1 h-12" />
              </div>
            </section>

            <section className="space-y-3 border border-border/80 bg-transparent px-4 pt-4 pb-4 text-[12px] leading-[1.5] sm:px-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                İşlem bilgisi
              </p>

              <div className="flex items-end justify-between gap-4 border-b border-border/80 py-2">
                <span className="text-muted-foreground">İşlem Tipi</span>
                <span className="text-right font-medium text-foreground">
                  {getServiceTypeLabel(packet.serviceType)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border/80 py-2">
                <span className="text-muted-foreground">İşlem Tarihi ve Saati</span>
                <span className="text-right font-semibold text-foreground">{scheduledAt}</span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border/80 py-2">
                <span className="text-muted-foreground">Artist</span>
                <span className="text-right font-medium text-foreground">
                  {packet.artistName ?? UNASSIGNED_ARTIST_LABEL}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 border-b border-border/80 py-2">
                <span className="text-muted-foreground">Toplam Tutar</span>
                <span className="text-right font-semibold text-foreground">
                  {formatOpsMoneyDisplay(packet.totalAmountCents)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 py-2">
                <span className="text-muted-foreground">Kapora</span>
                <span className="text-right font-semibold text-foreground">
                  {formatOpsMoneyDisplay(packet.collectedAmountCents)}
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

  return (
    <div className="document-root light isolate bg-background text-foreground [color-scheme:light]">
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
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <ContractCopy key={`contract-copy-${copyIndex + 1}`} packet={packet} />
        ))}
      </div>
      </div>
    </div>
  );
}
