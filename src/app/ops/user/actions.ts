"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  acceptCurrentConsent,
  createTattooFormSnapshot,
  getLatestTattooForm,
  type SaveTattooFormInput,
  updateUserWorkspaceProfile,
} from "@/lib/ops/user-workspace";

export type OpsFormActionState = {
  error: string | null;
  success: string | null;
};

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
  revalidatePath("/ops/user/profil");
  revalidatePath("/ops/user/form");
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
        error: "Formda en az bir alan doldurun.",
        success: null,
      };
    }

    if (intent === "submit" && (!input.placement || !input.sizeNotes || !input.designNotes)) {
      return {
        error: "Formu tamamlamak için bölge, boyut ve tasarım notu gerekli.",
        success: null,
      };
    }

    await createTattooFormSnapshot(sessionUser.id, input);
    revalidateUserWorkspacePaths();

    return {
      error: null,
      success: intent === "submit" ? "Form tamamlandı." : "Taslak kaydedildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Form kaydedilemedi.",
      success: null,
    };
  }
}

function getRequestMetadata(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized.slice(0, maxLength) : null;
}

export async function acceptConsentAction(
  _previousState: OpsFormActionState,
  formData: FormData
): Promise<OpsFormActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const latestForm = await getLatestTattooForm(sessionUser.id);

    if (!latestForm || latestForm.status !== "submitted") {
      return {
        error: "Onaydan önce formu tamamlayın.",
        success: null,
      };
    }

    if (formData.get("accepted") !== "on") {
      return {
        error: "Devam etmek için kutuyu işaretleyin.",
        success: null,
      };
    }

    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const ipAddress = getRequestMetadata(
      forwardedFor?.split(",")[0] ?? requestHeaders.get("x-real-ip"),
      64
    );
    const userAgent = getRequestMetadata(requestHeaders.get("user-agent"), 512);

    const { created } = await acceptCurrentConsent(sessionUser.id, {
      ipAddress,
      userAgent,
    });

    revalidateUserWorkspacePaths();

    return {
      error: null,
      success: created ? "Onay kaydedildi." : "Bu sürüm için onay zaten kayıtlı.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Onay kaydedilemedi.",
      success: null,
    };
  }
}
