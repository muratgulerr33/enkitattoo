import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffProfilePage() {
  return (
    <OpsPlaceholderPage
      eyebrow="Staff / Profil"
      title="Profil"
      description="Admin ve artist ortak shell mantigi icin profil yuzeyi placeholder olarak acildi."
      nextStep="Gercek oturum ve rol tabanli profil verisi bu PR kapsaminda degil."
      primaryHref="/ops/staff/kasa"
      primaryLabel="Kasaya git"
      secondaryHref="/ops/giris"
      secondaryLabel="Ops girise don"
    />
  );
}
