export type OpsNavItem = {
  href: string;
  label: string;
  shortLabel: string;
};

export const OPS_LOGIN_HREF = "/ops/giris";

export const STAFF_NAV_ITEMS: OpsNavItem[] = [
  { href: "/ops/staff/randevular", label: "İşlemler", shortLabel: "İşlemler" },
  { href: "/ops/staff/musteriler", label: "Müşteriler", shortLabel: "Müşteri" },
  { href: "/ops/staff/kasa", label: "Kasa", shortLabel: "Kasa" },
  { href: "/ops/staff/profil", label: "Profil", shortLabel: "Profil" },
];

export const USER_NAV_ITEMS: OpsNavItem[] = [
  { href: "/ops/user/onaylar", label: "Onaylar", shortLabel: "Onaylar" },
  { href: "/ops/user/randevular", label: "Randevular", shortLabel: "Randevular" },
  { href: "/ops/user/profil", label: "Profil", shortLabel: "Profil" },
];
