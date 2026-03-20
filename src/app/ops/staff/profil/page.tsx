import Link from "next/link";
import { OpsArtistManagement } from "@/components/ops/ops-artist-management";
import { OpsPasswordChangeForm } from "@/components/ops/ops-password-change-form";
import { OpsProfileForm } from "@/components/ops/ops-profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  getArtistManagementOverview,
  type ArtistManagementFilter,
} from "@/lib/ops/artists";
import { getUserWorkspaceProfile } from "@/lib/ops/user-workspace";

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

function getArtistFilter(value?: string): ArtistManagementFilter {
  if (value === "inactive" || value === "all") {
    return value;
  }

  return "active";
}

type PageProps = {
  searchParams: Promise<{
    artistStatus?: string;
  }>;
};

export default async function OpsStaffProfilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionUser = await requireOpsSessionArea("staff");
  const profile = await getUserWorkspaceProfile(sessionUser.id);
  const displayName = getDisplayName(sessionUser);
  const roleSummary = sessionUser.roles.map(formatRoleLabel).join(", ");
  const isAdmin = sessionUser.roles.includes("admin");
  const artistOverview = isAdmin
    ? await getArtistManagementOverview(getArtistFilter(params.artistStatus))
    : null;

  return (
    <div className="ops-page-shell">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start xl:gap-6">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="gap-2 border-b pb-4">
              <div className="space-y-1">
                <CardTitle>Ayarlar</CardTitle>
                <CardDescription>Hesap bilgilerinizi ve erişim özetinizi buradan yönetin.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hesap
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface-1/55 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rol
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{roleSummary}</p>
                </div>
              </div>

              <OpsProfileForm
                email={profile.email}
                fullName={profile.fullName}
                displayName={profile.displayName}
                phone={profile.phone}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="gap-2 border-b pb-4">
              <div className="space-y-1">
                <CardTitle>Şifre değiştir</CardTitle>
                <CardDescription>Eski şifrenizle yeni şifrenizi buradan tanımlayın.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <OpsPasswordChangeForm />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="gap-2 border-b pb-4">
              <div className="space-y-1">
                <CardTitle>Oturum</CardTitle>
                <CardDescription>Bu cihazdaki ops oturumunuzu buradan kapatabilirsiniz.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link href="/ops/cikis">Çıkış</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {isAdmin && artistOverview ? (
          <Card className="overflow-hidden">
            <CardHeader className="gap-2 border-b pb-4">
              <div className="space-y-1">
                <CardTitle>Artist yönetimi</CardTitle>
                <CardDescription>Sadece artist hesaplarını bu alandan oluşturup güncelleyebilirsiniz.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <OpsArtistManagement
                filter={artistOverview.filter}
                counts={artistOverview.counts}
                artists={artistOverview.artists}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/80 bg-surface-1/45">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle>Çalışma alanı</CardTitle>
              <CardDescription>Staff erişimi admin ve artist için aynı yüzeylerden yürür.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="rounded-2xl border border-border/80 bg-background/75 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ana akış
                </p>
                <p className="mt-1 text-sm text-foreground">İşlemler, müşteriler, rapor ve kasa aynı staff akışındadır.</p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background/75 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Yetki farkı
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  Artist yönetimi yalnız yönetici hesabında görünür.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
