const HUB_COVER_BY_SLUG: Record<string, string> = {
  "minimal-fine-line-dovme": "/minimal-fine-line-dovme.webp",
  "yazi-isim-dovmesi": "/yazi-isim-dovme.webp",
  "realistik-dovme": "/realistik-dovme.webp",
  "portre-dovme": "/portre-dovme.webp",
  "traditional-dovme": "/traditional-dovme.webp",
  "dovme-kapatma": "/dovme-kapatma.webp",
};

export function getHubCoverSrc(slug: string): string | null {
  return HUB_COVER_BY_SLUG[slug] ?? null;
}

export { HUB_COVER_BY_SLUG };
