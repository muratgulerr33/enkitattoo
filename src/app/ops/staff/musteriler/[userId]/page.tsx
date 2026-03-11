import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpsCustomerNoteForm } from "@/components/ops/ops-customer-note-form";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/ops/appointment-copy";
import {
  formatAppointmentDateLong,
} from "@/lib/ops/appointments";
import { getCustomerDetail, getCustomerLabel } from "@/lib/ops/customers";
import {
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function getFormStatusLabel(status: "draft" | "submitted" | null): string {
  if (status === "submitted") {
    return "Tamamlandı";
  }

  if (status === "draft") {
    return "Taslak";
  }

  return "Yok";
}

function getFormStatusClassName(status: "draft" | "submitted" | null): string {
  if (status === "submitted") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "draft") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700";
  }

  return "border-border bg-muted/40 text-foreground";
}

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

  const latestForm = customer.workspace.latestTattooForm;

  return (
    <div className="ops-page-shell">
      <section className="ops-page-header">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="typo-page-title">{getCustomerLabel(customer)}</h1>
          <Link
            href="/ops/staff/musteriler"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Listeye dön
          </Link>
        </div>
        <p className="ops-page-intro">
          Temel bilgi, not ve randevu geçmişi aynı ekranda birlikte görünür.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-6">
        <Card>
          <CardHeader className="gap-1.5">
            <CardTitle>Temel bilgi</CardTitle>
            <CardDescription>İletişim ve profil bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ad soyad
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {customer.fullName ?? "Kayıt yok"}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Görünen ad
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {customer.displayName ?? "Kayıt yok"}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                E-posta
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {customer.email ?? "Kayıt yok"}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Telefon
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {customer.phone ?? "Kayıt yok"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1.5">
            <CardTitle>Durum</CardTitle>
            <CardDescription>Form ve onay durumu birlikte izlenir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Form
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-3 rounded-full border",
                  getFormStatusClassName(latestForm?.status ?? null)
                )}
              >
                {getFormStatusLabel(latestForm?.status ?? null)}
              </Badge>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Onay
              </p>
              <p className="mt-3 text-sm font-medium text-foreground">
                {customer.workspace.hasCurrentConsent ? "Güncel sürüm onaylandı" : "Yok"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Sürüm {OPS_TATTOO_CONSENT_VERSION}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Profil
              </p>
              <p className="mt-3 text-sm font-medium text-foreground">
                {customer.workspace.isProfileComplete ? "Hazır" : "Eksik"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-6">
        <div className="flex flex-col gap-5 sm:gap-6">
          <Card className="order-2 xl:order-1">
            <CardHeader className="gap-1.5">
              <CardTitle>Form özeti</CardTitle>
              <CardDescription>Son aktif kayıt görüntülenir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestForm ? (
                <>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Bölge
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {latestForm.placement ?? "Kayıt yok"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Boyut
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {latestForm.sizeNotes ?? "Kayıt yok"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tasarım notu
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {latestForm.designNotes ?? "Kayıt yok"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Tattoo formu henüz yok.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="order-1 xl:order-2">
            <CardHeader className="gap-1.5">
              <CardTitle>Staff notu</CardTitle>
              <CardDescription>Kısa ve güncel not alanı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.note ? (
                <div className="rounded-2xl border border-border bg-surface-1 p-4 text-sm text-muted-foreground">
                  <p>{customer.note.updatedByName}</p>
                  <p className="mt-1">
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
            <CardHeader className="gap-1.5">
              <CardTitle>Yaklaşan randevular</CardTitle>
              <CardDescription>Planlı ve ileride kalan randevular burada görünür.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.upcomingAppointments.length ? (
                customer.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-3xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
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
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {formatAppointmentDateLong(appointment.appointmentDate)} ·{" "}
                      {appointment.appointmentTime}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {appointment.notes ?? "Ek not yok."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Yaklaşan randevu yok.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1.5">
              <CardTitle>Geçmiş</CardTitle>
              <CardDescription>Tamamlanan veya kapanan randevular burada kalır.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.pastAppointments.length ? (
                customer.pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-3xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
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
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {formatAppointmentDateLong(appointment.appointmentDate)} ·{" "}
                      {appointment.appointmentTime}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {appointment.notes ?? "Ek not yok."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Geçmiş randevu yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
