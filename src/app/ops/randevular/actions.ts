"use server";

import { revalidatePath } from "next/cache";
import {
  getOpsSessionAreaAccess,
  requireOpsSessionArea,
} from "@/lib/ops/auth/guards";
import {
  APPOINTMENT_SLOT_CONFLICT_MESSAGE,
  createAppointment,
  deleteAppointment,
  getSourceForStaffRoles,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/ops/appointments";
import { createCustomerRecord } from "@/lib/ops/customers";
import {
  attachServiceIntakeAppointment,
  createServiceIntake,
} from "@/lib/ops/service-intakes";
import {
  APPOINTMENT_STATUS_VALUES,
  SERVICE_INTAKE_SERVICE_TYPE_VALUES,
  type AppointmentStatus,
  type ServiceIntakeServiceType,
} from "@/db/schema";

export type OpsAppointmentActionState = {
  error: string | null;
  success: string | null;
};

export type OpsAppointmentCustomerCreateActionState = {
  error: string | null;
  success: string | null;
  createdCustomer: {
    id: number;
    label: string;
    email: string | null;
  } | null;
};

const INITIAL_ERROR_MESSAGE = "İşlem tamamlanamadı.";
const INITIAL_CREATE_CUSTOMER_ERROR_MESSAGE = "Müşteri oluşturulamadı.";
const INLINE_CUSTOMER_AUTH_ERROR_MESSAGE =
  "Oturum süreniz doldu. Sayfayı yenileyip yeniden giriş yapın.";
const INLINE_CUSTOMER_ROLE_ERROR_MESSAGE = "Bu işlem için personel hesabı gerekli.";
const DELETE_ERROR_MESSAGE = "Randevu silinemedi. Biraz sonra tekrar deneyin.";

const SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES = new Set([
  "Metin alanı çok uzun. Lütfen kısaltın.",
  "Girdiler beklenenden uzun. Lütfen kısaltın.",
  "Müşteri seçin.",
  "Tarih seçin.",
  "Saat seçin.",
  "Durum seçin.",
  "Durum seçimi geçerli değil.",
  "İşlem tipi seçin.",
  "İşlem tipi geçerli değil.",
  "Toplam tutarı girin.",
  "Alınan tutarı girin.",
  "Alınan tutar toplam tutardan büyük olamaz.",
  "Randevu bulunamadı.",
  APPOINTMENT_SLOT_CONFLICT_MESSAGE,
]);

const SAFE_INLINE_CUSTOMER_ERROR_MESSAGES = new Set([
  "Ad soyad gerekli.",
  "Telefon gerekli.",
  "Telefon bilgisini daha sade yazın.",
  "E-posta bilgisini kontrol edin.",
  "Girdiler beklenenden uzun. Lütfen kısaltın.",
  INLINE_CUSTOMER_AUTH_ERROR_MESSAGE,
  INLINE_CUSTOMER_ROLE_ERROR_MESSAGE,
]);

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

function toRequiredText(
  value: FormDataEntryValue | null,
  message: string,
  maxLength: number
): string {
  const normalized = toRequiredString(value, message);

  if (normalized.length > maxLength) {
    throw new Error("Girdiler beklenenden uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function toOptionalString(value: FormDataEntryValue | null, maxLength: number): string | null {
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

function toOptionalEmail(value: FormDataEntryValue | null): string | null {
  const normalized = toOptionalString(value, 320);

  if (!normalized) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("E-posta bilgisini kontrol edin.");
  }

  return normalized.toLocaleLowerCase("en-US");
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return APPOINTMENT_STATUS_VALUES.includes(value as AppointmentStatus);
}

function isServiceIntakeServiceType(value: string): value is ServiceIntakeServiceType {
  return SERVICE_INTAKE_SERVICE_TYPE_VALUES.includes(value as ServiceIntakeServiceType);
}

function toAmountCents(
  value: FormDataEntryValue | null,
  message: string,
  options?: { allowZero?: boolean }
): number {
  const normalized = toRequiredString(value, message).replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error(message);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(message);
  }

  if (!options?.allowZero && parsed === 0) {
    throw new Error(message);
  }

  return Math.round(parsed * 100);
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function revalidateAppointmentPaths() {
  revalidatePath("/ops/staff/randevular");
  revalidatePath("/ops/user/randevular");
}

function revalidateStaffCustomerPaths(userIds: number[]) {
  revalidatePath("/ops/staff/musteriler");

  for (const userId of new Set(userIds)) {
    if (!Number.isInteger(userId) || userId <= 0) {
      continue;
    }

    revalidatePath(`/ops/staff/musteriler/${userId}`);
  }
}

function getSafeActionErrorMessage(
  error: unknown,
  fallbackMessage: string,
  allowedMessages: Set<string>
): string {
  if (error instanceof Error && allowedMessages.has(error.message)) {
    return error.message;
  }

  return fallbackMessage;
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
    const rawServiceType = toRequiredString(formData.get("serviceType"), "İşlem tipi seçin.");
    const totalAmountCents = toAmountCents(formData.get("totalAmount"), "Toplam tutarı girin.");
    const collectedAmountCents = toAmountCents(
      formData.get("collectedAmount"),
      "Alınan tutarı girin.",
      { allowZero: true }
    );
    const notes = toNullableText(formData.get("notes"), 1200);

    if (!isServiceIntakeServiceType(rawServiceType)) {
      return {
        error: "İşlem tipi geçerli değil.",
        success: null,
      };
    }

    if (collectedAmountCents > totalAmountCents) {
      return {
        error: "Alınan tutar toplam tutardan büyük olamaz.",
        success: null,
      };
    }

    const appointment = await createAppointment({
      customerUserId,
      appointmentDate,
      appointmentTime,
      notes,
      source: getSourceForStaffRoles(sessionUser.roles),
      createdByUserId: sessionUser.id,
    });

    const serviceIntake = await createServiceIntake({
      customerUserId,
      flowType: "appointment",
      serviceType: rawServiceType,
      scheduledDate: appointmentDate,
      scheduledTime: appointmentTime,
      totalAmountCents,
      collectedAmountCents,
      notes,
      createdByUserId: sessionUser.id,
    });

    await attachServiceIntakeAppointment({
      serviceIntakeId: serviceIntake.id,
      appointmentId: appointment.id,
      updatedByUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();
    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${customerUserId}`);

    return {
      error: null,
      success: "Randevu ve işlem kaydı açıldı.",
    };
  } catch (error) {
    return {
      error: getSafeActionErrorMessage(
        error,
        INITIAL_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
      success: null,
    };
  }
}

export async function createStaffAppointmentCustomerAction(
  _previousState: OpsAppointmentCustomerCreateActionState,
  formData: FormData
): Promise<OpsAppointmentCustomerCreateActionState> {
  try {
    const access = await getOpsSessionAreaAccess("staff");

    if (!access.ok) {
      return {
        error:
          access.reason === "unauthenticated"
            ? INLINE_CUSTOMER_AUTH_ERROR_MESSAGE
            : INLINE_CUSTOMER_ROLE_ERROR_MESSAGE,
        success: null,
        createdCustomer: null,
      };
    }

    const fullName = toRequiredText(formData.get("fullName"), "Ad soyad gerekli.", 160);
    const phone = toRequiredText(formData.get("phone"), "Telefon gerekli.", 32);
    const email = toOptionalEmail(formData.get("email"));

    if (!isPhoneValid(phone)) {
      return {
        error: "Telefon bilgisini daha sade yazın.",
        success: null,
        createdCustomer: null,
      };
    }

    const customer = await createCustomerRecord({
      email,
      passwordHash: null,
      phone,
      fullName,
    });

    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${customer.userId}`);
    revalidatePath("/ops/staff/randevular");

    return {
      error: null,
      success: "Müşteri seçildi.",
      createdCustomer: {
        id: customer.userId,
        label: customer.displayName ?? customer.fullName ?? customer.email ?? `Kullanıcı #${customer.userId}`,
        email: customer.email,
      },
    };
  } catch (error) {
    if (isUniqueConflict(error)) {
      return {
        error: "Bu e-posta ile kayıtlı bir müşteri zaten var.",
        success: null,
        createdCustomer: null,
      };
    }

    return {
      error: getSafeActionErrorMessage(
        error,
        INITIAL_CREATE_CUSTOMER_ERROR_MESSAGE,
        SAFE_INLINE_CUSTOMER_ERROR_MESSAGES
      ),
      success: null,
      createdCustomer: null,
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
      error: getSafeActionErrorMessage(
        error,
        INITIAL_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
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
      error: getSafeActionErrorMessage(
        error,
        INITIAL_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
      success: null,
    };
  }
}

export async function updateStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const appointmentId = toRequiredNumber(
      formData.get("appointmentId"),
      "Randevu bulunamadı."
    );
    const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Müşteri seçin.");
    const appointmentDate = toRequiredString(formData.get("appointmentDate"), "Tarih seçin.");
    const appointmentTime = toRequiredString(formData.get("appointmentTime"), "Saat seçin.");
    const notes = toNullableText(formData.get("notes"), 1200);

    const result = await updateAppointment({
      appointmentId,
      customerUserId,
      appointmentDate,
      appointmentTime,
      notes,
      actorUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();
    revalidateStaffCustomerPaths([
      result.previousCustomerUserId,
      result.appointment.customerUserId,
    ]);

    return {
      error: null,
      success: "Randevu güncellendi.",
    };
  } catch (error) {
    return {
      error: getSafeActionErrorMessage(
        error,
        INITIAL_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
      success: null,
    };
  }
}

export async function deleteStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const appointmentId = toRequiredNumber(
      formData.get("appointmentId"),
      "Randevu bulunamadı."
    );

    const deleted = await deleteAppointment({
      appointmentId,
      actorUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();
    revalidateStaffCustomerPaths([deleted.customerUserId]);

    return {
      error: null,
      success: "Randevu silindi.",
    };
  } catch (error) {
    return {
      error: getSafeActionErrorMessage(
        error,
        DELETE_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
      success: null,
    };
  }
}
