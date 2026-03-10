import type { AppointmentSource, AppointmentStatus } from "@/db/schema";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Planlandi",
  completed: "Tamamlandi",
  cancelled: "Iptal edildi",
  no_show: "Gelmedi",
};

export const APPOINTMENT_SOURCE_LABELS: Record<AppointmentSource, string> = {
  customer: "Musteri",
  admin: "Admin",
  artist: "Artist",
};
