import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { listApprovalLegalDocuments } from "@/lib/legal/legal-content";
import { getUserWorkspaceOverview } from "@/lib/ops/user-workspace";

function formatAcceptanceDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildTattooStatusCopy(hasCurrentConsent: boolean, acceptedAtLabel: string | null): {
  badgeLabel: string;
  summary: string;
  detail: string;
} {
  if (hasCurrentConsent) {
    return {
      badgeLabel: "Tamamlandı",
      summary: "Dövme onayın tamamlandı.",
      detail: acceptedAtLabel
        ? `${acceptedAtLabel} tarihinde kaydedildi.`
        : "İstersen metni yeniden inceleyebilirsin.",
    };
  }

  return {
    badgeLabel: "İncele",
    summary: "Belgeyi açıp dövme onayını tamamlayabilirsin.",
    detail: "Okuduktan sonra tek onay yeterli.",
  };
}

function buildPiercingStatusCopy(hasCurrentConsent: boolean, acceptedAtLabel: string | null): {
  badgeLabel: string;
  summary: string;
  detail: string;
} {
  if (hasCurrentConsent) {
    return {
      badgeLabel: "Tamamlandı",
      summary: "Piercing onayın tamamlandı.",
      detail: acceptedAtLabel
        ? `${acceptedAtLabel} tarihinde kaydedildi.`
        : "İstersen metni yeniden inceleyebilirsin.",
    };
  }

  return {
    badgeLabel: "İncele",
    summary: "Belgeyi açıp piercing onayını tamamlayabilirsin.",
    detail: "Okuduktan sonra tek onay yeterli.",
  };
}

export default async function OpsUserApprovalsPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const [overview, approvalDocuments] = await Promise.all([
    getUserWorkspaceOverview(sessionUser.id),
    listApprovalLegalDocuments(),
  ]);
  const tattooAcceptedAt = formatAcceptanceDate(overview.latestTattooConsent?.acceptedAt ?? null);
  const piercingAcceptedAt = formatAcceptanceDate(overview.latestPiercingConsent?.acceptedAt ?? null);
  const tattooDocument = approvalDocuments.find((document) => document.approvalKind === "tattoo");
  const piercingDocument = approvalDocuments.find(
    (document) => document.approvalKind === "piercing",
  );
  const tattooStatus = buildTattooStatusCopy(overview.hasCurrentTattooConsent, tattooAcceptedAt);
  const piercingStatus = buildPiercingStatusCopy(
    overview.hasCurrentPiercingConsent,
    piercingAcceptedAt,
  );

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="space-y-1">
            <CardTitle>Onaylar</CardTitle>
            <CardDescription>Onay gerektiren belgeler burada görünür.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:px-6 lg:grid-cols-2">
          <Card className="border-border bg-surface-1/70">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {tattooDocument?.label ?? "Dövme Sözleşmesi"}
                  </CardTitle>
                  <CardDescription>
                    {tattooDocument?.summary ?? "Dövme belgesi bilgisi bu alanda görünür."}
                  </CardDescription>
                </div>
                <Badge
                  variant={overview.hasCurrentTattooConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {tattooStatus.badgeLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-sm font-medium text-foreground">{tattooStatus.summary}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tattooStatus.detail}</p>
              </div>
              {tattooDocument ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/ops/user/onaylar/${tattooDocument.id}`}>Belgeyi aç</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1/70">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {piercingDocument?.label ?? "Piercing Sözleşmesi"}
                  </CardTitle>
                  <CardDescription>
                    {piercingDocument?.summary ??
                      "Piercing belgesi bilgisi bu alanda görünür."}
                  </CardDescription>
                </div>
                <Badge
                  variant={overview.hasCurrentPiercingConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {piercingStatus.badgeLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-sm font-medium text-foreground">{piercingStatus.summary}</p>
                <p className="mt-2 text-sm text-muted-foreground">{piercingStatus.detail}</p>
              </div>
              {piercingDocument ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/ops/user/onaylar/${piercingDocument.id}`}>Belgeyi aç</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
