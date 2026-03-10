import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffCustomersPage() {
  return (
    <OpsPlaceholderPage
      eyebrow="Staff / Musteriler"
      title="Musteriler"
      description="Musteri yuzeyi ayri ops shell icinde acildi. Public artist, hub veya SEO mantigina bagli degildir."
      nextStep="Customer profili, tattoo form ve consent yuzeyleri sonraki PR'lara birakildi."
      primaryHref="/ops/staff/profil"
      primaryLabel="Profile git"
      secondaryHref="/ops/staff/randevular"
      secondaryLabel="Randevulara don"
    />
  );
}
