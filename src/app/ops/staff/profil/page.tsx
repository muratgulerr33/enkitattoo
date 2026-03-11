import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffProfilePage() {
  return (
    <OpsPlaceholderPage
      title="Profil"
      description="Hesap bilgilerinizi bu alanda göreceksiniz."
      nextStep="Şimdilik kasaya dönebilir veya çıkış yapabilirsiniz."
      primaryHref="/ops/staff/kasa"
      primaryLabel="Kasaya git"
      secondaryHref="/ops/giris"
      secondaryLabel="Girişe dön"
    />
  );
}
