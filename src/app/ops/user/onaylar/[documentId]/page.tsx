import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
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
  COMBINED_APPROVAL_LEGAL_DOCUMENT_ID,
  LEGACY_APPROVAL_LEGAL_DOCUMENT_IDS,
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
  return value === COMBINED_APPROVAL_LEGAL_DOCUMENT_ID;
}

function isLegacyApprovalDocumentId(
  value: string
): value is (typeof LEGACY_APPROVAL_LEGAL_DOCUMENT_IDS)[number] {
  return LEGACY_APPROVAL_LEGAL_DOCUMENT_IDS.includes(
    value as (typeof LEGACY_APPROVAL_LEGAL_DOCUMENT_IDS)[number],
  );
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

  if (isLegacyApprovalDocumentId(documentId)) {
    permanentRedirect(`/ops/user/onaylar/${COMBINED_APPROVAL_LEGAL_DOCUMENT_ID}`);
  }

  if (!isApprovalDocumentId(documentId)) {
    notFound();
  }

  const sessionUser = await requireOpsSessionArea("user");
  const [document, overview] = await Promise.all([
    getLegalDocumentById(documentId),
    getUserWorkspaceOverview(sessionUser.id),
  ]);

  const approvalRecorded = overview.hasCurrentConsent;
  const latestApproval = overview.latestConsent;
  const cleanedMarkdown = getOpsApprovalReaderMarkdown(document.markdown);
  const acceptedAtLabel = formatAcceptanceDate(latestApproval?.acceptedAt ?? null);

  return (
    <div className="ops-page-shell">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 rounded-xl px-2.5">
          <Link href="/ops/user/onaylar">
            <ChevronLeft className="size-4" aria-hidden />
            Onaylara dön
          </Link>
        </Button>
      </div>

      <Card id="approval-document-top" className="overflow-hidden">
        <CardHeader className="gap-1.5 px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5">
          <div className="space-y-1">
            <CardTitle>{document.title}</CardTitle>
            {document.summary ? <CardDescription>{document.summary}</CardDescription> : null}
          </div>

          {approvalRecorded && acceptedAtLabel ? (
            <p className="text-sm text-muted-foreground">Kaydedildi: {acceptedAtLabel}</p>
          ) : null}
        </CardHeader>

        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <OpsApprovalReader
            documentId={documentId}
            markdown={cleanedMarkdown}
            approvalEnabled
            approvalRecorded={approvalRecorded}
            approvalRecordedAtLabel={acceptedAtLabel}
            documentAnchorId="approval-document-top"
          />
        </CardContent>
      </Card>
    </div>
  );
}
