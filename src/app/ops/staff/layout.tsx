import { OpsShell } from "@/components/ops/ops-shell";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { STAFF_NAV_ITEMS } from "@/lib/ops/navigation";

export default async function OpsStaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await requireOpsSessionArea("staff");

  return (
    <OpsShell areaLabel="Staff" navItems={STAFF_NAV_ITEMS} sessionUser={sessionUser}>
      {children}
    </OpsShell>
  );
}
