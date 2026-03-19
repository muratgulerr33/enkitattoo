import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffProfilePage() {
  return (
    <OpsPlaceholderPage
      title="Profil"
      description="Hesap bilgilerinizi bu alanda göreceksiniz."
      nextStep="Şimdilik işlemlere dönebilir veya çıkış yapabilirsiniz."
      primaryHref="/ops/staff/randevular"
      primaryLabel="İşlemlere git"
      secondaryHref="/ops/giris"
      secondaryLabel="Girişe dön"
    />
  );
}
