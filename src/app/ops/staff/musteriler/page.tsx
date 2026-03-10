import Link from "next/link";
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
  type CustomerFormStatus,
} from "@/lib/ops/customers";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function getFormStatusLabel(status: CustomerFormStatus): string {
  if (status === "submitted") {
    return "Form tamamlandi";
  }

  if (status === "draft") {
    return "Form taslak";
  }

  return "Form yok";
}

function getConsentStatusLabel(status: CustomerConsentStatus): string {
  return status === "accepted" ? "Onay kayitli" : "Onay yok";
}

function getFormBadgeClassName(status: CustomerFormStatus): string {
  if (status === "submitted") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "draft") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700";
  }

  return "border-border bg-muted/40 text-foreground";
}

function getConsentBadgeClassName(status: CustomerConsentStatus): string {
  return status === "accepted"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    : "border-border bg-muted/40 text-foreground";
}

export default async function OpsStaffCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const customers = await listCustomers(query);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
          Ekip / Musteriler
        </Badge>
        <div className="space-y-2">
          <h1 className="typo-page-title">Musteriler</h1>
          <p className="typo-p text-muted-foreground">
            Hizli arama, temel durum ozetleri ve detay ekranina gecis ayni listede tutulur.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Arama</CardTitle>
          <CardDescription>
            Isim, telefon veya e-posta ile arayin. Liste yalniz `user` rolundeki hesaplari gosterir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/ops/staff/musteriler" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              name="q"
              defaultValue={query}
              placeholder="Isim, telefon veya e-posta"
              autoComplete="off"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/35"
            >
              Ara
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
          <CardDescription>
            {customers.length
              ? `${customers.length} musteri bulundu.`
              : "Aramaya uygun musteri bulunamadi."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customers.length ? (
            customers.map((customer) => {
              const nextAppointmentText = formatCustomerAppointmentShort(customer.nextAppointment);

              return (
                <Link
                  key={customer.userId}
                  href={`/ops/staff/musteriler/${customer.userId}`}
                  className="block rounded-3xl border border-border bg-card p-4 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground">
                        {getCustomerLabel(customer)}
                      </p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{customer.email ?? "E-posta yok"}</p>
                        <p>{customer.phone ?? "Telefon yok"}</p>
                      </div>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground">Detay</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full border", getFormBadgeClassName(customer.formStatus))}
                    >
                      {getFormStatusLabel(customer.formStatus)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border",
                        getConsentBadgeClassName(customer.consentStatus)
                      )}
                    >
                      {getConsentStatusLabel(customer.consentStatus)}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border bg-surface-1 p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Siradaki randevu
                    </p>
                    <p className="mt-2 text-foreground">
                      {nextAppointmentText ?? "Yaklasan randevu yok."}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Eslesen musteri yok. Arama kelimesini sadelestirip tekrar deneyin.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
