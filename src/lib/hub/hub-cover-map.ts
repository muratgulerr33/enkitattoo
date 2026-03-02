const HUB_COVER_BY_SLUG: Record<string, string> = {
  "minimal-fine-line-dovme": "/minimal-fine-line-dovme.webp",
  "yazi-isim-dovmesi": "/yazi-isim-dovme.webp",
  "realistik-dovme": "/realistik-dovme.webp",
  "portre-dovme": "/portre-dovme.webp",
  "traditional-dovme": "/traditional-dovme.webp",
  "dovme-kapatma": "/dovme-kapatma.webp",
  "ataturk-temali-dovme": "/ataturk-temali-dovme.webp",
  "blackwork-dovme": "/blackwork-dovme.webp",
  "kisiye-ozel-dovme-tasarimi": "/kisiye-ozel-dovme-tasarimi.webp",
  "dovme-egitimi": "/dovme-egitimi.webp",
};

export function getHubCoverSrc(slug: string): string | null {
  return HUB_COVER_BY_SLUG[slug] ?? null;
}

export { HUB_COVER_BY_SLUG };
