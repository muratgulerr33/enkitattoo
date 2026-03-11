import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-700";
}

export default async function OpsStaffCashPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionUser = await requireOpsSessionArea("staff");
  const cashbook = await getCashbookSnapshot(sessionUser.roles, params.date);
  const canManageHistoryEntries = canManageCashHistory(sessionUser.roles);
  const selectedDateLabel = formatCashDateLong(cashbook.selectedDate);
  const todayDate = getTodayCashDateValue();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="typo-page-title">Kasa</h1>
        <p className="typo-p text-muted-foreground">
          Hızlı kayıt ve günlük özet aynı ekranda tutulur.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="gap-4">
              <div className="space-y-2">
                <CardTitle>Gün özeti</CardTitle>
                <CardDescription>
                  Bugünün neti her zaman ayrıdır; seçili tarih listesi alttaki akışı belirler.
                </CardDescription>
              </div>

              {canManageHistoryEntries ? (
                <form action="/ops/staff/kasa" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    type="date"
                    name="date"
                    defaultValue={cashbook.selectedDate}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 rounded-xl border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/35"
                  >
                    Tarihi aç
                  </button>
                </form>
              ) : (
                <p className="rounded-2xl border border-border bg-surface-1 px-4 py-3 text-sm text-muted-foreground">
                  Artist yalnız bugünün hareketlerini görür ve kayıt açar.
                </p>
              )}
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bugün net
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCashAmount(cashbook.todaySummary.netCents)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bugün gelir
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCashAmount(cashbook.todaySummary.incomeCents)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bugün gider
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCashAmount(cashbook.todaySummary.expenseCents)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Seçili gün
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCashAmount(cashbook.selectedSummary.netCents)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedDateLabel}</CardTitle>
              <CardDescription>
                {cashbook.entries.length
                  ? `${cashbook.entries.length} aktif kayıt listeleniyor.`
                  : "Seçili gün için aktif kasa kaydı yok."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cashbook.entries.length ? (
                cashbook.entries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full border",
                              getEntryTypeBadgeClassName(entry.entryType)
                            )}
                          >
                            {CASH_ENTRY_TYPE_LABELS[entry.entryType]}
                          </Badge>
                          {entry.entryDate !== todayDate ? (
                            <Badge variant="outline" className="rounded-full">
                              Geçmiş kayıt
                            </Badge>
                          ) : null}
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">
                            {formatCashAmount(entry.amountCents)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.createdByName} · {formatCashTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>

                      {canManageHistoryEntries ? (
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
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface-1 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Net etkisi</span>
                        <span className="font-medium text-foreground">
                          {entry.entryType === "income" ? "+" : "-"}
                          {formatCashAmount(entry.amountCents)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Not
                        </p>
                        <p className="text-sm text-foreground">
                          {entry.note ?? "Not eklenmemiş."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Bu gün için kayıt yok. Sağdaki hızlı formdan yeni bir hareket ekleyin.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı yeni kayıt</CardTitle>
              <CardDescription>
                İşlem türü, tutar ve not ile kasa kaydı saniyeler içinde açılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpsCashEntryForm
                defaultDate={cashbook.selectedDate}
                canChooseDate={canManageHistoryEntries}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seçili gün özeti</CardTitle>
              <CardDescription>
                Filtrelenen günün neti tablo yerine kartlarla okunur.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Seçili gelir
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {formatCashAmount(cashbook.selectedSummary.incomeCents)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Seçili gider
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {formatCashAmount(cashbook.selectedSummary.expenseCents)}
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Kayıt sayısı
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {cashbook.selectedSummary.entryCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
