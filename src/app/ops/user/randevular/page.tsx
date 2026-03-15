import Link from "next/link";
import { Clock3 } from "lucide-react";
import { OpsUserAppointmentCreateForm } from "@/components/ops/ops-user-appointment-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  getUserWorkspaceOverview,
  isUserReadyForAppointments,
} from "@/lib/ops/user-workspace";
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

function AppointmentCard({
  status,
  source,
  appointmentDate,
  appointmentTime,
  notes,
  createdByName,
}: {
  status: keyof typeof APPOINTMENT_STATUS_LABELS;
  source?: keyof typeof APPOINTMENT_SOURCE_LABELS;
  appointmentDate: string;
  appointmentTime: string;
  notes: string | null;
  createdByName?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn("rounded-full border", getStatusBadgeClassName(status))}
        >
          {APPOINTMENT_STATUS_LABELS[status]}
        </Badge>
        {source ? (
          <Badge variant="outline" className="rounded-full">
            {APPOINTMENT_SOURCE_LABELS[source]}
          </Badge>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">
          {formatAppointmentDateLong(appointmentDate)}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-4" aria-hidden />
            {appointmentTime}
          </span>
          {createdByName ? <span>Kaydı açan: {createdByName}</span> : null}
        </div>
      </div>

      <p className="mt-2.5 text-sm text-foreground">{notes ?? "Not eklenmedi."}</p>
    </div>
  );
}

export default async function OpsUserAppointmentsPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const [overview, appointmentLists] = await Promise.all([
    getUserWorkspaceOverview(sessionUser.id),
    listUserAppointments(sessionUser.id),
  ]);
  const isReadyForAppointments = isUserReadyForAppointments(overview);
  const hasUpcomingAppointments = appointmentLists.upcoming.length > 0;
  const needsProfile = !overview.isProfileComplete;
  const showPrerequisiteCard = !hasUpcomingAppointments && !isReadyForAppointments;
  const showCreateCard = !hasUpcomingAppointments && isReadyForAppointments;

  return (
    <div className="ops-page-shell">
      {showPrerequisiteCard ? (
        <Card className="border-border bg-surface-1/70">
          <CardContent className="space-y-3.5 px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Randevu alanı
              </p>
              <p className="text-lg font-semibold text-foreground">Profil bilgilerin eksik</p>
              <p className="text-sm text-muted-foreground">
                Ad soyad ve telefon bilgini kaydetmeden randevu talebi açılamaz.
              </p>
            </div>

            <Button asChild size="cta" className="w-full sm:w-auto">
              <Link href="/ops/user/profil">Profili düzenle</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {showCreateCard ? (
        <Card className="overflow-hidden">
          <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
            <div className="space-y-1">
              <CardTitle>Yeni randevu</CardTitle>
              <CardDescription>
                Uygun gün ve saati seçerek randevu oluşturabilirsiniz.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
            <OpsUserAppointmentCreateForm defaultDate={getTodayDateValue()} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-5">
        <Card className="overflow-hidden">
          <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
            <CardTitle>Yaklaşan randevular</CardTitle>
            <CardDescription>Aktif randevularınızı buradan görüntüleyebilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
            {appointmentLists.upcoming.length ? (
              appointmentLists.upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  status={appointment.status}
                  source={appointment.source}
                  appointmentDate={appointment.appointmentDate}
                  appointmentTime={appointment.appointmentTime}
                  notes={appointment.notes}
                  createdByName={appointment.createdByName}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border px-3.5 py-4 text-sm text-muted-foreground">
                Yaklaşan randevun yok.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
            <CardTitle>Geçmiş</CardTitle>
            <CardDescription>Geçmiş randevularınız burada görünür.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
            {appointmentLists.past.length ? (
              appointmentLists.past.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  status={appointment.status}
                  appointmentDate={appointment.appointmentDate}
                  appointmentTime={appointment.appointmentTime}
                  notes={appointment.notes}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border px-3.5 py-4 text-sm text-muted-foreground">
                Geçmiş randevu yok.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
