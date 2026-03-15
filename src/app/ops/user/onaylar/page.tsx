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
import {
  getUserWorkspaceOverview,
  OPS_TATTOO_CONSENT_VERSION,
} from "@/lib/ops/user-workspace";

function formatAcceptanceDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function ApprovalDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-right text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default async function OpsUserApprovalsPage() {
  const sessionUser = await requireOpsSessionArea("user");
  const [overview, approvalDocuments] = await Promise.all([
    getUserWorkspaceOverview(sessionUser.id),
    listApprovalLegalDocuments(),
  ]);
  const tattooAcceptedAt = formatAcceptanceDate(overview.latestConsent?.acceptedAt ?? null);
  const tattooDocument = approvalDocuments.find((document) => document.approvalKind === "tattoo");
  const piercingDocument = approvalDocuments.find(
    (document) => document.approvalKind === "piercing",
  );

  return (
    <div className="ops-page-shell">
      <Card className="overflow-hidden">
        <CardHeader className="gap-2 px-5 pt-5 pb-3 sm:px-6">
          <div className="space-y-1">
            <CardTitle>Onaylar</CardTitle>
            <CardDescription>Hesabındaki belge durumları burada görünür.</CardDescription>
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
                  variant={overview.hasCurrentConsent ? "default" : "outline"}
                  className="rounded-full"
                >
                  {overview.hasCurrentConsent ? "Kayıtlı" : "Kayıt yok"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ApprovalDetailRow
                label="Belge"
                value={tattooDocument?.label ?? "Dövme Sözleşmesi"}
              />
              <ApprovalDetailRow label="Durum" value={overview.hasCurrentConsent ? "Kayıtlı" : "Kayıt yok"} />
              <ApprovalDetailRow label="Sürüm" value={OPS_TATTOO_CONSENT_VERSION} />
              <ApprovalDetailRow
                label="Hesap kaydı"
                value={tattooAcceptedAt ?? "Güncel kayıt yok"}
              />
              {tattooDocument ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={tattooDocument.publicPath}>Metni oku</Link>
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
                <Badge variant="outline" className="rounded-full">
                  Kayıt yok
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ApprovalDetailRow
                label="Belge"
                value={piercingDocument?.label ?? "Piercing Sözleşmesi"}
              />
              <ApprovalDetailRow label="Durum" value="Kayıt yok" />
              <ApprovalDetailRow label="Sürüm" value="Henüz tanımlı değil" />
              <ApprovalDetailRow label="Hesap kaydı" value="Bu hesapta kayıt görünmüyor" />
              {piercingDocument ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={piercingDocument.publicPath}>Metni oku</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
