import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { getUserWorkspaceNextStep, getUserWorkspaceOverview } from "@/lib/ops/user-workspace";

export default async function OpsUserProfilePage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const nextStep = getUserWorkspaceNextStep(overview);
  const isCurrentStep = nextStep.key === "profile";

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
              : "İletişim bilgilerini kaydet. Form ve randevu alanları bu bilgilerle çalışır."}
          </div>

          <OpsProfileForm
            email={overview.profile.email}
            fullName={overview.profile.fullName}
            displayName={overview.profile.displayName}
            phone={overview.profile.phone}
          />
        </CardContent>
      </Card>

      {!isCurrentStep ? (
        <Card className="border-border bg-surface-1/70">
          <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Sonraki adım
              </p>
              <p className="text-base font-semibold text-foreground">{nextStep.title}</p>
              <p className="text-sm text-muted-foreground">{nextStep.description}</p>
            </div>

            <Button asChild size="cta" className="w-full sm:w-auto">
              <Link href={nextStep.href}>
                {nextStep.actionLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
