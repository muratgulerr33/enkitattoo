import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffAppointmentsPage() {
  return (
    <OpsPlaceholderPage
      eyebrow="Staff / Randevular"
      title="Randevular"
      description="Staff randevu alaninin bos iskeleti acildi. Dashboard yok; dogrudan gorev tabli operasyon akisi hedefleniyor."
      nextStep="Appointments domain modeli ve cakisma kontrolu sonraki PR icinde ele alinacak."
      primaryHref="/ops/staff/musteriler"
      primaryLabel="Musterilere git"
      secondaryHref="/ops/staff/kasa"
      secondaryLabel="Kasaya don"
    />
  );
}
