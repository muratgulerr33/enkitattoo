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
  getUserWorkspaceOverview,
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";
import { OpsTattooForm } from "@/components/ops/ops-tattoo-form";
import { OpsConsentForm } from "@/components/ops/ops-consent-form";

function formatFormStatus(value: "draft" | "submitted" | null): string {
  if (value === "submitted") {
    return "Tamamlandi";
  }

  if (value === "draft") {
    return "Taslak";
  }

  return "Henuz baslanmadi";
}

export default async function OpsUserFormPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const latestTattooForm = overview.latestTattooForm;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
          Hesabim / Formum
        </Badge>
        <div className="space-y-2">
          <h1 className="typo-page-title">Formum</h1>
          <p className="typo-p text-muted-foreground">
            Dovme formunu kaydedin, bitince acik onayi verin.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Durum</CardTitle>
          <CardDescription>Form ve onay adimlari ayri kayit tutulur.</CardDescription>
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
                ? `Kayit #${latestTattooForm.snapshotVersion}`
                : "Ilk kayit henuz yok"}
            </p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Onay
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {overview.hasCurrentConsent ? "Kayitli" : "Bekliyor"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Surum {OPS_TATTOO_CONSENT_VERSION}</p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profil
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {overview.isProfileComplete ? "Hazir" : "Eksik"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Iletisim bilgileri profil ekraninda duzenlenir
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dovme formu</CardTitle>
          <CardDescription>
            Taslak kaydedebilir veya formu tamamlayabilirsiniz. Her kayit yeni bir form surumu olusturur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OpsTattooForm latestTattooForm={latestTattooForm} />
        </CardContent>
      </Card>

      <Card id="onay">
        <CardHeader>
          <CardTitle>Acik onay</CardTitle>
          <CardDescription>
            Uyelik tek basina yeterli degil. Bu kutu isaretlenmeden onay kaydi olusmaz.
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
