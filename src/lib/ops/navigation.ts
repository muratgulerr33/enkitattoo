export type OpsNavItem = {
  href: string;
  label: string;
  shortLabel: string;
};

export const OPS_LOGIN_HREF = "/ops/giris";

export const STAFF_NAV_ITEMS: OpsNavItem[] = [
  { href: "/ops/staff/kasa", label: "Kasa", shortLabel: "Kasa" },
  { href: "/ops/staff/randevular", label: "Randevular", shortLabel: "Randevu" },
  { href: "/ops/staff/musteriler", label: "Müşteriler", shortLabel: "Müşteri" },
  { href: "/ops/staff/profil", label: "Profil", shortLabel: "Profil" },
];

export const USER_NAV_ITEMS: OpsNavItem[] = [
  { href: "/ops/user/randevular", label: "Randevular", shortLabel: "Randevu" },
  { href: "/ops/user/form", label: "Formum", shortLabel: "Form" },
  { href: "/ops/user/profil", label: "Profil", shortLabel: "Profil" },
];
