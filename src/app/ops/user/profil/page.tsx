import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsUserProfilePage() {
  return (
    <OpsPlaceholderPage
      eyebrow="User / Profil"
      title="Profil"
      description="User profil yuzeyi ops-local shell icinde placeholder olarak acildi."
      nextStep="Gercek profil verisi ve oturum baglantisi auth foundation sonrasinda eklenecek."
      primaryHref="/ops/user/randevular"
      primaryLabel="Randevulara git"
      secondaryHref="/ops/giris"
      secondaryLabel="Ops girise don"
    />
  );
}
