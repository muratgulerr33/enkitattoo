import type { AppointmentSource, AppointmentStatus } from "@/db/schema";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Planlandı",
  completed: "Tamamlandı",
  cancelled: "İptal edildi",
  no_show: "Gelmedi",
};

export const APPOINTMENT_SOURCE_LABELS: Record<AppointmentSource, string> = {
  customer: "Müşteri",
  admin: "Admin",
  artist: "Artist",
};
