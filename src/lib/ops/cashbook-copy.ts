export const CASH_ENTRY_TYPE_VALUES = ["income", "expense"] as const;

export type CashEntryTypeValue = (typeof CASH_ENTRY_TYPE_VALUES)[number];

export const CASH_ENTRY_TYPE_LABELS: Record<CashEntryTypeValue, string> = {
  income: "Gelir",
  expense: "Gider",
};

export const CASH_ENTRY_PAYMENT_METHOD_VALUES = [
  "cash",
  "card",
  "bank_transfer",
  "other",
] as const;

export type CashEntryPaymentMethodValue = (typeof CASH_ENTRY_PAYMENT_METHOD_VALUES)[number];

export const CASH_ENTRY_PAYMENT_METHOD_LABELS: Record<CashEntryPaymentMethodValue, string> = {
  cash: "Nakit",
  card: "Kart",
  bank_transfer: "Havale / EFT",
  other: "Diğer",
};

export const CASH_ENTRY_REASON_LABELS = {
  manual: "Manuel",
  service_collection: "Tahsilat",
  service_adjustment: "Düzeltme",
} as const;

export type CashEntryPreset = {
  key: string;
  label: string;
  note: string;
};

export const CASH_ENTRY_PRESETS: Record<CashEntryTypeValue, CashEntryPreset[]> = {
  income: [
    {
      key: "piercing",
      label: "Piercing",
      note: "Piercing",
    },
    {
      key: "tattoo-closing",
      label: "Dövme",
      note: "Dövme",
    },
    {
      key: "income-other",
      label: "Diğer",
      note: "Diğer",
    },
  ],
  expense: [
    {
      key: "cleaning",
      label: "Temizlik",
      note: "Temizlik",
    },
    {
      key: "needle",
      label: "İğne",
      note: "İğne",
    },
    {
      key: "material",
      label: "Malzeme",
      note: "Malzeme",
    },
    {
      key: "expense-other",
      label: "Diğer",
      note: "Diğer",
    },
  ],
};
