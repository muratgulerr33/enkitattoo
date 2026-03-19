import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";

function getDisplayName(sessionUser: Awaited<ReturnType<typeof requireOpsSessionArea>>) {
  return sessionUser.displayName ?? sessionUser.fullName ?? sessionUser.email ?? "Ops kullanıcısı";
}

function formatRoleLabel(role: Awaited<ReturnType<typeof requireOpsSessionArea>>["roles"][number]) {
  if (role === "admin") {
    return "Yönetici";
  }

  if (role === "artist") {
    return "Artist";
  }

  return "Kullanıcı";
}

const QUICK_LINKS = [
  {
    href: "/ops/staff/randevular",
    label: "İşlemler",
  },
  {
    href: "/ops/staff/musteriler",
    label: "Müşteriler",
  },
] as const;

export default async function OpsStaffProfilePage() {
  const sessionUser = await requireOpsSessionArea("staff");
  const displayName = getDisplayName(sessionUser);
  const roleSummary = sessionUser.roles.map(formatRoleLabel).join(", ");

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)] xl:gap-5">
        <Card>
          <CardHeader className="gap-2 border-b pb-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Aktif hesap
            </p>
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <CardDescription>Kısa hesap özeti.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                E-posta
              </p>
              <p className="mt-1 break-words text-sm font-medium text-foreground">
                {sessionUser.email ?? "Belirtilmemiş"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rol
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{roleSummary}</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kullanım notu
              </p>
              <p className="mt-1 text-sm text-foreground/80">
                Ana akış işlemlerden başlar.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1.5">
            <CardTitle>Bugün</CardTitle>
            <CardDescription>Ana işi açın.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              İşlem akışı ana yüzeydir. Müşteri listesi gerektiğinde açılır.
            </p>

            {QUICK_LINKS.map((item) => (
              <Button key={item.href} asChild variant={item.href.includes("/randevular") ? "default" : "outline"} size="cta" className="w-full">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
