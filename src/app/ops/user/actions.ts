"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  acceptCurrentConsent,
  acceptCurrentPiercingConsent,
  createTattooFormSnapshot,
  type SaveTattooFormInput,
  updateUserWorkspaceProfile,
} from "@/lib/ops/user-workspace";

export type OpsFormActionState = {
  error: string | null;
  success: string | null;
};

type ApprovalDocumentId = "dovme-sozlesmesi" | "piercing-sozlesmesi";

function emptyToNull(value: FormDataEntryValue | null, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("Girdiler beklenenden uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function isPhoneValid(phone: string): boolean {
  return /^[0-9+\s()\-]{7,32}$/.test(phone);
}

function revalidateUserWorkspacePaths() {
  revalidatePath("/ops/user/onaylar");
  revalidatePath("/ops/user/profil");
  revalidatePath("/ops/user/form");
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

export async function updateUserProfileAction(
  _previousState: OpsFormActionState,
  formData: FormData
): Promise<OpsFormActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const fullName = emptyToNull(formData.get("fullName"), 160);
    const displayName = emptyToNull(formData.get("displayName"), 120);
    const phone = emptyToNull(formData.get("phone"), 32);

    if (!fullName) {
      return {
        error: "Ad soyad gerekli.",
        success: null,
      };
    }

    if (!phone) {
      return {
        error: "Telefon gerekli.",
        success: null,
      };
    }

    if (!isPhoneValid(phone)) {
      return {
        error: "Telefon bilgisini daha sade yazın.",
        success: null,
      };
    }

    await updateUserWorkspaceProfile(sessionUser.id, {
      fullName,
      displayName,
      phone,
    });

    revalidateUserWorkspacePaths();

    return {
      error: null,
      success: "Profil kaydedildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Profil kaydedilemedi.",
      success: null,
    };
  }
}

function toTattooFormInput(formData: FormData, intent: "save" | "submit"): SaveTattooFormInput {
  return {
    placement: emptyToNull(formData.get("placement"), 160),
    sizeNotes: emptyToNull(formData.get("sizeNotes"), 160),
    designNotes: emptyToNull(formData.get("designNotes"), 1200),
    styleNotes: emptyToNull(formData.get("styleNotes"), 800),
    colorNotes: emptyToNull(formData.get("colorNotes"), 120),
    referenceNotes: emptyToNull(formData.get("referenceNotes"), 1000),
    healthNotes: emptyToNull(formData.get("healthNotes"), 800),
    status: intent === "submit" ? "submitted" : "draft",
  };
}

export async function saveTattooFormAction(
  _previousState: OpsFormActionState,
  formData: FormData
): Promise<OpsFormActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const rawIntent = formData.get("intent");
    const intent = rawIntent === "submit" ? "submit" : "save";
    const currentStatus = formData.get("currentStatus");
    const input = toTattooFormInput(formData, intent);

    const hasAnyValue = Boolean(
      input.placement ||
      input.sizeNotes ||
      input.designNotes ||
      input.styleNotes ||
      input.colorNotes ||
      input.referenceNotes ||
      input.healthNotes
    );

    if (!hasAnyValue) {
      return {
        error: "En az bir detay girin.",
        success: null,
      };
    }

    if (intent === "submit" && (!input.placement || !input.sizeNotes || !input.designNotes)) {
      return {
        error: "Detayları kaydetmek için bölge, boyut ve tasarım notu gerekli.",
        success: null,
      };
    }

    await createTattooFormSnapshot(sessionUser.id, input);
    revalidateUserWorkspacePaths();

    return {
      error: null,
      success:
        intent === "submit"
          ? currentStatus === "submitted"
            ? "Dövme detayların güncellendi."
            : "Dövme detayların kaydedildi."
          : "Taslak kaydedildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Dövme detayları kaydedilemedi.",
      success: null,
    };
  }
}

export async function saveTattooApprovalAction(
  _previousState: OpsFormActionState,
  formData: FormData
): Promise<OpsFormActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const documentId = formData.get("documentId");
    const accepted = formData.get("accepted");

    if (documentId !== "dovme-sozlesmesi" && documentId !== "piercing-sozlesmesi") {
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
    const isTattooDocument = approvalDocumentId === "dovme-sozlesmesi";
    const { created } = isTattooDocument
      ? await acceptCurrentConsent(sessionUser.id, metadata)
      : await acceptCurrentPiercingConsent(sessionUser.id, metadata);
    const approvalLabel = isTattooDocument ? "Dövme onayın" : "Piercing onayın";

    revalidateUserWorkspacePaths();
    revalidatePath("/ops/user/onaylar/dovme-sozlesmesi");
    revalidatePath("/ops/user/onaylar/piercing-sozlesmesi");
    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${sessionUser.id}`);

    return {
      error: null,
      success: created
        ? `${approvalLabel} hesabına kaydedildi.`
        : `Bu sürüm için kayıtlı ${isTattooDocument ? "dövme" : "piercing"} onayın zaten var.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Onay kaydedilemedi.",
      success: null,
    };
  }
}
