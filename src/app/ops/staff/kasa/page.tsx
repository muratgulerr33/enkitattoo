import { OpsPlaceholderPage } from "@/components/ops/ops-placeholder-page";

export default function OpsStaffCashPage() {
  return (
    <OpsPlaceholderPage
      eyebrow="Staff / Kasa"
      title="Kasa"
      description="Kasa yuzeyi locale-disindan bagimsiz ops shell icinde acildi. Bu PR yalnizca route ve shell foundation kurar."
      nextStep="Cash entries omurgasi ve islem akislarinin sonraki PR'larda eklenmesi beklenir."
      primaryHref="/ops/staff/randevular"
      primaryLabel="Randevulara git"
      secondaryHref="/ops/giris"
      secondaryLabel="Ops girise don"
    />
  );
}
