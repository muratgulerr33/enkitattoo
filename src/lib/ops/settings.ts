export type OpsSettingsActionState = {
  error: string | null;
  success: string | null;
};

export function emptyToNull(
  value: FormDataEntryValue | null,
  maxLength: number
): string | null {
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
