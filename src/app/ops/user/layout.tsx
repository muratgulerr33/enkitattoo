import { OpsShell } from "@/components/ops/ops-shell";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { USER_NAV_ITEMS } from "@/lib/ops/navigation";

export default async function OpsUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await requireOpsSessionArea("user");

  return (
    <OpsShell areaLabel="Hesabım" navItems={USER_NAV_ITEMS} sessionUser={sessionUser}>
      {children}
    </OpsShell>
  );
}
