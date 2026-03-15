import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OpsApprovalReader } from "@/components/ops/ops-approval-reader";
import {
  APPROVAL_LEGAL_DOCUMENT_IDS,
  type LegalDocumentId,
} from "@/lib/legal/legal-registry";
import {
  getLegalDocumentById,
  getOpsApprovalReaderMarkdown,
} from "@/lib/legal/legal-content";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  getUserWorkspaceOverview,
} from "@/lib/ops/user-workspace";

type PageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

function isApprovalDocumentId(value: string): value is (typeof APPROVAL_LEGAL_DOCUMENT_IDS)[number] {
  return APPROVAL_LEGAL_DOCUMENT_IDS.includes(value as LegalDocumentId);
}

function formatAcceptanceDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function OpsUserApprovalDocumentPage({ params }: PageProps) {
  const { documentId } = await params;

  if (!isApprovalDocumentId(documentId)) {
    notFound();
  }

  const sessionUser = await requireOpsSessionArea("user");
  const [document, overview] = await Promise.all([
    getLegalDocumentById(documentId),
    getUserWorkspaceOverview(sessionUser.id),
  ]);

  const isTattooDocument = document.approvalKind === "tattoo";
  const approvalSubject = isTattooDocument ? "Dövme onayı" : "Piercing onayı";
  const approvalRecorded = isTattooDocument
    ? overview.hasCurrentTattooConsent
    : overview.hasCurrentPiercingConsent;
  const latestApproval = isTattooDocument
    ? overview.latestTattooConsent
    : overview.latestPiercingConsent;
  const cleanedMarkdown = getOpsApprovalReaderMarkdown(document.markdown);
  const acceptedAtLabel = formatAcceptanceDate(latestApproval?.acceptedAt ?? null);

  return (
    <div className="ops-page-shell">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 rounded-xl px-2.5">
          <Link href="/ops/user/onaylar">
            <ChevronLeft className="size-4" aria-hidden />
            Onaylara dön
          </Link>
        </Button>
        <Badge variant={approvalRecorded ? "default" : "outline"} className="rounded-full">
          {approvalRecorded ? "Tamamlandı" : "Oku ve onayla"}
        </Badge>
      </div>

      <Card id="approval-document-top" className="overflow-hidden">
        <CardHeader className="gap-2.5 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div className="space-y-1">
            <CardTitle>{document.title}</CardTitle>
            {document.summary ? <CardDescription>{document.summary}</CardDescription> : null}
          </div>

          <div className="rounded-xl border border-border bg-surface-1/55 px-3.5 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {approvalRecorded
                ? `${approvalSubject} kaydedildi.`
                : "Belgeyi okuyup alttan onay ver."}
            </p>
            <p className="mt-1">
              {approvalRecorded && acceptedAtLabel
                ? `Kaydedildi: ${acceptedAtLabel}`
                : "Son satıra geldiğinde onay alanı açılır."}
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <OpsApprovalReader
            documentId={documentId}
            markdown={cleanedMarkdown}
            approvalEnabled={Boolean(document.approvalKind)}
            approvalRecorded={approvalRecorded}
            approvalRecordedAtLabel={acceptedAtLabel}
            documentAnchorId="approval-document-top"
          />
        </CardContent>
      </Card>
    </div>
  );
}
