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
  const overview = await getUserWorkspaceOverview(sessionUser.id);
  const tattooAcceptedAt = formatAcceptanceDate(overview.latestConsent?.acceptedAt ?? null);

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
                  <CardTitle className="text-base">Dövme onayı</CardTitle>
                  <CardDescription>Güncel dövme belgesi durumu</CardDescription>
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
              <ApprovalDetailRow label="Belge" value="Dövme onayı" />
              <ApprovalDetailRow label="Durum" value={overview.hasCurrentConsent ? "Kayıtlı" : "Kayıt yok"} />
              <ApprovalDetailRow label="Sürüm" value={OPS_TATTOO_CONSENT_VERSION} />
              <ApprovalDetailRow
                label="Hesap kaydı"
                value={tattooAcceptedAt ?? "Güncel kayıt yok"}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1/70">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">Piercing onayı</CardTitle>
                  <CardDescription>Hesap bağlı piercing belgesi durumu</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Kayıt yok
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ApprovalDetailRow label="Belge" value="Piercing onayı" />
              <ApprovalDetailRow label="Durum" value="Kayıt yok" />
              <ApprovalDetailRow label="Sürüm" value="Henüz tanımlı değil" />
              <ApprovalDetailRow label="Hesap kaydı" value="Bu hesapta kayıt görünmüyor" />
              <p className="text-sm text-muted-foreground">
                Gerekli belge stüdyoda ayrıca paylaşılır.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
