export const CASH_ENTRY_TYPE_VALUES = ["income", "expense"] as const;

export type CashEntryTypeValue = (typeof CASH_ENTRY_TYPE_VALUES)[number];

export const CASH_ENTRY_TYPE_LABELS: Record<CashEntryTypeValue, string> = {
  income: "Gelir",
  expense: "Gider",
};
