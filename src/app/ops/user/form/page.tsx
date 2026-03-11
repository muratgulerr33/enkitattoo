import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  getUserWorkspaceOverview,
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";
import { OpsTattooForm } from "@/components/ops/ops-tattoo-form";
import { OpsConsentForm } from "@/components/ops/ops-consent-form";

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

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="typo-page-title">Formum</h1>
        <p className="typo-p text-muted-foreground">
          Dövme formunu kaydedin, bitince açık onayı verin.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Durum</CardTitle>
          <CardDescription>Form ve onay adımları ayrı kayıt tutulur.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Form
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {formatFormStatus(latestTattooForm?.status ?? null)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {latestTattooForm
                ? `Kayıt #${latestTattooForm.snapshotVersion}`
                : "İlk kayıt henüz yok"}
            </p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Onay
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {overview.hasCurrentConsent ? "Kayıtlı" : "Bekliyor"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Sürüm {OPS_TATTOO_CONSENT_VERSION}</p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profil
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {overview.isProfileComplete ? "Hazır" : "Eksik"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              İletişim bilgileri profil ekranında düzenlenir
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dövme formu</CardTitle>
          <CardDescription>
            Taslak kaydedebilir veya formu tamamlayabilirsiniz. Her kayıt yeni bir form sürümü oluşturur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OpsTattooForm latestTattooForm={latestTattooForm} />
        </CardContent>
      </Card>

      <Card id="onay">
        <CardHeader>
          <CardTitle>Açık onay</CardTitle>
          <CardDescription>
            Üyelik tek başına yeterli değil. Bu kutu işaretlenmeden onay kaydı oluşmaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OpsConsentForm
            consent={overview.latestConsent}
            canAccept={overview.isTattooFormSubmitted}
            documentVersion={OPS_TATTOO_CONSENT_VERSION}
          />
        </CardContent>
      </Card>
    </div>
  );
}
