export type LegalDocumentId =
  | "kvkk-aydinlatma-metni"
  | "gizlilik-politikasi"
  | "cerez-politikasi"
  | "dovme-ve-piercing-sozlesmesi";

export type LegalDocumentDefinition = {
  id: LegalDocumentId;
  label: string;
  publicPath: string;
  sourcePath: string;
};

export const COMBINED_APPROVAL_LEGAL_DOCUMENT_ID = "dovme-ve-piercing-sozlesmesi" as const;

export const LEGACY_APPROVAL_LEGAL_DOCUMENT_IDS = [
  "dovme-sozlesmesi",
  "piercing-sozlesmesi",
] as const;

export const LEGAL_DOCUMENT_SLUG_REDIRECTS = {
  "dovme-sozlesmesi": COMBINED_APPROVAL_LEGAL_DOCUMENT_ID,
  "piercing-sozlesmesi": COMBINED_APPROVAL_LEGAL_DOCUMENT_ID,
} as const;

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
    id: COMBINED_APPROVAL_LEGAL_DOCUMENT_ID,
    label: "Dövme ve Piercing Sözleşmesi",
    publicPath: "/dovme-ve-piercing-sozlesmesi",
    sourcePath: "src/content/ops/legal/dovme-ve-piercing-sozlesmesi.md",
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

export const APPROVAL_LEGAL_DOCUMENT_IDS = [COMBINED_APPROVAL_LEGAL_DOCUMENT_ID] as const;
