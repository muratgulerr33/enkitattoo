import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  APPROVAL_LEGAL_DOCUMENT_IDS,
  LEGAL_DOCUMENTS,
  LEGAL_DOCUMENTS_BY_ID,
  LEGAL_DOCUMENT_SLUG_REDIRECTS,
  type LegalDocumentDefinition,
  type LegalDocumentId,
} from "./legal-registry";

export type LegalDocument = LegalDocumentDefinition & {
  title: string;
  summary: string | null;
  markdown: string;
  metadataLines: Record<string, string>;
};

function removeFirstHeading(markdown: string): string {
  return markdown.replace(/^#\s+.+?(?:\r?\n){1,2}/, "").trim();
}

function normalizeHeadingText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr-TR");
}

function shouldOmitInternalLegalHeading(headingText: string): boolean {
  const normalized = normalizeHeadingText(headingText);

  return (
    normalized === "kısa ekran özeti" ||
    normalized.startsWith("sitede kullanılacak ")
  );
}

function stripMarkdownSections(
  markdown: string,
  shouldStripHeading: (headingText: string) => boolean
): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const keptLines: string[] = [];
  let skippedHeadingLevel: number | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      if (skippedHeadingLevel !== null) {
        if (headingLevel <= skippedHeadingLevel) {
          skippedHeadingLevel = null;
        } else {
          continue;
        }
      }

      if (shouldStripHeading(headingText)) {
        skippedHeadingLevel = headingLevel;
        continue;
      }
    } else if (skippedHeadingLevel !== null) {
      continue;
    }

    keptLines.push(line);
  }

  return keptLines.join("\n").trim().replace(/\n{3,}/g, "\n\n");
}

function extractMetadataLines(markdown: string): Record<string, string> {
  const entries = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(/^\*\*(.+?):\*\*\s*(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => [match[1].trim(), match[2].trim()] as const);

  return Object.fromEntries(entries);
}

function extractTitle(markdown: string, fallback: string): string {
  const firstHeading = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  return firstHeading ? firstHeading.slice(2).trim() : fallback;
}

function extractSummary(markdown: string, metadataLines: Record<string, string>): string | null {
  if (metadataLines["Açıklama"]) {
    return metadataLines["Açıklama"];
  }

  const bodyWithoutTitle = removeFirstHeading(markdown);
  const paragraphs = bodyWithoutTitle
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const firstParagraph = paragraphs.find((block) => {
    const firstLine = block.split(/\r?\n/, 1)[0]?.trim() ?? "";

    return (
      firstLine.length > 0 &&
      !firstLine.startsWith("#") &&
      !firstLine.startsWith("- ") &&
      !firstLine.startsWith(">") &&
      !/^\*\*.+:\*\*/.test(firstLine)
    );
  });

  if (!firstParagraph) {
    return null;
  }

  return firstParagraph.replace(/\s+/g, " ").trim();
}

const readLegalDocument = cache(async (id: LegalDocumentId): Promise<LegalDocument> => {
  const definition = LEGAL_DOCUMENTS_BY_ID[id];
  const absolutePath = path.join(process.cwd(), definition.sourcePath);
  const rawMarkdown = await readFile(absolutePath, "utf8");
  const markdown = rawMarkdown.trim();
  const metadataLines = extractMetadataLines(markdown);

  return {
    ...definition,
    title: extractTitle(markdown, definition.label),
    summary: extractSummary(markdown, metadataLines),
    markdown,
    metadataLines,
  };
});

export async function getLegalDocumentById(id: LegalDocumentId): Promise<LegalDocument> {
  return readLegalDocument(id);
}

function getLegalDocumentDefinitionBySlug(slug: string): LegalDocumentDefinition | null {
  return LEGAL_DOCUMENTS.find((document) => document.publicPath === `/${slug}`) ?? null;
}

export function getCanonicalLegalDocumentSlug(slug: string): string | null {
  const redirectedSlug =
    LEGAL_DOCUMENT_SLUG_REDIRECTS[slug as keyof typeof LEGAL_DOCUMENT_SLUG_REDIRECTS];

  if (redirectedSlug) {
    return redirectedSlug;
  }

  return getLegalDocumentDefinitionBySlug(slug)?.publicPath.slice(1) ?? null;
}

export async function getLegalDocumentBySlug(slug: string): Promise<LegalDocument | null> {
  const definition = getLegalDocumentDefinitionBySlug(slug);

  if (!definition) {
    return null;
  }

  return readLegalDocument(definition.id);
}

export async function listPublicLegalDocuments(): Promise<LegalDocument[]> {
  return Promise.all(LEGAL_DOCUMENTS.map((document) => readLegalDocument(document.id)));
}

export async function listApprovalLegalDocuments(): Promise<LegalDocument[]> {
  return Promise.all(APPROVAL_LEGAL_DOCUMENT_IDS.map((id) => readLegalDocument(id)));
}

export function getOpsApprovalReaderMarkdown(markdown: string): string {
  return stripMarkdownSections(
    removeFirstHeading(markdown),
    shouldOmitInternalLegalHeading,
  );
}

export function getPublicLegalMarkdown(markdown: string): string {
  return stripMarkdownSections(
    removeFirstHeading(markdown),
    shouldOmitInternalLegalHeading,
  );
}
