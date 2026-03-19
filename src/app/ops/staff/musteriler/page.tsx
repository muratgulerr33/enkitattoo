import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OpsStaffCustomerCreateForm } from "@/components/ops/ops-staff-customer-create-form";
import { Badge } from "@/components/ui/badge";
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
  type CustomerConsentStatus,
  type CustomerSearchMatchField,
} from "@/lib/ops/customers";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function getConsentStatusLabel(status: CustomerConsentStatus): string {
  return status === "accepted" ? "Sözleşme onayı kayıtlı" : "Sözleşme onayı yok";
}

function getConsentBadgeClassName(status: CustomerConsentStatus): string {
  return status === "accepted"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    : "border-border bg-muted/35 text-muted-foreground";
}

function getCustomerResultsTitle(query: string): string {
  return query ? "Arama sonuçları" : "Müşteriler";
}

function getCustomerResultsDescription(query: string, count: number): string {
  if (query) {
    return count
      ? `"${query}" için ${count} sonuç bulundu.`
      : `"${query}" için sonuç bulunamadı.`;
  }

  return count ? `${count} müşteri bulundu.` : "Aramaya uygun müşteri bulunamadı.";
}

function getSearchMatchCopy(field: CustomerSearchMatchField): string {
  switch (field) {
    case "phone":
      return "Telefon ile eşleşti";
    case "email":
      return "E-posta ile eşleşti";
    case "name":
      return "İsim ile eşleşti";
  }
}

export default async function OpsStaffCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const customers = await listCustomers(query);
  const isSearchActive = query.length > 0;

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.7fr)] xl:items-start">
        <Card id="yeni-musteri" className="gap-4">
          <CardHeader className="gap-1">
            <CardTitle>Hızlı müşteri oluştur</CardTitle>
            <CardDescription>Müşteriyi hızlıca ekleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <OpsStaffCustomerCreateForm />
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader className="gap-1">
            <CardTitle>Arama</CardTitle>
            <CardDescription>İsim, telefon veya e-posta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/ops/staff/musteriler" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Müşteri ara"
                autoComplete="off"
                className="h-10 rounded-xl"
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
      </div>

      <Card className="gap-4">
        <CardHeader className="gap-1">
          <CardTitle>{getCustomerResultsTitle(query)}</CardTitle>
          <CardDescription>{getCustomerResultsDescription(query, customers.length)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {customers.length ? (
            customers.map((customer) => {
              const nextAppointmentText = formatCustomerAppointmentShort(customer.nextAppointment);
              const searchMatchField = customer.searchMatch?.field ?? null;

              return (
                <Link
                  key={customer.userId}
                  href={`/ops/staff/musteriler/${customer.userId}`}
                  className={cn(
                    "group block rounded-2xl border px-4 py-3.5 transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSearchActive
                      ? "border-foreground/10 bg-muted/10 hover:border-foreground/20 hover:bg-muted/15"
                      : "border-border/80 bg-card hover:border-foreground/15 hover:bg-muted/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-base font-semibold text-foreground">
                        {getCustomerLabel(customer)}
                      </p>
                      {isSearchActive && searchMatchField ? (
                        <p className="text-xs font-medium text-foreground/75">
                          {getSearchMatchCopy(searchMatchField)}
                        </p>
                      ) : null}
                      <div className="space-y-0.5 text-sm">
                        <p
                          className={cn(
                            "break-words",
                            searchMatchField === "phone"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {customer.phone ?? "Telefon yok"}
                        </p>
                        <p
                          className={cn(
                            "break-words",
                            searchMatchField === "email"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {customer.email ?? "E-posta yok"}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-muted/20">
                      Detaya git
                      <ChevronRight className="size-3.5" aria-hidden />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border",
                        getConsentBadgeClassName(customer.consentStatus)
                      )}
                    >
                      {getConsentStatusLabel(customer.consentStatus)}
                    </Badge>

                    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:ml-auto">
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Yaklaşan işlem
                      </span>
                      <span className={cn(nextAppointmentText ? "text-foreground" : "text-muted-foreground")}>
                        {nextAppointmentText ?? "Yok"}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
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
