import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { CASH_ENTRY_TYPE_LABELS } from "@/lib/ops/cashbook-copy";
import {
  canManageCashHistory,
  formatCashAmount,
  formatCashAmountInput,
  formatCashDateLong,
  formatCashTime,
  getCashbookSnapshot,
  getTodayCashDateValue,
  type CashEntryRecord,
  type CashEntrySummary,
} from "@/lib/ops/cashbook";
import { cn } from "@/lib/utils";
import { OpsCashEntryForm } from "@/components/ops/ops-cash-entry-form";
import { OpsCashEntryManageDialog } from "@/components/ops/ops-cash-entry-manage-dialog";

type PageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

function getEntryTypeBadgeClassName(entryType: CashEntryRecord["entryType"]): string {
  if (entryType === "income") {
    return "text-emerald-700";
  }

  return "text-amber-700";
}

function getAmountClassName(entryType: CashEntryRecord["entryType"]): string {
  if (entryType === "income") {
    return "text-emerald-700";
  }

  return "text-amber-700";
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
  return entry.note?.trim() || `${CASH_ENTRY_TYPE_LABELS[entry.entryType]} kaydı`;
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
          <span>Kayıt</span>
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
  const todayDate = getTodayCashDateValue();
  const todayDateLabel = formatCashDateLong(cashbook.todayDate);
  const isSelectedDateToday = cashbook.selectedDate === cashbook.todayDate;

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.36fr)_minmax(360px,0.64fr)] xl:items-start xl:gap-6">
        <Card className="order-1">
          <CardHeader className="gap-1 border-b pb-4">
            <p className="text-xs text-muted-foreground">{selectedDateLabel}</p>
            <CardTitle className="text-base sm:text-lg">Hızlı kayıt</CardTitle>
            <CardDescription>İşlem, kategori ve tutarı girin.</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <OpsCashEntryForm
              defaultDate={cashbook.selectedDate}
              canChooseDate={canManageHistoryEntries}
            />
          </CardContent>
        </Card>

        <div className="order-2 space-y-4">
          <Card>
            <CardHeader className="gap-2 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm">Gün özeti</CardTitle>
                  <CardDescription>
                    {isSelectedDateToday ? "Bugünün kasası açık." : "Seçili gün defteri açık."}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-lg">
                    <Link href="/ops/staff/raporlar">Raporlar</Link>
                  </Button>
                  {canManageHistoryEntries ? (
                    <form action="/ops/staff/kasa" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input
                        type="date"
                        name="date"
                        defaultValue={cashbook.selectedDate}
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                      />
                      <Button type="submit" variant="outline" size="sm" className="rounded-lg">
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
                  Artist bugünün defteriyle çalışır.
                </p>
              ) : null}
            </CardContent>
          </Card>

        </div>
      </div>

      <Card>
        <CardHeader className="gap-1.5 border-b pb-4">
          <CardTitle>Defter</CardTitle>
          <CardDescription>
            {cashbook.entries.length
              ? `${selectedDateLabel} için ${cashbook.entries.length} aktif kayıt var.`
              : `${selectedDateLabel} için aktif kayıt yok.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-1">
          {cashbook.entries.length ? (
            <div className="divide-y divide-border">
              {cashbook.entries.map((entry) => {
                const entryTypeLabel = CASH_ENTRY_TYPE_LABELS[entry.entryType];

                return (
                  <div key={entry.id} className="px-4 py-2 xl:px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                          <span className={cn(getEntryTypeBadgeClassName(entry.entryType))}>
                            {entryTypeLabel}
                          </span>
                          {entry.entryDate !== todayDate ? (
                            <span className="text-[11px] text-muted-foreground">Geçmiş kayıt</span>
                          ) : null}
                        </div>

                        <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                          {getEntryTitle(entry)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.createdByName} · {formatCashTime(entry.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5 text-right">
                        <p
                          className={cn(
                            "text-lg font-semibold font-numbers sm:text-xl",
                            getAmountClassName(entry.entryType)
                          )}
                        >
                          {entry.entryType === "income" ? "+" : "-"}
                          {formatCashAmount(entry.amountCents)}
                        </p>

                        {canManageHistoryEntries ? (
                          <div className="mt-1 flex justify-end">
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
              Kayıt yok.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
