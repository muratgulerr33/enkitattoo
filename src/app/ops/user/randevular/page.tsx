import Link from "next/link";
import { CalendarDays, Clock3, FileText, ShieldCheck, UserRound } from "lucide-react";
import { OpsUserAppointmentCreateForm } from "@/components/ops/ops-user-appointment-create-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatAppointmentDateLong,
  getTodayDateValue,
  listUserAppointments,
} from "@/lib/ops/appointments";
import {
  APPOINTMENT_SOURCE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/ops/appointment-copy";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { getUserWorkspaceOverview } from "@/lib/ops/user-workspace";
import { cn } from "@/lib/utils";

function getStatusBadgeClassName(status: keyof typeof APPOINTMENT_STATUS_LABELS): string {
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

export default async function OpsUserAppointmentsPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const [overview, appointmentLists] = await Promise.all([
    getUserWorkspaceOverview(sessionUser.id),
    listUserAppointments(sessionUser.id),
  ]);
  const hasAppointmentPrepGap =
    !overview.isProfileComplete ||
    !overview.isTattooFormSubmitted ||
    !overview.hasCurrentConsent;

  return (
    <div className="ops-page-shell">
      <section className="ops-page-header">
        <h1 className="typo-page-title">Randevularım</h1>
        <p className="ops-page-intro">
          Yeni talep açın, yaklaşan kayıtları görün ve geçmişi aynı akışta takip edin.
        </p>
      </section>

      {hasAppointmentPrepGap ? (
        <Card>
          <CardHeader className="gap-1.5">
            <CardTitle>Hazırlık durumu</CardTitle>
            <CardDescription>Eksik adımlar varsa önce bunları tamamlayın.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Link
              href="/ops/user/profil"
              className="rounded-2xl border border-border p-4 transition-colors hover:bg-muted/35"
            >
              <div className="flex items-center gap-2">
                <UserRound className="size-4" aria-hidden />
                <p className="text-sm font-medium text-foreground">Profil</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.isProfileComplete ? "Hazır" : "Eksik"}
              </p>
            </Link>
            <Link
              href="/ops/user/form"
              className="rounded-2xl border border-border p-4 transition-colors hover:bg-muted/35"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4" aria-hidden />
                <p className="text-sm font-medium text-foreground">Dövme formu</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.isTattooFormSubmitted ? "Tamamlandı" : "Bekliyor"}
              </p>
            </Link>
            <Link
              href="/ops/user/form#onay"
              className="rounded-2xl border border-border p-4 transition-colors hover:bg-muted/35"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" aria-hidden />
                <p className="text-sm font-medium text-foreground">Açık onay</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.hasCurrentConsent ? "Kayıtlı" : "Bekliyor"}
              </p>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-6">
        <Card>
          <CardHeader className="gap-1.5">
            <CardTitle>Yeni randevu</CardTitle>
            <CardDescription>
              Tarih ve saat seçin. Uygun değilse kısa bir hata mesajı görürsünüz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OpsUserAppointmentCreateForm defaultDate={getTodayDateValue()} />
          </CardContent>
        </Card>

        <div className="space-y-5 sm:space-y-6">
          <Card>
            <CardHeader className="gap-1.5">
              <CardTitle>Yaklaşan randevular</CardTitle>
              <CardDescription>Sadece size ait aktif kayıtlar listelenir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointmentLists.upcoming.length ? (
                appointmentLists.upcoming.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border",
                          getStatusBadgeClassName(appointment.status)
                        )}
                      >
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {APPOINTMENT_SOURCE_LABELS[appointment.source]}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-base font-semibold text-foreground">
                        {formatAppointmentDateLong(appointment.appointmentDate)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-4" aria-hidden />
                          {appointment.appointmentTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-4" aria-hidden />
                          {appointment.createdByName}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground">
                      {appointment.notes ?? "Ek not yok."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Yaklaşan randevunuz henüz yok.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1.5">
              <CardTitle>Geçmiş</CardTitle>
              <CardDescription>Tamamlanan veya kapanan kayıtlar burada kalır.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointmentLists.past.length ? (
                appointmentLists.past.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border",
                          getStatusBadgeClassName(appointment.status)
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
                  Geçmiş kayıt henüz yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
