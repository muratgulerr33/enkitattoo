import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OpsConsentForm } from "@/components/ops/ops-consent-form";
import { OpsTattooForm } from "@/components/ops/ops-tattoo-form";
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
import {
  getUserWorkspaceNextStep,
  getUserWorkspaceOverview,
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";

function formatFormStatus(value: "draft" | "submitted" | null): string {
  if (value === "submitted") {
    return "Tamamlandı";
  }

  if (value === "draft") {
    return "Taslak";
  }

  return "Henüz başlanmadı";
}

export default async function OpsUserFormPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const latestTattooForm = overview.latestTattooForm;
  const nextStep = getUserWorkspaceNextStep(overview);

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Dövme formu</CardTitle>
              <CardDescription>
                Gerekli alanları doldurup formu tamamlayabilir ya da önce taslak kaydedebilirsin.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={latestTattooForm?.status === "submitted" ? "default" : "outline"}
                className="rounded-full"
              >
                {formatFormStatus(latestTattooForm?.status ?? null)}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {latestTattooForm
                  ? `Kayıt #${latestTattooForm.snapshotVersion}`
                  : "İlk kayıt"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          {!overview.isProfileComplete ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-1 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Profil adımı hâlâ eksik</p>
                <p className="text-sm text-muted-foreground">
                  Formu doldurabilirsin; randevu için profilini de tamamlaman gerekir.
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

      <Card id="onay" className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Açık onay</CardTitle>
              <CardDescription>
                {overview.hasCurrentConsent
                  ? "Güncel onay kaydı var. İstersen randevu adımına geçebilirsin."
                  : overview.isTattooFormSubmitted
                    ? "Form tamamlandı. Şimdi onayı kaydet."
                    : "Onay, form tamamlandıktan sonra açılır."}
              </CardDescription>
            </div>
            <Badge
              variant={overview.hasCurrentConsent ? "default" : "outline"}
              className="rounded-full"
            >
              {overview.hasCurrentConsent ? "Kayıtlı" : "Bekliyor"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="rounded-2xl border border-border bg-surface-1 px-3.5 py-3 text-sm text-muted-foreground">
            Sürüm <span className="font-medium text-foreground">{OPS_TATTOO_CONSENT_VERSION}</span>
          </div>

          <OpsConsentForm
            consent={overview.latestConsent}
            canAccept={overview.isTattooFormSubmitted}
            documentVersion={OPS_TATTOO_CONSENT_VERSION}
          />
        </CardContent>
      </Card>

      {nextStep.key === "appointments" ? (
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
