import { OpsStaffAppointmentsWorkspace } from "@/components/ops/ops-staff-appointments-workspace";
import {
  getDefaultSelectedDay,
  isDateInMonth,
  isValidDateValue,
  listAppointmentsForMonth,
  listCustomerOptions,
  parseMonthValue,
} from "@/lib/ops/appointments";
import { listLatestServiceIntakesByAppointmentIds } from "@/lib/ops/service-intakes";

type PageProps = {
  searchParams: Promise<{
    month?: string;
    day?: string;
  }>;
};

export default async function OpsStaffAppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const monthValue = parseMonthValue(params.month);
  const [monthAppointments, customerOptions] = await Promise.all([
    listAppointmentsForMonth(monthValue),
    listCustomerOptions(),
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
      customerUserId: appointment.customerUserId,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
      serviceSummary: (() => {
        const serviceIntake = serviceIntakesByAppointmentId.get(appointment.id);

        if (!serviceIntake) {
          return null;
        }

        return {
          id: serviceIntake.id,
          serviceType: serviceIntake.serviceType,
          totalAmountCents: serviceIntake.totalAmountCents,
          collectedAmountCents: serviceIntake.collectedAmountCents,
        };
      })(),
    }));

  const initialSelectedDay =
    params.day && isValidDateValue(params.day) && isDateInMonth(params.day, monthValue)
      ? getDefaultSelectedDay(monthValue, params.day)
      : null;

  return (
    <OpsStaffAppointmentsWorkspace
      monthValue={monthValue}
      initialSelectedDay={initialSelectedDay}
      appointments={scheduledAppointments}
      customerOptions={customerOptions}
    />
  );
}
