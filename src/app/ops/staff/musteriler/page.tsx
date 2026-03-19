import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OpsStaffCustomerCreateForm } from "@/components/ops/ops-staff-customer-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatCustomerAppointmentShort,
  getCustomerLabel,
  listCustomers,
} from "@/lib/ops/customers";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function getCustomerResultsTitle(query: string): string {
  return query ? "Arama sonuçları" : "Müşteriler";
}

function getCustomerResultsDescription(query: string, count: number): string {
  if (query) {
    return count
      ? `"${query}" için ${count} sonuç bulundu.`
      : `"${query}" için sonuç bulunamadı.`;
  }

  return count ? `${count} müşteri bulundu.` : "Henüz müşteri yok.";
}

function getNextSessionLabel(nextAppointmentText: string | null): string {
  return nextAppointmentText ?? "Yaklaşan randevu yok";
}

export default async function OpsStaffCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const customers = await listCustomers(query);
  const isSearchActive = query.length > 0;

  return (
    <div className="ops-page-shell">
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] xl:items-start xl:gap-4">
        <Card className="gap-2.5 border-foreground/12 bg-card shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:min-h-[9.4rem]">
          <CardHeader className="gap-1">
            <CardTitle>Müşteri ara</CardTitle>
            <CardDescription>Önce arayın. Kayıt yoksa hızlı müşteri ekleyin.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form action="/ops/staff/musteriler" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                name="q"
                defaultValue={query}
                placeholder="İsim, telefon veya e-posta"
                autoComplete="off"
                className="h-10 rounded-xl bg-background"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/35"
              >
                Ara
              </button>
            </form>
          </CardContent>
        </Card>

        <Card id="yeni-musteri" className="gap-3 border-border/55 bg-surface-1/18 xl:min-h-[9.4rem]">
          <CardHeader className="gap-1">
            <CardTitle>Hızlı müşteri</CardTitle>
            <CardDescription>Kayıt yoksa kısa bilgilerle ekleyin.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <OpsStaffCustomerCreateForm />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4">
        <CardHeader className="gap-1">
          <CardTitle>{getCustomerResultsTitle(query)}</CardTitle>
          <CardDescription>{getCustomerResultsDescription(query, customers.length)}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2.5 xl:grid-cols-2 xl:gap-3">
          {customers.length ? (
            customers.map((customer) => {
              const nextAppointmentText = formatCustomerAppointmentShort(customer.nextAppointment);
              const nextSessionLabel = getNextSessionLabel(nextAppointmentText);

              return (
                <Link
                  key={customer.userId}
                  href={`/ops/staff/musteriler/${customer.userId}`}
                  className={cn(
                    "group flex h-full min-h-[7.8rem] flex-col justify-center rounded-[1.45rem] border px-3.5 py-3 transition-[transform,border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.995]",
                    isSearchActive
                      ? "border-foreground/10 bg-muted/10 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/15 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                      : "border-border/80 bg-card hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-surface-1/40 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-foreground">
                        {getCustomerLabel(customer)}
                      </p>
                      <p className="truncate text-sm text-foreground/80">
                        {customer.phone ?? "Telefon eklenmedi"}
                      </p>
                      <p
                        className={cn(
                          "truncate text-sm",
                          nextAppointmentText ? "font-medium text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {nextSessionLabel}
                      </p>
                    </div>

                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-transparent text-foreground/42 transition-[transform,color,background-color] duration-150 group-hover:translate-x-0.5 group-hover:bg-surface-1/75 group-hover:text-foreground/72">
                      <ChevronRight
                        className="size-3.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground xl:col-span-2">
              {isSearchActive
                ? `"${query}" için eşleşen müşteri yok. Yukarıdan yeni müşteri ekleyin veya arama kelimesini sadeleştirin.`
                : "Henüz müşteri yok. Yukarıdan yeni müşteri ekleyin."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
