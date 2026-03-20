import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { formatCashAmount } from "@/lib/ops/cashbook";
import {
  CASH_ENTRY_REASON_LABELS,
  CASH_ENTRY_TYPE_LABELS,
} from "@/lib/ops/cashbook-copy";
import {
  getStaffReportsSnapshot,
  type ReportsCashListItem,
} from "@/lib/ops/reports";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    serviceType?: string;
    artistUserId?: string;
    source?: string;
  }>;
};

function getEntryTypeClassName(entryType: ReportsCashListItem["entryType"]): string {
  if (entryType === "income") {
    return "text-emerald-700";
  }

  return "text-amber-700";
}

function MetricGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: string | number;
    toneClassName?: string;
  }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border/80 bg-surface-1/55 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </p>
          <p className={cn("mt-1 text-base font-semibold font-numbers text-foreground", item.toneClassName)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ReportsList({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: ReportsCashListItem[];
}) {
  return (
    <Card>
      <CardHeader className="gap-1.5 border-b pb-4">
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-0 pt-1">
        {entries.length ? (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 xl:px-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium sm:text-[11px]">
                      <span
                        className={cn(
                          "uppercase tracking-[0.16em]",
                          getEntryTypeClassName(entry.entryType)
                        )}
                      >
                        {CASH_ENTRY_TYPE_LABELS[entry.entryType]}
                      </span>
                      <span className="text-muted-foreground">
                        {CASH_ENTRY_REASON_LABELS[entry.entryReason] ?? entry.reasonLabel}
                      </span>
                      {entry.sourceLabel ? (
                        <span className="text-muted-foreground">{entry.sourceLabel}</span>
                      ) : null}
                    </div>

                    <p className="truncate text-sm font-medium text-foreground sm:text-[15px]">
                      {entry.primaryLabel}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">{entry.supportLabel}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-lg font-semibold font-numbers sm:text-[1.4rem]",
                        getEntryTypeClassName(entry.entryType)
                      )}
                    >
                      {entry.entryType === "income" ? "+" : "-"}
                      {formatCashAmount(entry.amountCents)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-5 text-sm text-muted-foreground xl:px-5">Kayıt yok.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function OpsStaffReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await requireOpsSessionArea("staff");
  const reports = await getStaffReportsSnapshot(params);

  return (
    <div className="ops-page-shell space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="ops-page-header">
          <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Rapor</p>
          <p className="ops-page-intro">
            Tarih aralığı ve operasyon filtreleriyle hareketleri görüntüleyin.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-lg sm:shrink-0">
          <Link href="/ops/staff/kasa">
            Defteri aç
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-1.5 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Filter className="size-4" aria-hidden />
            Filtreler
          </CardTitle>
          <CardDescription>{reports.range.label}</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form
            action="/ops/staff/raporlar"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
          >
            <div className="space-y-2">
              <label htmlFor="from" className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Başlangıç
              </label>
              <Input id="from" type="date" name="from" defaultValue={reports.filters.from} />
            </div>

            <div className="space-y-2">
              <label htmlFor="to" className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Bitiş
              </label>
              <Input id="to" type="date" name="to" defaultValue={reports.filters.to} />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="serviceType"
                className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                İşlem tipi
              </label>
              <select
                id="serviceType"
                name="serviceType"
                defaultValue={reports.filters.serviceType}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              >
                <option value="all">Tümü</option>
                <option value="tattoo">Dövme</option>
                <option value="piercing">Piercing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="artistUserId"
                className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                Artist
              </label>
              <select
                id="artistUserId"
                name="artistUserId"
                defaultValue={reports.filters.artistUserId?.toString() ?? ""}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              >
                <option value="">Tüm artistler</option>
                {reports.artistOptions.map((artist) => (
                  <option key={artist.userId} value={artist.userId}>
                    {artist.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="source"
                className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                Kayıt kaynağı
              </label>
              <select
                id="source"
                name="source"
                defaultValue={reports.filters.source}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              >
                <option value="all">Tümü</option>
                <option value="appointment">Randevu</option>
                <option value="walk_in">Walk-in</option>
                <option value="manual">Manuel</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:col-span-2 xl:col-span-5">
              <Button type="submit" variant="outline" size="sm" className="rounded-lg">
                Uygula
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-lg text-muted-foreground">
                <Link href="/ops/staff/raporlar">Temizle</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Özet</p>
          <p className="text-xs text-muted-foreground">{reports.range.label}</p>
        </div>

        <MetricGrid
          items={[
            {
              label: "Toplam gelir",
              value: formatCashAmount(reports.summary.incomeCents),
              toneClassName: "text-emerald-700",
            },
            {
              label: "Toplam gider",
              value: formatCashAmount(reports.summary.expenseCents),
              toneClassName: "text-amber-700",
            },
            {
              label: "Net",
              value: formatCashAmount(reports.summary.netCents),
              toneClassName:
                reports.summary.netCents > 0
                  ? "text-emerald-700"
                  : reports.summary.netCents < 0
                    ? "text-amber-700"
                    : undefined,
            },
            {
              label: "Hareket",
              value: reports.summary.entryCount,
            },
          ]}
        />
      </section>

      <ReportsList
        title="Hareketler"
        description={`${reports.range.label} için ${reports.entries.length} kayıt bulundu.`}
        entries={reports.entries}
      />
    </div>
  );
}
