import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OpsCashEntryForm } from "@/components/ops/ops-cash-entry-form";
import { OpsCashEntryManageDialog } from "@/components/ops/ops-cash-entry-manage-dialog";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  CASH_ENTRY_REASON_LABELS,
  CASH_ENTRY_TYPE_LABELS,
} from "@/lib/ops/cashbook-copy";
import {
  canManageCashHistory,
  formatCashAmount,
  formatCashAmountInput,
  formatCashDateLong,
  formatCashTime,
  getCashbookSnapshot,
  isSystemGeneratedCashEntry,
  type CashEntryRecord,
  type CashEntrySummary,
} from "@/lib/ops/cashbook";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

function getEntryTypeBadgeClassName(entryType: CashEntryRecord["entryType"]): string {
  if (entryType === "income") {
    return "text-foreground/70";
  }

  return "text-muted-foreground";
}

function getAmountClassName(entryType: CashEntryRecord["entryType"]): string {
  if (entryType === "income") {
    return "text-emerald-700";
  }

  return "text-amber-700";
}

function getEntryReasonClassName(entry: CashEntryRecord): string {
  if (entry.entryReason === "service_collection") {
    return "border-sky-500/14 bg-sky-500/8 text-foreground/75";
  }

  if (entry.entryReason === "service_adjustment") {
    return "border-amber-500/14 bg-amber-500/8 text-foreground/75";
  }

  return "border-border/70 bg-muted/25 text-muted-foreground";
}

function getNetClassName(netCents: number): string {
  if (netCents > 0) {
    return "text-emerald-700";
  }

  if (netCents < 0) {
    return "text-amber-700";
  }

  return "text-foreground";
}

function getEntryTitle(entry: CashEntryRecord): string {
  const normalizedNote = entry.note
    ?.trim()
    .replace(/\b(?:Walk-in|Randevu)\b/g, "İşlem")
    .replace(/\s+/g, " ");

  if (normalizedNote) {
    return normalizedNote;
  }

  if (entry.entryReason === "manual") {
    return "Manuel kayıt";
  }

  return "İşlem";
}

