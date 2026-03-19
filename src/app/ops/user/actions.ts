"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { COMBINED_APPROVAL_LEGAL_DOCUMENT_ID } from "@/lib/legal/legal-registry";
import {
  acceptCurrentCombinedConsent,
} from "@/lib/ops/user-workspace";

export type OpsFormActionState = {
  error: string | null;
  success: string | null;
};

type ApprovalDocumentId = typeof COMBINED_APPROVAL_LEGAL_DOCUMENT_ID;

function revalidateUserWorkspacePaths() {
  revalidatePath("/ops/user/onaylar");
  revalidatePath("/ops/user/profil");
  revalidatePath("/ops/user/randevular");
}

async function getApprovalRequestMetadata(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const userAgent = requestHeaders.get("user-agent");

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null,
    userAgent: userAgent?.trim() || null,
  };
}

export async function saveConsentApprovalAction(
  _previousState: OpsFormActionState,
  formData: FormData
): Promise<OpsFormActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const documentId = formData.get("documentId");
    const accepted = formData.get("accepted");

    if (documentId !== COMBINED_APPROVAL_LEGAL_DOCUMENT_ID) {
      return {
        error: "Bu belge için hesap onayı açılamadı.",
        success: null,
      };
    }

    if (accepted !== "on") {
      return {
        error: "Onayı kaydetmek için kutuyu işaretleyin.",
        success: null,
      };
    }

    const metadata = await getApprovalRequestMetadata();
    const approvalDocumentId = documentId as ApprovalDocumentId;
    const { created } = await acceptCurrentCombinedConsent(sessionUser.id, metadata);

    revalidateUserWorkspacePaths();
    revalidatePath(`/ops/user/onaylar/${approvalDocumentId}`);
    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${sessionUser.id}`);

    return {
      error: null,
      success: created
        ? "Sözleşme onayın hesabına kaydedildi."
        : "Bu sürüm için kayıtlı sözleşme onayın zaten var.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Onay kaydedilemedi.",
      success: null,
    };
  }
}
