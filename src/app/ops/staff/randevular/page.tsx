import { OpsStaffAppointmentsWorkspace } from "@/components/ops/ops-staff-appointments-workspace";
import {
  getDefaultSelectedDay,
  isDateInMonth,
  isValidDateValue,
  listAppointmentsForMonth,
  listCustomerOptions,
  parseMonthValue,
} from "@/lib/ops/appointments";

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
  const scheduledAppointments = monthAppointments
    .filter((appointment) => appointment.status === "scheduled")
    .map((appointment) => ({
      id: appointment.id,
      customerUserId: appointment.customerUserId,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes,
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
