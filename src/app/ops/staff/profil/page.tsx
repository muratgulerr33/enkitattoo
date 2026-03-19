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

export default async function OpsStaffProfilePage() {
  const sessionUser = await requireOpsSessionArea("staff");
  const displayName = getDisplayName(sessionUser);
  const roleSummary = sessionUser.roles.map(formatRoleLabel).join(", ");

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] xl:items-start xl:gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="gap-3 border-b pb-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Profil
            </p>
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <CardDescription>Hesap ve erişim özeti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>

            <div className="rounded-2xl border border-border bg-surface-1/45 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Çalışma ritmi
              </p>
              <div className="mt-2 space-y-2 text-sm text-foreground/80">
                <p>Günün ana akışı işlemler yüzeyinden yürür.</p>
                <p>Müşteriler ve kasa gerektiğinde açılan yardımcı alanlar olarak kalır.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface-1/45 xl:sticky xl:top-24">
          <CardHeader className="gap-1.5 border-b pb-4">
            <CardTitle>Bugün</CardTitle>
            <CardDescription>Kısa yön.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/80 bg-background/75 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ana yüzey
              </p>
              <p className="mt-1 text-sm text-foreground">İşlemler çalışma alanıdır.</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-background/75 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Yardımcı alanlar
              </p>
              <p className="mt-1 text-sm text-foreground/80">
                Kasa son kontrol içindir. Profil hesap bilgilerini kısa tutar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
