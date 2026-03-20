"use server";

import { revalidatePath } from "next/cache";
import {
  getOpsSessionAreaAccess,
  requireOpsSessionArea,
} from "@/lib/ops/auth/guards";
import {
  APPOINTMENT_DELETE_WITH_CASH_ENTRIES_MESSAGE,
  APPOINTMENT_SLOT_CONFLICT_MESSAGE,
  type AppointmentCustomerOption,
  createAppointment,
  deleteAppointment,
  getSourceForStaffRoles,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/ops/appointments";
import { createCustomerRecord, getCustomerLabel, listCustomers } from "@/lib/ops/customers";
import { resolveStaffArtistAssignment } from "@/lib/ops/artists";
import {
  attachServiceIntakeAppointment,
  createServiceIntake,
  updateWalkInServiceIntake,
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
    phone: string | null;
  } | null;
};

export type OpsAppointmentCustomerSearchActionResult = {
  error: string | null;
  customers: AppointmentCustomerOption[];
};

const INITIAL_ERROR_MESSAGE = "İşlem tamamlanamadı.";
const INITIAL_CREATE_CUSTOMER_ERROR_MESSAGE = "Müşteri oluşturulamadı.";
const INLINE_CUSTOMER_AUTH_ERROR_MESSAGE =
  "Oturum süreniz doldu. Sayfayı yenileyip yeniden giriş yapın.";
const INLINE_CUSTOMER_ROLE_ERROR_MESSAGE = "Bu işlem için personel hesabı gerekli.";
const CUSTOMER_SEARCH_ERROR_MESSAGE = "Müşteri listesi yüklenemedi.";
const DELETE_ERROR_MESSAGE = "İşlem silinemedi. Biraz sonra tekrar deneyin.";
const WALK_IN_ERROR_MESSAGE = "İşlem kaydı kaydedilemedi.";

const SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES = new Set([
  "Metin alanı çok uzun. Lütfen kısaltın.",
  "Girdiler beklenenden uzun. Lütfen kısaltın.",
  "Müşteri seçin.",
  "Seçilen müşteri kullanılamıyor.",
  "Tarih seçin.",
  "Saat seçin.",
  "Geçerli bir tarih seçin.",
  "Geçerli bir saat seçin.",
  "Durum seçin.",
  "Durum seçimi geçerli değil.",
  "İşlem tipi seçin.",
  "İşlem tipi geçerli değil.",
  "Artist seçin.",
  "Seçilen artist kullanılamıyor.",
  "Aktif artist bulunamadı.",
  "Toplam tutarı girin.",
  "Toplam tutarı kontrol edin.",
  "Kapora girin.",
  "Kaporayı kontrol edin.",
  "Kapora toplam tutardan büyük olamaz.",
  "İşlem bulunamadı.",
  "İşlem kaydı bulunamadı.",
  APPOINTMENT_DELETE_WITH_CASH_ENTRIES_MESSAGE,
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

const SAFE_CUSTOMER_SEARCH_ERROR_MESSAGES = new Set([
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

function toOptionalNumber(value: FormDataEntryValue | null, message: string): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

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
  const normalized = normalizeAmountInput(toRequiredString(value, message), message);

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(message);
  }

  if (!options?.allowZero && parsed === 0) {
    throw new Error(message);
  }

  return Math.round(parsed * 100);
}

function normalizeAmountInput(value: string, message: string): string {
  const compact = value.trim().replace(/\s+/g, "").replace(",", ".");

  if (!compact) {
    throw new Error(message);
  }

  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(compact)) {
    throw new Error(message);
  }

  if (compact.startsWith(".")) {
    return `0${compact}`;
  }

  if (compact.endsWith(".")) {
    return compact.slice(0, -1);
  }

  return compact;
}

function toOptionalAmountCents(
  value: FormDataEntryValue | null,
  message: string
): number {
  if (value === null) {
    return 0;
  }

  if (typeof value !== "string") {
    throw new Error(message);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const normalized = normalizeAmountInput(trimmed, message);

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
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

function revalidateCashAutomationPaths() {
  revalidatePath("/ops/staff/kasa");
  revalidatePath("/ops/staff/raporlar");
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

async function getStaffActionSession():
  Promise<{ ok: true; user: Awaited<ReturnType<typeof requireOpsSessionArea>> } | {
    ok: false;
    state: OpsAppointmentActionState;
  }> {
  const access = await getOpsSessionAreaAccess("staff");

  if (!access.ok) {
    return {
      ok: false,
      state: {
        error:
          access.reason === "unauthenticated"
            ? INLINE_CUSTOMER_AUTH_ERROR_MESSAGE
            : INLINE_CUSTOMER_ROLE_ERROR_MESSAGE,
        success: null,
      },
    };
  }

  return {
    ok: true,
    user: access.user,
  };
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

function getScheduledDateValue(formData: FormData): string {
  return toRequiredString(
    formData.get("scheduledDate") ?? formData.get("appointmentDate"),
    "Tarih seçin."
  );
}

function getScheduledTimeValue(formData: FormData): string {
  return toRequiredString(
    formData.get("scheduledTime") ?? formData.get("appointmentTime"),
    "Saat seçin."
  );
}

function getServiceSessionFormValues(formData: FormData): {
  customerUserId: number;
  scheduledDate: string;
  scheduledTime: string;
  requestedArtistUserId: number | null;
  serviceType: ServiceIntakeServiceType;
  totalAmountCents: number;
  collectedAmountCents: number;
  notes: string | null;
} {
  const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Müşteri seçin.");
  const scheduledDate = getScheduledDateValue(formData);
  const scheduledTime = getScheduledTimeValue(formData);
  const requestedArtistUserId = toOptionalNumber(formData.get("artistUserId"), "Artist seçin.");
  const rawServiceType = toRequiredString(formData.get("serviceType"), "İşlem tipi seçin.");
  const totalAmountCents = toAmountCents(
    formData.get("totalAmount"),
    "Toplam tutarı kontrol edin."
  );
  const collectedAmountCents = toOptionalAmountCents(
    formData.get("collectedAmount"),
    "Kaporayı kontrol edin."
  );
  const notes = toNullableText(formData.get("notes"), 1200);

  if (!isServiceIntakeServiceType(rawServiceType)) {
    throw new Error("İşlem tipi geçerli değil.");
  }

  if (collectedAmountCents > totalAmountCents) {
    throw new Error("Kapora toplam tutardan büyük olamaz.");
  }

  return {
    customerUserId,
    scheduledDate,
    scheduledTime,
    requestedArtistUserId,
    serviceType: rawServiceType,
    totalAmountCents,
    collectedAmountCents,
    notes,
  };
}

export async function createStaffAppointmentAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const {
      customerUserId,
      scheduledDate,
      scheduledTime,
      requestedArtistUserId,
      serviceType,
      totalAmountCents,
      collectedAmountCents,
      notes,
    } = getServiceSessionFormValues(formData);
    const artistUserId = await resolveStaffArtistAssignment({
      requestedArtistUserId,
      sessionUserId: sessionUser.id,
      sessionUserRoles: sessionUser.roles,
    });

    const appointment = await createAppointment({
      customerUserId,
      appointmentDate: scheduledDate,
      appointmentTime: scheduledTime,
      notes,
      source: getSourceForStaffRoles(sessionUser.roles),
      createdByUserId: sessionUser.id,
    });

    const serviceIntake = await createServiceIntake({
      customerUserId,
      flowType: "appointment",
      serviceType,
      scheduledDate,
      scheduledTime,
      artistUserId,
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
    revalidateCashAutomationPaths();
    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${customerUserId}`);

    return {
      error: null,
      success: "İşlem kaydı açıldı.",
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

export async function createStaffWalkInAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const access = await getStaffActionSession();

    if (!access.ok) {
      return access.state;
    }

    const {
      customerUserId,
      scheduledDate,
      scheduledTime,
      requestedArtistUserId,
      serviceType,
      totalAmountCents,
      collectedAmountCents,
      notes,
    } = getServiceSessionFormValues(formData);
    const artistUserId = await resolveStaffArtistAssignment({
      requestedArtistUserId,
      sessionUserId: access.user.id,
      sessionUserRoles: access.user.roles,
    });

    await createServiceIntake({
      customerUserId,
      flowType: "walk_in",
      serviceType,
      scheduledDate,
      scheduledTime,
      artistUserId,
      totalAmountCents,
      collectedAmountCents,
      notes,
      createdByUserId: access.user.id,
    });

    revalidatePath("/ops/staff/randevular");
    revalidateCashAutomationPaths();
    revalidateStaffCustomerPaths([customerUserId]);

    return {
      error: null,
      success: "İşlem kaydı açıldı.",
    };
  } catch (error) {
    return {
      error: getSafeActionErrorMessage(
        error,
        WALK_IN_ERROR_MESSAGE,
        SAFE_APPOINTMENT_ACTION_ERROR_MESSAGES
      ),
      success: null,
    };
  }
}

export async function createStaffServiceSessionAction(
  previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const sourceValue = formData.get("sessionSource");
    const source =
      typeof sourceValue === "string" && sourceValue.trim() ? sourceValue.trim() : "appointment";

    if (source === "walk_in") {
      return createStaffWalkInAction(previousState, formData);
    }

    return createStaffAppointmentAction(previousState, formData);
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
        phone: customer.phone,
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

export async function searchStaffAppointmentCustomersAction(
  query: string
): Promise<OpsAppointmentCustomerSearchActionResult> {
  try {
    const access = await getOpsSessionAreaAccess("staff");

    if (!access.ok) {
      return {
        error:
          access.reason === "unauthenticated"
            ? INLINE_CUSTOMER_AUTH_ERROR_MESSAGE
            : INLINE_CUSTOMER_ROLE_ERROR_MESSAGE,
        customers: [],
      };
    }

    const customers = await listCustomers(query);

    return {
      error: null,
      customers: customers.map((customer) => ({
        id: customer.userId,
        label: getCustomerLabel(customer),
        email: customer.email,
        phone: customer.phone,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : null;

    return {
      error:
        message && SAFE_CUSTOMER_SEARCH_ERROR_MESSAGES.has(message)
          ? message
          : CUSTOMER_SEARCH_ERROR_MESSAGE,
      customers: [],
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
      success: "İşlem kaydı açıldı.",
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
      "İşlem bulunamadı."
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
      "İşlem bulunamadı."
    );
    const {
      customerUserId,
      scheduledDate,
      scheduledTime,
      requestedArtistUserId,
      serviceType,
      totalAmountCents,
      collectedAmountCents,
      notes,
    } = getServiceSessionFormValues(formData);
    const artistUserId = await resolveStaffArtistAssignment({
      requestedArtistUserId,
      sessionUserId: sessionUser.id,
      sessionUserRoles: sessionUser.roles,
    });

    const result = await updateAppointment({
      appointmentId,
      customerUserId,
      appointmentDate: scheduledDate,
      appointmentTime: scheduledTime,
      artistUserId,
      serviceType,
      totalAmountCents,
      collectedAmountCents,
      notes,
      actorUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();
    revalidateCashAutomationPaths();
    revalidateStaffCustomerPaths([
      result.previousCustomerUserId,
      result.appointment.customerUserId,
    ]);

    return {
      error: null,
      success: "İşlem güncellendi.",
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

export async function updateStaffWalkInAction(
  _previousState: OpsAppointmentActionState,
  formData: FormData
): Promise<OpsAppointmentActionState> {
  try {
    const access = await getStaffActionSession();

    if (!access.ok) {
      return access.state;
    }

    const serviceIntakeId = toRequiredNumber(
      formData.get("serviceIntakeId"),
      "İşlem kaydı bulunamadı."
    );
    const {
      customerUserId,
      scheduledDate,
      scheduledTime,
      requestedArtistUserId,
      serviceType,
      totalAmountCents,
      collectedAmountCents,
      notes,
    } = getServiceSessionFormValues(formData);
    const artistUserId = await resolveStaffArtistAssignment({
      requestedArtistUserId,
      sessionUserId: access.user.id,
      sessionUserRoles: access.user.roles,
    });

    const updated = await updateWalkInServiceIntake({
      serviceIntakeId,
      customerUserId,
      serviceType,
      scheduledDate,
      scheduledTime,
      artistUserId,
      totalAmountCents,
      collectedAmountCents,
      notes,
      updatedByUserId: access.user.id,
    });

    revalidatePath("/ops/staff/randevular");
    revalidateCashAutomationPaths();
    revalidateStaffCustomerPaths([
      updated.previousCustomerUserId,
      updated.serviceIntake.customerUserId,
    ]);

    return {
      error: null,
      success: "İşlem güncellendi.",
    };
  } catch (error) {
    return {
      error: getSafeActionErrorMessage(
        error,
        WALK_IN_ERROR_MESSAGE,
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
      "İşlem bulunamadı."
    );

    const deleted = await deleteAppointment({
      appointmentId,
      actorUserId: sessionUser.id,
    });

    revalidateAppointmentPaths();
    revalidateStaffCustomerPaths([deleted.customerUserId]);

    return {
      error: null,
      success: "İşlem silindi.",
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
