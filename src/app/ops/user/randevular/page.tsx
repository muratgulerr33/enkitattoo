import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsUserAppointmentsPage() {
  return (
    <OpsPlaceholderPage
      eyebrow="User / Randevular"
      title="Randevularim"
      description="User tarafinda sade shell kullaniliyor. Bu yuzey public locale subtree ve public shell'den ayridir."
      nextStep="Gercek kullanici randevu goruntuleme ve aksiyonlari sonraki PR kapsaminda acilacak."
      primaryHref="/ops/user/profil"
      primaryLabel="Profile git"
      secondaryHref="/ops/giris"
      secondaryLabel="Ops girise don"
    />
  );
}
