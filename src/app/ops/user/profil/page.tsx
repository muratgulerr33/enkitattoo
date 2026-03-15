import Link from "next/link";
import { OpsProfileForm } from "@/components/ops/ops-profile-form";
import { Button } from "@/components/ui/button";
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

function getFormShortcutState(
  latestTattooForm: {
    status: "draft" | "submitted";
  } | null
): {
  statusLabel: string;
  actionLabel: string;
  description: string;
} {
  if (!latestTattooForm) {
    return {
      statusLabel: "Henüz detay yok",
      actionLabel: "Detayları ekle",
      description: "Randevu öncesi paylaşmak istediğin dövme detaylarını buradan ekleyebilirsin.",
    };
  }

  if (latestTattooForm.status === "draft") {
    return {
      statusLabel: "Taslak hazır",
      actionLabel: "Taslağı sürdür",
      description: "Kaydettiğin dövme detayları burada duruyor. İstersen gözden geçirip tamamlayabilirsin.",
    };
  }

  return {
    statusLabel: "Detaylar kayıtlı",
    actionLabel: "Detayları güncelle",
    description: "Kaydettiğin dövme detaylarını gözden geçirip gerektiğinde güncelleyebilirsin.",
  };
}

export default async function OpsUserProfilePage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const formShortcut = getFormShortcutState(overview.latestTattooForm);

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Profil bilgileri</CardTitle>
              <CardDescription>E-posta sabit kalır. Bilgilerini burada güncellersin.</CardDescription>
            </div>
            <Badge
              variant={overview.isProfileComplete ? "default" : "outline"}
              className="rounded-full"
            >
              {overview.isProfileComplete ? "Hazır" : "Eksik"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="rounded-2xl border border-border bg-surface-1 px-3.5 py-3 text-sm text-muted-foreground">
            {overview.isProfileComplete
              ? "Profil hazır. İstersen bilgilerini güncelleyebilirsin."
              : "İletişim bilgilerini kaydet. Randevu kayıtları bu bilgilerle eşleşir."}
          </div>

          <OpsProfileForm
            email={overview.profile.email}
            fullName={overview.profile.fullName}
            displayName={overview.profile.displayName}
            phone={overview.profile.phone}
          />
        </CardContent>
      </Card>

      {overview.isProfileComplete ? (
        <Card className="border-border bg-surface-1/70">
          <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {formShortcut.statusLabel}
              </p>
              <p className="text-base font-semibold text-foreground">Dövme detayları</p>
              <p className="text-sm text-muted-foreground">{formShortcut.description}</p>
            </div>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/ops/user/form">{formShortcut.actionLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
