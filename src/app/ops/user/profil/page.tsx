import { OpsProfileForm } from "@/components/ops/ops-profile-form";
import { Badge } from "@/components/ui/badge";
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
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Profil bilgileri</CardTitle>
              <CardDescription>İletişim bilgilerini burada güncellersin.</CardDescription>
            </div>
            <Badge
              variant={overview.isProfileComplete ? "default" : "outline"}
              className="rounded-full"
            >
              {overview.isProfileComplete ? "Hazır" : "Eksik"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="rounded-xl border border-border bg-surface-1 px-3 py-2.5 text-sm text-muted-foreground">
            {overview.isProfileComplete
              ? "Profilin hazır. İstersen bilgilerini güncelleyebilirsin."
              : "Ad soyad ve telefonunu ekle. Randevularda bunları kullanırız."}
          </div>

          <OpsProfileForm
            email={overview.profile.email}
            fullName={overview.profile.fullName}
            displayName={overview.profile.displayName}
            phone={overview.profile.phone}
          />
        </CardContent>
      </Card>
    </div>
  );
}
