import Link from "next/link";
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
import { getUserWorkspaceOverview } from "@/lib/ops/user-workspace";

export default async function OpsUserProfilePage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);

  return (
    <div className="ops-page-shell space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 border-b pb-4">
          <div className="space-y-1">
            <CardTitle>Ayarlar</CardTitle>
            <CardDescription>Hesap bilgilerinizi buradan güncelleyebilirsiniz.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <OpsProfileForm
            email={overview.profile.email}
            fullName={overview.profile.fullName}
            displayName={overview.profile.displayName}
            phone={overview.profile.phone}
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
            <CardDescription>Bu cihazdaki oturumunuzu buradan kapatabilirsiniz.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <Link href="/ops/cikis">Çıkış</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
