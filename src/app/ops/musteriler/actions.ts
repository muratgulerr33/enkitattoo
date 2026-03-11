"use server";

import { revalidatePath } from "next/cache";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { createCustomerRecord, saveCustomerNote } from "@/lib/ops/customers";

export type OpsCustomerActionState = {
  error: string | null;
  success: string | null;
};

export type OpsCustomerCreateActionState = {
  error: string | null;
  success: string | null;
  createdCustomerId: number | null;
};

const INITIAL_ERROR_MESSAGE = "Müşteri notu kaydedilemedi.";
const INITIAL_CREATE_ERROR_MESSAGE = "Müşteri oluşturulamadı.";

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

function toNullableNote(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > 800) {
    throw new Error("Not çok uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function toRequiredText(
  value: FormDataEntryValue | null,
  message: string,
  maxLength: number
): string {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(message);
  }

  if (normalized.length > maxLength) {
    throw new Error("Girdiler beklenenden uzun. Lütfen kısaltın.");
  }

  return normalized;
}

function isPhoneValid(phone: string): boolean {
  return /^[0-9+\s()\-]{7,32}$/.test(phone);
}

export async function saveCustomerNoteAction(
  _previousState: OpsCustomerActionState,
  formData: FormData
): Promise<OpsCustomerActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Müşteri bulunamadı.");
    const note = toNullableNote(formData.get("note"));

    await saveCustomerNote(customerUserId, note, sessionUser.id);

    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${customerUserId}`);

    return {
      error: null,
      success: note ? "Not kaydedildi." : "Not temizlendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function createStaffCustomerAction(
  _previousState: OpsCustomerCreateActionState,
  formData: FormData
): Promise<OpsCustomerCreateActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const fullName = toRequiredText(formData.get("fullName"), "Ad soyad gerekli.", 160);
    const phone = toRequiredText(formData.get("phone"), "Telefon gerekli.", 32);
    const note = toNullableNote(formData.get("note"));

    if (!isPhoneValid(phone)) {
      return {
        error: "Telefon bilgisini daha sade yazın.",
        success: null,
        createdCustomerId: null,
      };
    }

    const customer = await createCustomerRecord({
      email: null,
      passwordHash: null,
      phone,
      fullName,
    });

    if (note) {
      await saveCustomerNote(customer.userId, note, sessionUser.id);
    }

    revalidatePath("/ops/staff/musteriler");
    revalidatePath(`/ops/staff/musteriler/${customer.userId}`);
    revalidatePath("/ops/staff/randevular");

    return {
      error: null,
      success: "Müşteri oluşturuldu. Artık randevu akışında seçebilirsiniz.",
      createdCustomerId: customer.userId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_CREATE_ERROR_MESSAGE,
      success: null,
      createdCustomerId: null,
    };
  }
}