function SummaryRows({
  label,
  dateLabel,
  summary,
}: {
  label: string;
  dateLabel: string;
  summary: CashEntrySummary;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
        </div>
        <p className={cn("font-medium font-numbers", getNetClassName(summary.netCents))}>
          {formatCashAmount(summary.netCents)}
        </p>
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>Gelir</span>
          <span className="font-numbers">{formatCashAmount(summary.incomeCents)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Gider</span>
          <span className="font-numbers">{formatCashAmount(summary.expenseCents)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Hareket</span>
          <span className="font-numbers">{summary.entryCount}</span>
        </div>
      </div>
    </div>
  );
}

export default async function OpsStaffCashPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionUser = await requireOpsSessionArea("staff");
  const cashbook = await getCashbookSnapshot(sessionUser.roles, params.date);
  const canManageHistoryEntries = canManageCashHistory(sessionUser.roles);
  const selectedDateLabel = formatCashDateLong(cashbook.selectedDate);
  const todayDateLabel = formatCashDateLong(cashbook.todayDate);
  const isSelectedDateToday = cashbook.selectedDate === cashbook.todayDate;

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.14fr)_minmax(340px,0.86fr)] xl:items-start xl:gap-6">
        <div className="order-1 min-w-0 space-y-4 xl:space-y-5">
          <Card>
            <CardHeader className="gap-2 pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Son kontrol
                  </p>
                  <CardTitle className="text-sm">Gün özeti</CardTitle>
                  <CardDescription>
                    {isSelectedDateToday ? "Bugünü kontrol edin." : "Seçili günü kontrol edin."}
                  </CardDescription>
                </div>
                <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <Button asChild variant="outline" size="sm" className="w-full rounded-lg sm:w-auto">
                    <Link href="/ops/staff/raporlar">Raporlar</Link>
                  </Button>
                  {canManageHistoryEntries ? (
                    <form
                      action="/ops/staff/kasa"
                      className="grid min-w-0 gap-2 sm:w-auto sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <input
                        type="date"
                        name="date"
                        defaultValue={cashbook.selectedDate}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] sm:min-w-[11rem]"
                      />
                      <Button type="submit" variant="outline" size="sm" className="w-full rounded-lg sm:w-auto">
                        Defteri göster
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <SummaryRows label="Bugün" dateLabel={todayDateLabel} summary={cashbook.todaySummary} />

              {!isSelectedDateToday ? (
                <div className="border-t border-border pt-3">
                  <SummaryRows
                    label="Seçili gün"
                    dateLabel={selectedDateLabel}
                    summary={cashbook.selectedSummary}
                  />
                </div>
              ) : null}

              {!canManageHistoryEntries ? (
                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                  Artist bugünün hareketleriyle çalışır.
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="gap-1.5 border-b pb-4">
              <CardTitle>Defter</CardTitle>
              <CardDescription>
                {cashbook.entries.length
                  ? `${selectedDateLabel} için ${cashbook.entries.length} hareket var.`
                  : `${selectedDateLabel} için hareket yok.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0 pt-1">
              {cashbook.entries.length ? (
                <div className="divide-y divide-border">
              {cashbook.entries.map((entry) => {
                const entryTypeLabel = CASH_ENTRY_TYPE_LABELS[entry.entryType];
                const entryReasonLabel = CASH_ENTRY_REASON_LABELS[entry.entryReason];
                const isSystemEntry = isSystemGeneratedCashEntry(entry);
                const entryTitle = getEntryTitle(entry);

                return (
                  <div key={entry.id} className="px-4 py-2.5 xl:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium sm:text-[11px]">
                          <span className={cn("uppercase tracking-[0.16em]", getEntryTypeBadgeClassName(entry.entryType))}>
                            {entryTypeLabel}
                          </span>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px]",
                              getEntryReasonClassName(entry)
                            )}
                          >
                            {entryReasonLabel}
                          </span>
                        </div>

                        <p className="truncate text-sm font-medium text-foreground sm:text-[15px]">
                          {entryTitle}
                        </p>
                      </div>

                      <div className="flex items-start justify-between gap-3 sm:block sm:shrink-0 sm:pt-0.5 sm:text-right">
                        <p
                          className={cn(
                            "min-w-0 text-lg font-semibold font-numbers sm:text-2xl",
                            getAmountClassName(entry.entryType)
                          )}
                        >
                          {entry.entryType === "income" ? "+" : "-"}
                          {formatCashAmount(entry.amountCents)}
                        </p>

                        {canManageHistoryEntries && !isSystemEntry ? (
                          <div className="mt-1.5 flex justify-end">
                            <OpsCashEntryManageDialog
                              entryId={entry.id}
                              entryDate={entry.entryDate}
                              entryType={entry.entryType}
                              amountInput={formatCashAmountInput(entry.amountCents)}
                              note={entry.note}
                              createdByName={entry.createdByName}
                              createdAtLabel={`${selectedDateLabel} · ${formatCashTime(entry.createdAt)}`}
                              updatedByName={entry.updatedByName}
                              updatedAtLabel={formatCashTime(entry.updatedAt)}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              ) : (
                <div className="px-4 py-5 text-sm text-muted-foreground xl:px-5">
                  Aktif hareket yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="order-3 xl:order-2 xl:sticky xl:top-24">
          <CardHeader className="gap-1 border-b pb-4">
            <p className="text-xs text-muted-foreground">{selectedDateLabel}</p>
            <CardTitle className="text-base sm:text-lg">Manuel giriş</CardTitle>
            <CardDescription>Yalnız gerektiğinde kayıt ekleyin.</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <OpsCashEntryForm
              defaultDate={cashbook.selectedDate}
              canChooseDate={canManageHistoryEntries}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
