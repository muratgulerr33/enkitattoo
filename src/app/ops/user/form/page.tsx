import Link from "next/link";
import { OpsTattooForm } from "@/components/ops/ops-tattoo-form";
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

function getEditorDescription(value: "draft" | "submitted" | null): string {
  if (value === "submitted") {
    return "Kaydettiğin dövme detaylarını burada gözden geçirir ve gerektiğinde güncellersin.";
  }

  if (value === "draft") {
    return "Kaydettiğin taslağı burada sürdürür, dövme detaylarını istediğin zaman düzenlersin.";
  }

  return "Randevu öncesi paylaşmak istediğin dövme detaylarını burada eklersin.";
}

export default async function OpsUserFormPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const latestTattooForm = overview.latestTattooForm;

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="space-y-1">
            <CardTitle>Dövme detayları</CardTitle>
            <CardDescription>
              {getEditorDescription(latestTattooForm?.status ?? null)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          {!overview.isProfileComplete ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-1 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Önce profil bilgilerini ekle</p>
                <p className="text-sm text-muted-foreground">
                  Randevu kaydı için ad soyad ve telefon bilgini de ekle.
                </p>
              </div>
              <Button asChild variant="outline" size="cta" className="w-full sm:w-auto">
                <Link href="/ops/user/profil">Profili aç</Link>
              </Button>
            </div>
          ) : null}

          <OpsTattooForm latestTattooForm={latestTattooForm} />
        </CardContent>
      </Card>
    </div>
  );
}
