"use server";

import { revalidatePath } from "next/cache";
import { getOpsSessionUser, requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { changeOpsUserPassword } from "@/lib/ops/auth/users";
import {
  createArtistAccount,
  updateArtistAccount,
  updateArtistStatus,
} from "@/lib/ops/artists";
import { isPhoneValid } from "@/lib/ops/phone";
import { emptyToNull, type OpsSettingsActionState } from "@/lib/ops/settings";
import { updateUserWorkspaceProfile } from "@/lib/ops/user-workspace";

const SETTINGS_AUTH_ERROR_MESSAGE =
  "Oturum süreniz doldu. Sayfayı yenileyip yeniden giriş yapın.";
const ADMIN_ONLY_MESSAGE = "Bu alan yalnız yöneticiye açık.";

function revalidateSettingsPaths() {
  revalidatePath("/ops/staff/profil");
  revalidatePath("/ops/staff/randevular");
  revalidatePath("/ops/staff/musteriler");
  revalidatePath("/ops/user/onaylar");
  revalidatePath("/ops/user/profil");
  revalidatePath("/ops/user/randevular");
}

function toRequiredNumber(value: FormDataEntryValue | null, message: string): number {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(message);
  }

  return parsed;
}

function assertAdminRole(roles: string[]) {
  if (!roles.includes("admin")) {
    throw new Error(ADMIN_ONLY_MESSAGE);
  }
}

async function requireAuthenticatedSettingsUser() {
  const sessionUser = await getOpsSessionUser();

  if (!sessionUser) {
    throw new Error(SETTINGS_AUTH_ERROR_MESSAGE);
  }

  return sessionUser;
}

export async function updateOwnProfileAction(
  _previousState: OpsSettingsActionState,
  formData: FormData
): Promise<OpsSettingsActionState> {
  try {
    const sessionUser = await requireAuthenticatedSettingsUser();
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

    revalidateSettingsPaths();

    return {
      error: null,
      success: "Ayarlar kaydedildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Ayarlar kaydedilemedi.",
      success: null,
    };
  }
}

export async function changeOwnPasswordAction(
  _previousState: OpsSettingsActionState,
  formData: FormData
): Promise<OpsSettingsActionState> {
  try {
    const sessionUser = await requireAuthenticatedSettingsUser();
    const currentPassword = emptyToNull(formData.get("currentPassword"), 160);
    const nextPassword = emptyToNull(formData.get("nextPassword"), 160);
    const nextPasswordRepeat = emptyToNull(formData.get("nextPasswordRepeat"), 160);

    if (!currentPassword) {
      return {
        error: "Eski şifre gerekli.",
        success: null,
      };
    }

    if (!nextPassword) {
      return {
        error: "Yeni şifre gerekli.",
        success: null,
      };
    }

    if (nextPassword.length < 8) {
      return {
        error: "Yeni şifre en az 8 karakter olmalı.",
        success: null,
      };
    }

    if (!nextPasswordRepeat) {
      return {
        error: "Yeni şifre tekrar gerekli.",
        success: null,
      };
    }

    if (nextPassword !== nextPasswordRepeat) {
      return {
        error: "Yeni şifreler eşleşmiyor.",
        success: null,
      };
    }

    await changeOpsUserPassword({
      userId: sessionUser.id,
      currentPassword,
      nextPassword,
    });

    revalidateSettingsPaths();

    return {
      error: null,
      success: "Şifre değiştirildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Şifre değiştirilemedi.",
      success: null,
    };
  }
}

export async function createArtistAction(
  _previousState: OpsSettingsActionState,
  formData: FormData
): Promise<OpsSettingsActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    assertAdminRole(sessionUser.roles);

    const fullName = emptyToNull(formData.get("fullName"), 160);
    const phone = emptyToNull(formData.get("phone"), 32);
    const password = emptyToNull(formData.get("password"), 160);

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

    if (!password) {
      return {
        error: "Şifre gerekli.",
        success: null,
      };
    }

    if (password.length < 8) {
      return {
        error: "Şifre en az 8 karakter olmalı.",
        success: null,
      };
    }

    await createArtistAccount({
      fullName,
      phone,
      password,
      actorUserId: sessionUser.id,
    });

    revalidateSettingsPaths();

    return {
      error: null,
      success: "Artist oluşturuldu.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Artist oluşturulamadı.",
      success: null,
    };
  }
}

export async function updateArtistAction(
  _previousState: OpsSettingsActionState,
  formData: FormData
): Promise<OpsSettingsActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    assertAdminRole(sessionUser.roles);
    const artistUserId = toRequiredNumber(formData.get("artistUserId"), "Artist bulunamadı.");
    const fullName = emptyToNull(formData.get("fullName"), 160);
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

    await updateArtistAccount({
      artistUserId,
      fullName,
      phone,
      actorUserId: sessionUser.id,
    });

    revalidateSettingsPaths();

    return {
      error: null,
      success: "Artist güncellendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Artist güncellenemedi.",
      success: null,
    };
  }
}

export async function updateArtistStatusAction(
  _previousState: OpsSettingsActionState,
  formData: FormData
): Promise<OpsSettingsActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    assertAdminRole(sessionUser.roles);
    const artistUserId = toRequiredNumber(formData.get("artistUserId"), "Artist bulunamadı.");
    const nextStatus = formData.get("nextStatus");

    if (nextStatus !== "active" && nextStatus !== "inactive") {
      return {
        error: "Durum seçimi geçerli değil.",
        success: null,
      };
    }

    await updateArtistStatus({
      artistUserId,
      isActive: nextStatus === "active",
      actorUserId: sessionUser.id,
    });

    revalidateSettingsPaths();

    return {
      error: null,
      success: nextStatus === "active" ? "Artist aktifleştirildi." : "Artist pasife alındı.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Artist durumu güncellenemedi.",
      success: null,
    };
  }
}
