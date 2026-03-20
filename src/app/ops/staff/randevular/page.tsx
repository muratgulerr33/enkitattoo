import { OpsStaffAppointmentsWorkspace } from "@/components/ops/ops-staff-appointments-workspace";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { listActiveArtistOptions } from "@/lib/ops/artists";
import {
  getDefaultSelectedDay,
  isDateInMonth,
  isValidDateValue,
  listAppointmentsForMonth,
  listCustomerOptions,
  parseMonthValue,
} from "@/lib/ops/appointments";
import {
  listLatestServiceIntakesByAppointmentIds,
  listWalkInServiceIntakesForMonth,
} from "@/lib/ops/service-intakes";

type PageProps = {
  searchParams: Promise<{
    month?: string;
    day?: string;
  }>;
};

export default async function OpsStaffAppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const monthValue = parseMonthValue(params.month);
  const [sessionUser, monthAppointments, customerOptions, monthWalkIns, artistOptions] =
    await Promise.all([
      requireOpsSessionArea("staff"),
      listAppointmentsForMonth(monthValue),
      listCustomerOptions(),
      listWalkInServiceIntakesForMonth(monthValue),
      listActiveArtistOptions(),
    ]);
  const scheduledMonthAppointments = monthAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const linkedServiceIntakes = await listLatestServiceIntakesByAppointmentIds(
    scheduledMonthAppointments.map((appointment) => appointment.id)
  );
  const serviceIntakesByAppointmentId = new Map(
    linkedServiceIntakes
      .filter((serviceIntake) => serviceIntake.appointmentId !== null)
      .map((serviceIntake) => [serviceIntake.appointmentId as number, serviceIntake])
  );

  const scheduledAppointments = scheduledMonthAppointments
    .map((appointment) => ({
      id: appointment.id,
      source: "appointment" as const,
      appointmentId: appointment.id,
      serviceIntakeId: serviceIntakesByAppointmentId.get(appointment.id)?.id ?? null,
      customerUserId: appointment.customerUserId,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      scheduledDate: appointment.appointmentDate,
      scheduledTime: appointment.appointmentTime,
      notes: appointment.notes,
      serviceSummary: (() => {
        const serviceIntake = serviceIntakesByAppointmentId.get(appointment.id);

        if (!serviceIntake) {
          return null;
        }

        return {
          id: serviceIntake.id,
          artistUserId: serviceIntake.artistUserId,
          artistName: serviceIntake.artistName,
          serviceType: serviceIntake.serviceType,
          totalAmountCents: serviceIntake.totalAmountCents,
          collectedAmountCents: serviceIntake.collectedAmountCents,
        };
      })(),
    }));
  const walkInSessions = monthWalkIns.map((serviceIntake) => ({
    id: serviceIntake.id,
    source: "walk_in" as const,
    appointmentId: null,
    serviceIntakeId: serviceIntake.id,
    customerUserId: serviceIntake.customerUserId,
    customerName: serviceIntake.customerName,
    customerEmail: serviceIntake.customerEmail,
    scheduledDate: serviceIntake.scheduledDate,
    scheduledTime: serviceIntake.scheduledTime,
    notes: serviceIntake.notes,
    serviceSummary: {
      id: serviceIntake.id,
      artistUserId: serviceIntake.artistUserId,
      artistName: serviceIntake.artistName,
      serviceType: serviceIntake.serviceType,
      totalAmountCents: serviceIntake.totalAmountCents,
      collectedAmountCents: serviceIntake.collectedAmountCents,
    },
  }));

  const requestedDay =
    params.day && isValidDateValue(params.day) && isDateInMonth(params.day, monthValue)
      ? params.day
      : null;
  const initialSelectedDay = getDefaultSelectedDay(monthValue, requestedDay);

  return (
    <OpsStaffAppointmentsWorkspace
      monthValue={monthValue}
      initialSelectedDay={initialSelectedDay}
      sessions={[...scheduledAppointments, ...walkInSessions]}
      customerOptions={customerOptions}
      artistOptions={artistOptions.map((artist) => ({
        id: artist.userId,
        label: artist.label,
      }))}
      currentStaffUserId={sessionUser.id}
      currentStaffRoles={sessionUser.roles}
    />
  );
}
