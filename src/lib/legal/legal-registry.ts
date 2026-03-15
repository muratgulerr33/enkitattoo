export type LegalDocumentId =
  | "kvkk-aydinlatma-metni"
  | "gizlilik-politikasi"
  | "cerez-politikasi"
  | "dovme-sozlesmesi"
  | "piercing-sozlesmesi";

export type ApprovalDocumentKind = "tattoo" | "piercing";

export type LegalDocumentDefinition = {
  id: LegalDocumentId;
  label: string;
  publicPath: string;
  sourcePath: string;
  approvalKind?: ApprovalDocumentKind;
};

export const LEGAL_DOCUMENTS: readonly LegalDocumentDefinition[] = [
  {
    id: "kvkk-aydinlatma-metni",
    label: "KVKK Aydınlatma Metni",
    publicPath: "/kvkk-aydinlatma-metni",
    sourcePath: "src/content/legal/kvkk-aydinlatma-metni.md",
  },
  {
    id: "gizlilik-politikasi",
    label: "Gizlilik Politikası",
    publicPath: "/gizlilik-politikasi",
    sourcePath: "src/content/legal/gizlilik-politikasi.md",
  },
  {
    id: "cerez-politikasi",
    label: "Çerez Politikası",
    publicPath: "/cerez-politikasi",
    sourcePath: "src/content/legal/cerez-politikasi.md",
  },
  {
    id: "dovme-sozlesmesi",
    label: "Dövme Sözleşmesi",
    publicPath: "/dovme-sozlesmesi",
    sourcePath: "src/content/ops/legal/dovme-sozlesmesi-yetiskin.md",
    approvalKind: "tattoo",
  },
  {
    id: "piercing-sozlesmesi",
    label: "Piercing Sözleşmesi",
    publicPath: "/piercing-sozlesmesi",
    sourcePath: "src/content/ops/legal/piercing-sozlesmesi-yetiskin.md",
    approvalKind: "piercing",
  },
] as const;

export const LEGAL_DOCUMENTS_BY_ID = Object.fromEntries(
  LEGAL_DOCUMENTS.map((document) => [document.id, document]),
) as Record<LegalDocumentId, LegalDocumentDefinition>;

export const FOOTER_LEGAL_LINKS: ReadonlyArray<{ label: string; href: string }> =
  LEGAL_DOCUMENTS.map(({ label, publicPath }) => ({
    label,
    href: publicPath,
  }));

export const APPROVAL_LEGAL_DOCUMENT_IDS: readonly LegalDocumentId[] = [
  "dovme-sozlesmesi",
  "piercing-sozlesmesi",
] as const;
