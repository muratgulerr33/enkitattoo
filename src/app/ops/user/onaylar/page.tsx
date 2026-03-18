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

function buildConsentStatusCopy(hasCurrentConsent: boolean, acceptedAtLabel: string | null): {
  badgeLabel: string;
  summary: string;
  detail: string | null;
} {
  if (hasCurrentConsent) {
    return {
      badgeLabel: "Tamamlandı",
      summary: "Sözleşme onayın tamamlandı.",
      detail: acceptedAtLabel
        ? `${acceptedAtLabel} tarihinde kaydedildi.`
        : "İstersen metni yeniden inceleyebilirsin.",
    };
  }

  return {
    badgeLabel: "Bekliyor",
    summary: "Sözleşmeyi açıp onay verebilirsiniz.",
    detail: null,
  };
}

export default async function OpsUserApprovalsPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const [overview, approvalDocuments] = await Promise.all([
    getUserWorkspaceOverview(sessionUser.id),
    listApprovalLegalDocuments(),
  ]);
  const approvalDocument = approvalDocuments[0] ?? null;
  const acceptedAt = formatAcceptanceDate(overview.latestConsent?.acceptedAt ?? null);
  const approvalStatus = buildConsentStatusCopy(overview.hasCurrentConsent, acceptedAt);

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
          <div className="space-y-1">
            <CardTitle>Onaylar</CardTitle>
            <CardDescription>Sözleşmenizi buradan açıp onay verebilirsiniz.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <Card className="border-border bg-surface-1/55">
            <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {approvalDocument?.label ?? "Dövme ve Piercing Sözleşmesi"}
                  </CardTitle>
                  <CardDescription>
                    {approvalDocument?.summary ?? "Sözleşme bilgisi bu alanda görünür."}
                  </CardDescription>
                </div>
                <Badge
                  variant={overview.hasCurrentConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {approvalStatus.badgeLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 px-4 pb-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{approvalStatus.summary}</p>
                {approvalStatus.detail ? (
                  <p className="text-muted-foreground">{approvalStatus.detail}</p>
                ) : null}
              </div>
              {approvalDocument ? (
                <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
                  <Link href={`/ops/user/onaylar/${approvalDocument.id}`}>Sözleşmeyi aç</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
