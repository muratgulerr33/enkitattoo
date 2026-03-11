"use server";

import { revalidatePath } from "next/cache";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  createAppointment,
  deleteAppointment,
  getSourceForStaffRoles,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/ops/appointments";
import {
  APPOINTMENT_STATUS_VALUES,
  type AppointmentStatus,
} from "@/db/schema";

export type OpsAppointmentActionState = {
  error: string | null;
  success: string | null;
};

const INITIAL_ERROR_MESSAGE = "İşlem tamamlanamadı.";

function toNullableText(value: FormDataEntryValue | null, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("Metin alanı çok uzun. Lütfen kısaltın.");
  }

  return normalized;
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

function toRequiredString(value: FormDataEntryValue | null, message: string): string {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(message);
  }

  return normalized;
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return APPOINTMENT_STATUS_VALUES.includes(value as AppointmentStatus);
}

function revalidateAppointmentPaths() {
  revalidatePath("/ops/staff/randevular");
  revalidatePath("/ops/user/randevular");
}

export async function createStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Müşteri seçin.");
    const appointmentDate = toRequiredString(formData.get("appointmentDate"), "Tarih seçin.");
    const appointmentTime = toRequiredString(formData.get("appointmentTime"), "Saat seçin.");
    const notes = toNullableText(formData.get("notes"), 1200);

    await createAppointment({
      customerUserId,
      appointmentDate,
      appointmentTime,
      notes,
      source: getSourceForStaffRoles(sessionUser.roles),
      createdByUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();

    return {
      error: null,
      success: "Randevu açıldı.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function createUserAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("user");
    const appointmentDate = toRequiredString(formData.get("appointmentDate"), "Tarih seçin.");
    const appointmentTime = toRequiredString(formData.get("appointmentTime"), "Saat seçin.");
    const notes = toNullableText(formData.get("notes"), 1200);

    await createAppointment({
      customerUserId: sessionUser.id,
      appointmentDate,
      appointmentTime,
      notes,
      source: "customer",
      createdByUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();

    return {
      error: null,
      success: "Randevu kaydedildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function updateAppointmentStatusAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const appointmentId = toRequiredNumber(
      formData.get("appointmentId"),
      "Randevu bulunamadı."
    );
    const rawStatus = toRequiredString(formData.get("status"), "Durum seçin.");

    if (!isAppointmentStatus(rawStatus)) {
      return {
        error: "Durum seçimi geçerli değil.",
        success: null,
      };
    }

    await updateAppointmentStatus({
      appointmentId,
      status: rawStatus,
      actorUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();

    return {
      error: null,
      success: "Durum güncellendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function updateStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    await requireOpsSessionArea("staff");
    const appointmentId = toRequiredNumber(
      formData.get("appointmentId"),
      "Randevu bulunamadı."
    );
    const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Müşteri seçin.");
    const appointmentDate = toRequiredString(formData.get("appointmentDate"), "Tarih seçin.");
    const appointmentTime = toRequiredString(formData.get("appointmentTime"), "Saat seçin.");
    const notes = toNullableText(formData.get("notes"), 1200);

    await updateAppointment({
      appointmentId,
      customerUserId,
      appointmentDate,
      appointmentTime,
      notes,
    });

    revalidateAppointmentPaths();

    return {
      error: null,
      success: "Randevu güncellendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function deleteStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    await requireOpsSessionArea("staff");
    const appointmentId = toRequiredNumber(
      formData.get("appointmentId"),
      "Randevu bulunamadı."
    );

    await deleteAppointment({
      appointmentId,
    });

    revalidateAppointmentPaths();

    return {
      error: null,
      success: "Randevu silindi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}
