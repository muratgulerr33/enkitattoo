import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpsCustomerNoteForm } from "@/components/ops/ops-customer-note-form";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/ops/appointment-copy";
import {
  formatAppointmentDateLong,
} from "@/lib/ops/appointments";
import { getCustomerDetail } from "@/lib/ops/customers";
import {
  OPS_PIERCING_CONSENT_VERSION,
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function getAppointmentStatusClassName(
  status: "scheduled" | "completed" | "cancelled" | "no_show"
): string {
  if (status === "scheduled") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "completed") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-700";
  }

  if (status === "cancelled") {
    return "border-border bg-muted/40 text-foreground";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-700";
}

function formatAcceptanceDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getConsentSummary(acceptedAt: string | null): string {
  return acceptedAt ? `Onaylandı ${acceptedAt}` : "Bu sürüm için kayıt yok.";
}

function getCustomerContactLine(customer: {
  phone: string | null;
  email: string | null;
}): string | null {
  const items = [customer.phone, customer.email].filter(Boolean);
  return items.length ? items.join(" · ") : null;
}

function getAppointmentEmptyMessage(section: "upcoming" | "past"): string {
  return section === "upcoming" ? "Yaklaşan kayıt yok." : "Geçmiş kayıt yok.";
}

export default async function OpsStaffCustomerDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const customerUserId = Number(resolvedParams.userId);

  if (!Number.isInteger(customerUserId) || customerUserId <= 0) {
    notFound();
  }

  const customer = await getCustomerDetail(customerUserId);

  if (!customer) {
    notFound();
  }

  const latestTattooConsentAcceptedAt = formatAcceptanceDate(
    customer.workspace.latestTattooConsent?.acceptedAt ?? null
  );
  const latestPiercingConsentAcceptedAt = formatAcceptanceDate(
    customer.workspace.latestPiercingConsent?.acceptedAt ?? null
  );
  const customerLabel =
    customer.fullName ?? customer.displayName ?? customer.email ?? "İsimsiz müşteri";
  const contactLine = getCustomerContactLine(customer);

  return (
    <div className="ops-page-shell">
      <div className="space-y-1">
        <Link
          href="/ops/staff/musteriler"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          Listeye dön
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{customerLabel}</h1>
          {contactLine ? (
            <p className="text-sm text-muted-foreground">{contactLine}</p>
          ) : (
            <p className="text-sm text-muted-foreground">İletişim bilgisi kayıtlı değil.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-6">
        <Card>
          <CardHeader className="gap-1 px-5 py-5">
            <CardTitle>Temel bilgi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-5 gap-y-4 pt-0 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ad soyad
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {customer.fullName ?? "Kayıt yok"}
              </p>
            </div>
            {customer.displayName && customer.displayName !== customer.fullName ? (
              <div className="min-w-0 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Görünen ad
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{customer.displayName}</p>
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Telefon
              </p>
              <p className="mt-1 break-words text-sm font-medium text-foreground">
                {customer.phone ?? "Kayıt yok"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                E-posta
              </p>
              <p className="mt-1 break-words text-sm font-medium text-foreground">
                {customer.email ?? "Kayıt yok"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1 px-5 py-5">
            <CardTitle>Onaylar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="rounded-2xl border border-border px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Dövme onayı</p>
                  <p className="text-xs text-muted-foreground">
                    Sürüm {OPS_TATTOO_CONSENT_VERSION}
                  </p>
                </div>
                <Badge
                  variant={customer.workspace.hasCurrentTattooConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {customer.workspace.hasCurrentTattooConsent ? "Kayıtlı" : "Kayıt yok"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {getConsentSummary(latestTattooConsentAcceptedAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-border px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Piercing onayı</p>
                  <p className="text-xs text-muted-foreground">
                    Sürüm {OPS_PIERCING_CONSENT_VERSION}
                  </p>
                </div>
                <Badge
                  variant={customer.workspace.hasCurrentPiercingConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {customer.workspace.hasCurrentPiercingConsent ? "Kayıtlı" : "Kayıt yok"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {getConsentSummary(latestPiercingConsentAcceptedAt)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/35 px-4 py-3">
              <p className="text-sm text-muted-foreground">Profil</p>
              <p className="text-sm font-medium text-foreground">
                {customer.workspace.isProfileComplete ? "Hazır" : "Eksik"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-6">
        <div className="flex flex-col gap-5 sm:gap-6">
          <Card>
            <CardHeader className="gap-1 px-5 py-5">
              <CardTitle>Staff notu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {customer.note ? (
                <div className="rounded-2xl border border-border bg-surface-1 px-4 py-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{customer.note.updatedByName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(customer.note.updatedAt)}
                  </p>
                </div>
              ) : null}

              <OpsCustomerNoteForm customerUserId={customer.userId} note={customer.note?.note ?? null} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          <Card>
            <CardHeader className="gap-1 px-5 py-5">
              <CardTitle>Yaklaşan randevular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.upcomingAppointments.length ? (
                customer.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-border px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium text-foreground">
                        {formatAppointmentDateLong(appointment.appointmentDate)} ·{" "}
                        {appointment.appointmentTime}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border",
                          getAppointmentStatusClassName(appointment.status)
                        )}
                      >
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </Badge>
                    </div>
                    {appointment.notes ? (
                      <p className="mt-2 text-sm text-muted-foreground">{appointment.notes}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  {getAppointmentEmptyMessage("upcoming")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1 px-5 py-5">
              <CardTitle>Geçmiş randevular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.pastAppointments.length ? (
                customer.pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-border px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium text-foreground">
                        {formatAppointmentDateLong(appointment.appointmentDate)} ·{" "}
                        {appointment.appointmentTime}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border",
                          getAppointmentStatusClassName(appointment.status)
                        )}
                      >
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </Badge>
                    </div>
                    {appointment.notes ? (
                      <p className="mt-2 text-sm text-muted-foreground">{appointment.notes}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  {getAppointmentEmptyMessage("past")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
