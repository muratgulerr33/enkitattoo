"use server";

import { revalidatePath } from "next/cache";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import { saveCustomerNote } from "@/lib/ops/customers";

export type OpsCustomerActionState = {
  error: string | null;
  success: string | null;
};

const INITIAL_ERROR_MESSAGE = "Musteri notu kaydedilemedi.";

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
    throw new Error("Not cok uzun. Lutfen kisaltin.");
  }

  return normalized;
}

export async function saveCustomerNoteAction(
  _previousState: OpsCustomerActionState,
  formData: FormData
): Promise<OpsCustomerActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const customerUserId = toRequiredNumber(formData.get("customerUserId"), "Musteri bulunamadi.");
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
