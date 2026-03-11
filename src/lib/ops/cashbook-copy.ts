export const CASH_ENTRY_TYPE_VALUES = ["income", "expense"] as const;

export type CashEntryTypeValue = (typeof CASH_ENTRY_TYPE_VALUES)[number];

export const CASH_ENTRY_TYPE_LABELS: Record<CashEntryTypeValue, string> = {
  income: "Gelir",
  expense: "Gider",
};

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
