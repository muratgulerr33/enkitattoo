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

function getEntryNoteSegments(entry: Pick<CashEntryRecord, "note">): string[] {
  return entry.note
    ?.split("·")
    .map((segment) => segment.trim())
    .filter(Boolean) ?? [];
}

function formatLedgerScheduleLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})$/);

  if (!match) {
    return value;
  }

  const [, year, month, day, time] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dateLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);

  return `${dateLabel} · ${time}`;
}

function getEntryPrimaryLabel(entry: CashEntryRecord): string {
  if (entry.entryReason === "manual") {
    return entry.note?.trim() || (entry.entryType === "income" ? "Manuel gelir" : "Manuel gider");
  }

  const [, serviceLabel] = getEntryNoteSegments(entry);
  const normalizedServiceLabel = serviceLabel ?? "İşlem";

  if (entry.entryReason === "service_adjustment") {
    return `${normalizedServiceLabel} düzeltmesi`;
  }

  return `${normalizedServiceLabel} tahsilatı`;
}

function getEntrySupportLabel(entry: CashEntryRecord): string {
  if (entry.entryReason === "manual") {
    return `${entry.createdByName} · ${formatCashTime(entry.createdAt)}`;
  }

  const [, , scheduleLabel] = getEntryNoteSegments(entry);

  return formatLedgerScheduleLabel(scheduleLabel) ?? formatCashTime(entry.createdAt);
}

function getManageTimestampLabel(
  dateLabel: string,
  isToday: boolean,
  timestamp: Date
): string {
  const timeLabel = formatCashTime(timestamp);

  if (isToday) {
    return `Bugün · ${timeLabel}`;
  }

  return `${dateLabel} · ${timeLabel}`;
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
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3 text-sm">
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
        </div>
        <p className={cn("font-medium font-numbers", getNetClassName(summary.netCents))}>
          {formatCashAmount(summary.netCents)}
        </p>
      </div>
      <div className="grid gap-1.5 text-xs text-muted-foreground">
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
      <div className="space-y-4 xl:space-y-5">
        <Card
          id="manuel-giris"
          className="scroll-mt-20 border-border/70 bg-surface-1/35 md:scroll-mt-24"
        >
          <CardHeader className="gap-1 border-b pb-4">
            <p className="text-xs text-muted-foreground">{selectedDateLabel}</p>
            <CardTitle className="text-base">Manuel giriş</CardTitle>
            <CardDescription>Yalnız gerektiğinde gider veya istisna ekleyin.</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <OpsCashEntryForm
              defaultDate={cashbook.selectedDate}
              canChooseDate={canManageHistoryEntries}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="gap-3 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Kasa
                </p>
                <CardTitle className="text-sm">Defter kontrolü</CardTitle>
                <CardDescription>
                  {isSelectedDateToday
                    ? "Bugünün hareketlerini gözden geçirin."
                    : "Seçili günün defterini gözden geçirin."}
                </CardDescription>
              </div>
              <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:min-w-[16rem] sm:items-end">
                {canManageHistoryEntries ? (
                  <form
                    action="/ops/staff/kasa"
                    className="grid min-w-0 gap-2 sm:w-full sm:grid-cols-[minmax(0,1fr)_auto]"
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
            <div className={cn("grid gap-2", "sm:grid-cols-1")}>
              <div className="rounded-2xl border border-border/80 bg-surface-1/55 p-3">
                <SummaryRows label="Bugün" dateLabel={todayDateLabel} summary={cashbook.todaySummary} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="gap-1.5 border-b pb-4">
            <CardTitle className="text-base">Defter</CardTitle>
            <CardDescription>
              {cashbook.entries.length
                ? `${selectedDateLabel} için ${cashbook.entries.length} hareket.`
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
                  const entryPrimaryLabel = getEntryPrimaryLabel(entry);
                  const entrySupportLabel = getEntrySupportLabel(entry);

                  return (
                    <div key={entry.id} className="px-4 py-3 xl:px-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium sm:text-[11px]">
                            <span
                              className={cn(
                                "uppercase tracking-[0.16em]",
                                getEntryTypeBadgeClassName(entry.entryType)
                              )}
                            >
                              {entryTypeLabel}
                            </span>
                            <span className="text-muted-foreground">{entryReasonLabel}</span>
                          </div>

                          <p className="truncate text-sm font-medium text-foreground sm:text-[15px]">
                            {entryPrimaryLabel}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {entrySupportLabel}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={cn(
                              "text-lg font-semibold font-numbers sm:text-[1.4rem]",
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
                                createdAtLabel={getManageTimestampLabel(
                                  selectedDateLabel,
                                  isSelectedDateToday,
                                  entry.createdAt
                                )}
                                updatedByName={entry.updatedByName}
                                updatedAtLabel={getManageTimestampLabel(
                                  selectedDateLabel,
                                  isSelectedDateToday,
                                  entry.updatedAt
                                )}
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
    </div>
  );
}
