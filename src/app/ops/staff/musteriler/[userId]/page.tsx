import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OpsCustomerNoteForm } from "@/components/ops/ops-customer-note-form";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/ops/appointment-copy";
import { formatAppointmentDateLong } from "@/lib/ops/appointments";
import { getCustomerDetail, getCustomerLabel } from "@/lib/ops/customers";
import { formatOpsMoneyDisplay } from "@/lib/ops/money";
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
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/12 dark:text-emerald-200";
  }

  if (status === "completed") {
    return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/12 dark:text-sky-200";
  }

  if (status === "cancelled") {
    return "border-border bg-muted/40 text-foreground dark:border-border/85 dark:bg-surface-1/68";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/12 dark:text-amber-200";
}

function getCustomerContactLine(customer: {
  phone: string | null;
}): string | null {
  return customer.phone?.trim() || null;
}

function getAppointmentEmptyMessage(section: "upcoming" | "past"): string {
  return section === "upcoming" ? "Yaklaşan kayıt yok." : "Geçmiş kayıt yok.";
}

function getServiceTypeLabel(value: string): string {
  return value === "piercing" ? "Piercing" : "Dövme";
}

function getFieldValue(value: string | null, emptyLabel = "Belirtilmemiş"): string {
  return value?.trim() || emptyLabel;
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

  const customerLabel = getCustomerLabel(customer);
  const contactLine = getCustomerContactLine(customer);
  const latestServiceIntake = customer.latestServiceIntake;
  const latestServiceRemainingAmountCents = latestServiceIntake
    ? Math.max(0, latestServiceIntake.totalAmountCents - latestServiceIntake.collectedAmountCents)
    : 0;
  const latestNoteUpdatedAt = customer.note
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(customer.note.updatedAt)
    : null;

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

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.76fr)_minmax(0,1.24fr)] xl:gap-6">
        <Card className="dark:border-border/90 dark:bg-card/96">
          <CardHeader className="gap-1 px-5 py-5">
            <CardTitle>Temel bilgi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-5 gap-y-4 pt-0 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ad soyad
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {getFieldValue(customer.fullName)}
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
                {getFieldValue(customer.phone)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-foreground/10 bg-surface-1/25 dark:border-border/90 dark:bg-surface-1/48">
          <CardHeader className="gap-1 px-5 py-5">
            <CardTitle>İşlem özeti</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {latestServiceIntake ? (
              <div className="space-y-3.5">
                <div className="rounded-[1.7rem] border border-border bg-card px-4 py-4 dark:border-border/90 dark:bg-card/96">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground dark:text-muted-foreground/92">
                    Son işlem
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {getServiceTypeLabel(latestServiceIntake.serviceType)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/92">
                    {formatAppointmentDateLong(latestServiceIntake.scheduledDate)} ·{" "}
                    {latestServiceIntake.scheduledTime}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3 dark:border-border/88 dark:bg-card/96">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground/92">
                      Toplam
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatOpsMoneyDisplay(latestServiceIntake.totalAmountCents)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card px-4 py-3 dark:border-border/88 dark:bg-card/96">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground/92">
                      Kapora
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatOpsMoneyDisplay(latestServiceIntake.collectedAmountCents)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card px-4 py-3 dark:border-border/88 dark:bg-card/96">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground/92">
                      Kalan
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatOpsMoneyDisplay(latestServiceRemainingAmountCents)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground dark:border-border/80 dark:bg-surface-1/46 dark:text-muted-foreground/92">
                Henüz işlem kaydı yok.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.76fr)_minmax(0,1.24fr)] xl:gap-6">
        <Card className="dark:border-border/90 dark:bg-card/96">
          <CardHeader className="gap-1 px-5 py-5">
            <CardTitle>Artist notu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {customer.note ? (
              <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3 text-sm text-muted-foreground dark:border-border/90 dark:bg-surface-1/74 dark:text-muted-foreground/92">
                <p className="font-medium text-foreground">{customer.note.updatedByName}</p>
                {latestNoteUpdatedAt ? (
                  <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/88">{latestNoteUpdatedAt}</p>
                ) : null}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {customer.note.note}
                </p>
              </div>
            ) : null}

            <OpsCustomerNoteForm customerUserId={customer.userId} note={customer.note?.note ?? null} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5 sm:gap-6">
          <Card className="dark:border-border/90 dark:bg-card/96">
            <CardHeader className="gap-1 px-5 py-5">
              <CardTitle>Yaklaşan işlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.upcomingAppointments.length ? (
                customer.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[1.45rem] border border-border bg-card px-4 py-3.5 dark:border-border/90 dark:bg-card/96"
                  >
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
                      <div className="mt-3 rounded-xl bg-surface-1/45 px-3 py-2.5 dark:bg-surface-1/72">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground dark:text-muted-foreground/92">
                          Not
                        </p>
                        <p className="mt-1 text-sm leading-5 text-foreground/82 dark:text-foreground/88">
                          {appointment.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground dark:border-border/80 dark:bg-surface-1/46 dark:text-muted-foreground/92">
                  {getAppointmentEmptyMessage("upcoming")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dark:border-border/90 dark:bg-card/96">
            <CardHeader className="gap-1 px-5 py-5">
              <CardTitle>Geçmiş işlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.pastAppointments.length ? (
                customer.pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[1.45rem] border border-border bg-card px-4 py-3.5 dark:border-border/90 dark:bg-card/96"
                  >
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
                      <div className="mt-3 rounded-xl bg-surface-1/45 px-3 py-2.5 dark:bg-surface-1/72">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground dark:text-muted-foreground/92">
                          Not
                        </p>
                        <p className="mt-1 text-sm leading-5 text-foreground/82 dark:text-foreground/88">
                          {appointment.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground dark:border-border/80 dark:bg-surface-1/46 dark:text-muted-foreground/92">
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
