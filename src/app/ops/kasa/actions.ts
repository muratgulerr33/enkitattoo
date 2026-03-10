"use server";

import { revalidatePath } from "next/cache";
import { requireOpsSessionArea } from "@/lib/ops/auth/guards";
import {
  CASHBOOK_DATE_LOCK_MESSAGE,
  canManageCashHistory,
  createCashEntry,
  getTodayCashDateValue,
  parseCashAmountToCents,
  softDeleteCashEntry,
  toCashEntryType,
  updateCashEntry,
} from "@/lib/ops/cashbook";

export type OpsCashEntryActionState = {
  error: string | null;
  success: string | null;
};

const INITIAL_ERROR_MESSAGE = "Kasa islemi tamamlanamadi.";

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

function toNullableText(value: FormDataEntryValue | null, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error("Not cok uzun. Lutfen kisaltin.");
  }

  return normalized;
}

function revalidateCashbookPath() {
  revalidatePath("/ops/staff/kasa");
}

export async function createCashEntryAction(
  _previousState: OpsCashEntryActionState,
  formData: FormData
): Promise<OpsCashEntryActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");
    const todayDate = getTodayCashDateValue();
    const requestedDate = toRequiredString(formData.get("entryDate"), "Tarih gerekli.");
    const entryDate = canManageCashHistory(sessionUser.roles) ? requestedDate : todayDate;

    if (!canManageCashHistory(sessionUser.roles) && requestedDate !== todayDate) {
      return {
        error: CASHBOOK_DATE_LOCK_MESSAGE,
        success: null,
      };
    }

    await createCashEntry({
      entryDate,
      entryType: toCashEntryType(
        toRequiredString(formData.get("entryType"), "Islem turu gerekli.")
      ),
      amountCents: parseCashAmountToCents(
        toRequiredString(formData.get("amount"), "Tutar gerekli.")
      ),
      note: toNullableText(formData.get("note"), 280),
      actorUserId: sessionUser.id,
    });

    revalidateCashbookPath();

    return {
      error: null,
      success: "Kasa kaydi eklendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function updateCashEntryAction(
  _previousState: OpsCashEntryActionState,
  formData: FormData
): Promise<OpsCashEntryActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");

    if (!canManageCashHistory(sessionUser.roles)) {
      return {
        error: "Bu islem yalniz yoneticiye acik.",
        success: null,
      };
    }

    await updateCashEntry({
      entryId: toRequiredNumber(formData.get("entryId"), "Kayit bulunamadi."),
      entryDate: toRequiredString(formData.get("entryDate"), "Tarih gerekli."),
      entryType: toCashEntryType(
        toRequiredString(formData.get("entryType"), "Islem turu gerekli.")
      ),
      amountCents: parseCashAmountToCents(
        toRequiredString(formData.get("amount"), "Tutar gerekli.")
      ),
      note: toNullableText(formData.get("note"), 280),
      actorUserId: sessionUser.id,
    });

    revalidateCashbookPath();

    return {
      error: null,
      success: "Kasa kaydi guncellendi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}

export async function deleteCashEntryAction(
  _previousState: OpsCashEntryActionState,
  formData: FormData
): Promise<OpsCashEntryActionState> {
  try {
    const sessionUser = await requireOpsSessionArea("staff");

    if (!canManageCashHistory(sessionUser.roles)) {
      return {
        error: "Bu islem yalniz yoneticiye acik.",
        success: null,
      };
    }

    await softDeleteCashEntry({
      entryId: toRequiredNumber(formData.get("entryId"), "Kayit bulunamadi."),
      actorUserId: sessionUser.id,
    });

    revalidateCashbookPath();

    return {
      error: null,
      success: "Kayit kaldirildi.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : INITIAL_ERROR_MESSAGE,
      success: null,
    };
  }
}
