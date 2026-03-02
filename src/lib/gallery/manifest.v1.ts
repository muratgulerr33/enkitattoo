export type GalleryItemStatus = "draft" | "ready" | "published";

export interface GalleryHubFilterOption {
  value: string;
  label: string;
}

export const galleryHubFilterOptions: GalleryHubFilterOption[] = [
  { value: "minimal-fine-line-dovme", label: "Minimal & Fine Line" },
  { value: "yazi-isim-dovmesi", label: "Yazı & İsim" },
  { value: "realistik-dovme", label: "Realistik Dövme" },
  { value: "traditional-dovme", label: "Old School / Traditional" },
  { value: "dovme-kapatma", label: "Kapatma / Cover Up" },
  { value: "ataturk-temali-dovme", label: "Atatürk" },
  { value: "blacwork-dovme", label: "Blackwork" },
  { value: "kisiye-ozel-tasarim", label: "Kişiye Özel Tasarım" },
  { value: "portre", label: "Portre" },
  { value: "piercing", label: "Piercing" },
];

const galleryHubValues = new Set(galleryHubFilterOptions.map((option) => option.value));

const galleryHubAliases: Record<string, string> = {
  "blackwork-dovme": "blacwork-dovme",
  "kisiye-ozel-dovme-tasarimi": "kisiye-ozel-tasarim",
  "portre-dovme": "portre",
};

export function normalizeGalleryHubValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = galleryHubAliases[value] ?? value;
  return galleryHubValues.has(normalized) ? normalized : null;
}

export function isValidGalleryHubValue(value: string): boolean {
  return normalizeGalleryHubValue(value) !== null;
}

export function toGalleryHubParam(hubSlug: string): string | null {
  return normalizeGalleryHubValue(hubSlug);
}

interface GalleryManifestBaseItem {
  id: string;
  hub: string;
  src: string;
  title: string;
}

type GalleryManifestDraftItem = GalleryManifestBaseItem & {
  status: "draft";
  alt?: string;
};

type GalleryManifestVisibleItem = GalleryManifestBaseItem & {
  status: "ready" | "published";
  alt: string;
};

export type GalleryManifestItem = GalleryManifestDraftItem | GalleryManifestVisibleItem;
export type GalleryVisibleItem = GalleryManifestVisibleItem;

export const galleryManifest: GalleryManifestItem[] = [
  { id: "g0001", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0001.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #1", alt: "Atatürk temalı dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0002", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0002.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #2", alt: "Atatürk temalı dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0003", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0003.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #3", alt: "Atatürk temalı dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0004", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0004.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #4", alt: "Atatürk temalı dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0005", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0005.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #5", alt: "Atatürk temalı dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0006", src: "/gallery/ataturk-temali-dovme/ataturk-temali-dovme-0006.webp", hub: "ataturk-temali-dovme", title: "Atatürk Temalı #6", alt: "Atatürk temalı dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0007", src: "/gallery/blacwork-dovme/blacwork-dovme-0001.webp", hub: "blacwork-dovme", title: "Blackwork #1", alt: "Blackwork dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0008", src: "/gallery/blacwork-dovme/blacwork-dovme-0002.webp", hub: "blacwork-dovme", title: "Blackwork #2", alt: "Blackwork dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0009", src: "/gallery/blacwork-dovme/blacwork-dovme-0003.webp", hub: "blacwork-dovme", title: "Blackwork #3", alt: "Blackwork dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0010", src: "/gallery/blacwork-dovme/blacwork-dovme-0004.webp", hub: "blacwork-dovme", title: "Blackwork #4", alt: "Blackwork dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0011", src: "/gallery/blacwork-dovme/blacwork-dovme-0005.webp", hub: "blacwork-dovme", title: "Blackwork #5", alt: "Blackwork dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0012", src: "/gallery/blacwork-dovme/blacwork-dovme-0006.webp", hub: "blacwork-dovme", title: "Blackwork #6", alt: "Blackwork dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0013", src: "/gallery/blacwork-dovme/blacwork-dovme-0007.webp", hub: "blacwork-dovme", title: "Blackwork #7", alt: "Blackwork dövme tasarımı – örnek 7", status: "ready" },
  { id: "g0014", src: "/gallery/blacwork-dovme/blacwork-dovme-0008.webp", hub: "blacwork-dovme", title: "Blackwork #8", alt: "Blackwork dövme tasarımı – örnek 8", status: "ready" },
  { id: "g0015", src: "/gallery/blacwork-dovme/blacwork-dovme-0009.webp", hub: "blacwork-dovme", title: "Blackwork #9", alt: "Blackwork dövme tasarımı – örnek 9", status: "ready" },
  { id: "g0016", src: "/gallery/dovme-kapatma/dovme-kapatma-0001.webp", hub: "dovme-kapatma", title: "Cover Up #1", alt: "Dövme kapatma tasarımı – örnek 1", status: "ready" },
  { id: "g0017", src: "/gallery/dovme-kapatma/dovme-kapatma-0002.webp", hub: "dovme-kapatma", title: "Cover Up #2", alt: "Dövme kapatma tasarımı – örnek 2", status: "ready" },
  { id: "g0018", src: "/gallery/dovme-kapatma/dovme-kapatma-0003.webp", hub: "dovme-kapatma", title: "Cover Up #3", alt: "Dövme kapatma tasarımı – örnek 3", status: "ready" },
  { id: "g0019", src: "/gallery/dovme-kapatma/dovme-kapatma-0004.webp", hub: "dovme-kapatma", title: "Cover Up #4", alt: "Dövme kapatma tasarımı – örnek 4", status: "ready" },
  { id: "g0020", src: "/gallery/dovme-kapatma/dovme-kapatma-0005.webp", hub: "dovme-kapatma", title: "Cover Up #5", alt: "Dövme kapatma tasarımı – örnek 5", status: "ready" },
  { id: "g0021", src: "/gallery/dovme-kapatma/dovme-kapatma-0006.webp", hub: "dovme-kapatma", title: "Cover Up #6", alt: "Dövme kapatma tasarımı – örnek 6", status: "ready" },
  { id: "g0022", src: "/gallery/dovme-kapatma/dovme-kapatma-0007.webp", hub: "dovme-kapatma", title: "Cover Up #7", alt: "Dövme kapatma tasarımı – örnek 7", status: "ready" },
  { id: "g0023", src: "/gallery/dovme-kapatma/dovme-kapatma-0008.webp", hub: "dovme-kapatma", title: "Cover Up #8", alt: "Dövme kapatma tasarımı – örnek 8", status: "ready" },
  { id: "g0024", src: "/gallery/dovme-kapatma/dovme-kapatma-0009.webp", hub: "dovme-kapatma", title: "Cover Up #9", alt: "Dövme kapatma tasarımı – örnek 9", status: "ready" },
  { id: "g0025", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0001.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #1", alt: "Kişiye özel dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0026", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0002.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #2", alt: "Kişiye özel dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0027", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0003.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #3", alt: "Kişiye özel dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0028", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0004.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #4", alt: "Kişiye özel dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0029", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0005.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #5", alt: "Kişiye özel dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0030", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0006.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #6", alt: "Kişiye özel dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0031", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0007.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #7", alt: "Kişiye özel dövme tasarımı – örnek 7", status: "ready" },
  { id: "g0032", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0008.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #8", alt: "Kişiye özel dövme tasarımı – örnek 8", status: "ready" },
  { id: "g0033", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0009.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #9", alt: "Kişiye özel dövme tasarımı – örnek 9", status: "ready" },
  { id: "g0034", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0010.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #10", alt: "Kişiye özel dövme tasarımı – örnek 10", status: "ready" },
  { id: "g0035", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0011.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #11", alt: "Kişiye özel dövme tasarımı – örnek 11", status: "ready" },
  { id: "g0036", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0012.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #12", alt: "Kişiye özel dövme tasarımı – örnek 12", status: "ready" },
  { id: "g0037", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0013.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #13", alt: "Kişiye özel dövme tasarımı – örnek 13", status: "ready" },
  { id: "g0038", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0014.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #14", alt: "Kişiye özel dövme tasarımı – örnek 14", status: "ready" },
  { id: "g0039", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0015.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #15", alt: "Kişiye özel dövme tasarımı – örnek 15", status: "ready" },
  { id: "g0040", src: "/gallery/kisiye-ozel-tasarim/kisiye-ozel-tasarim-0016.webp", hub: "kisiye-ozel-tasarim", title: "Kişiye Özel Tasarım #16", alt: "Kişiye özel dövme tasarımı – örnek 16", status: "ready" },
  { id: "g0041", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0001.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #1", alt: "Minimal fine line dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0042", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0002.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #2", alt: "Minimal fine line dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0043", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0003.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #3", alt: "Minimal fine line dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0044", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0004.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #4", alt: "Minimal fine line dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0045", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0005.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #5", alt: "Minimal fine line dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0046", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0006.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #6", alt: "Minimal fine line dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0047", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0007.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #7", alt: "Minimal fine line dövme tasarımı – örnek 7", status: "ready" },
  { id: "g0048", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0008.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #8", alt: "Minimal fine line dövme tasarımı – örnek 8", status: "ready" },
  { id: "g0049", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0009.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #9", alt: "Minimal fine line dövme tasarımı – örnek 9", status: "ready" },
  { id: "g0050", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0010.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #10", alt: "Minimal fine line dövme tasarımı – örnek 10", status: "ready" },
  { id: "g0051", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0011.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #11", alt: "Minimal fine line dövme tasarımı – örnek 11", status: "ready" },
  { id: "g0052", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0012.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #12", alt: "Minimal fine line dövme tasarımı – örnek 12", status: "ready" },
  { id: "g0053", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0013.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #13", alt: "Minimal fine line dövme tasarımı – örnek 13", status: "ready" },
  { id: "g0054", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0014.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #14", alt: "Minimal fine line dövme tasarımı – örnek 14", status: "ready" },
  { id: "g0055", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0015.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #15", alt: "Minimal fine line dövme tasarımı – örnek 15", status: "ready" },
  { id: "g0056", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0016.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #16", alt: "Minimal fine line dövme tasarımı – örnek 16", status: "ready" },
  { id: "g0057", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0017.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #17", alt: "Minimal fine line dövme tasarımı – örnek 17", status: "ready" },
  { id: "g0058", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0018.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #18", alt: "Minimal fine line dövme tasarımı – örnek 18", status: "ready" },
  { id: "g0059", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0019.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #19", alt: "Minimal fine line dövme tasarımı – örnek 19", status: "ready" },
  { id: "g0060", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0020.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #20", alt: "Minimal fine line dövme tasarımı – örnek 20", status: "ready" },
  { id: "g0061", src: "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0021.webp", hub: "minimal-fine-line-dovme", title: "Minimal Fine Line #21", alt: "Minimal fine line dövme tasarımı – örnek 21", status: "ready" },
  { id: "g0062", src: "/gallery/realistik-dovme/realistik-dovme-0001.webp", hub: "realistik-dovme", title: "Realistik #1", alt: "Realistik dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0063", src: "/gallery/realistik-dovme/realistik-dovme-0002.webp", hub: "realistik-dovme", title: "Realistik #2", alt: "Realistik dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0064", src: "/gallery/realistik-dovme/realistik-dovme-0003.webp", hub: "realistik-dovme", title: "Realistik #3", alt: "Realistik dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0065", src: "/gallery/realistik-dovme/realistik-dovme-0004.webp", hub: "realistik-dovme", title: "Realistik #4", alt: "Realistik dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0066", src: "/gallery/realistik-dovme/realistik-dovme-0005.webp", hub: "realistik-dovme", title: "Realistik #5", alt: "Realistik dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0067", src: "/gallery/realistik-dovme/realistik-dovme-0006.webp", hub: "realistik-dovme", title: "Realistik #6", alt: "Realistik dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0068", src: "/gallery/realistik-dovme/realistik-dovme-0007.webp", hub: "realistik-dovme", title: "Realistik #7", alt: "Realistik dövme tasarımı – örnek 7", status: "ready" },
  { id: "g0069", src: "/gallery/realistik-dovme/realistik-dovme-0008.webp", hub: "realistik-dovme", title: "Realistik #8", alt: "Realistik dövme tasarımı – örnek 8", status: "ready" },
  { id: "g0070", src: "/gallery/realistik-dovme/realistik-dovme-0009.webp", hub: "realistik-dovme", title: "Realistik #9", alt: "Realistik dövme tasarımı – örnek 9", status: "ready" },
  { id: "g0071", src: "/gallery/realistik-dovme/realistik-dovme-0010.webp", hub: "realistik-dovme", title: "Realistik #10", alt: "Realistik dövme tasarımı – örnek 10", status: "ready" },
  { id: "g0072", src: "/gallery/realistik-dovme/realistik-dovme-0011.webp", hub: "realistik-dovme", title: "Realistik #11", alt: "Realistik dövme tasarımı – örnek 11", status: "ready" },
  { id: "g0073", src: "/gallery/realistik-dovme/realistik-dovme-0012.webp", hub: "realistik-dovme", title: "Realistik #12", alt: "Realistik dövme tasarımı – örnek 12", status: "ready" },
  { id: "g0074", src: "/gallery/realistik-dovme/realistik-dovme-0013.webp", hub: "realistik-dovme", title: "Realistik #13", alt: "Realistik dövme tasarımı – örnek 13", status: "ready" },
  { id: "g0075", src: "/gallery/realistik-dovme/realistik-dovme-0014.webp", hub: "realistik-dovme", title: "Realistik #14", alt: "Realistik dövme tasarımı – örnek 14", status: "ready" },
  { id: "g0076", src: "/gallery/traditional-dovme/traditional-dovme-0001.webp", hub: "traditional-dovme", title: "Traditional #1", alt: "Traditional dövme tasarımı – örnek 1", status: "ready" },
  { id: "g0077", src: "/gallery/traditional-dovme/traditional-dovme-0002.webp", hub: "traditional-dovme", title: "Traditional #2", alt: "Traditional dövme tasarımı – örnek 2", status: "ready" },
  { id: "g0078", src: "/gallery/traditional-dovme/traditional-dovme-0003.webp", hub: "traditional-dovme", title: "Traditional #3", alt: "Traditional dövme tasarımı – örnek 3", status: "ready" },
  { id: "g0079", src: "/gallery/traditional-dovme/traditional-dovme-0004.webp", hub: "traditional-dovme", title: "Traditional #4", alt: "Traditional dövme tasarımı – örnek 4", status: "ready" },
  { id: "g0080", src: "/gallery/traditional-dovme/traditional-dovme-0005.webp", hub: "traditional-dovme", title: "Traditional #5", alt: "Traditional dövme tasarımı – örnek 5", status: "ready" },
  { id: "g0081", src: "/gallery/traditional-dovme/traditional-dovme-0006.webp", hub: "traditional-dovme", title: "Traditional #6", alt: "Traditional dövme tasarımı – örnek 6", status: "ready" },
  { id: "g0082", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0001.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #1", alt: "Yazı ve isim dövmesi tasarımı – örnek 1", status: "ready" },
  { id: "g0083", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0002.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #2", alt: "Yazı ve isim dövmesi tasarımı – örnek 2", status: "ready" },
  { id: "g0084", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0003.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #3", alt: "Yazı ve isim dövmesi tasarımı – örnek 3", status: "ready" },
  { id: "g0085", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0004.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #4", alt: "Yazı ve isim dövmesi tasarımı – örnek 4", status: "ready" },
  { id: "g0086", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0005.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #5", alt: "Yazı ve isim dövmesi tasarımı – örnek 5", status: "ready" },
  { id: "g0087", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0006.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #6", alt: "Yazı ve isim dövmesi tasarımı – örnek 6", status: "ready" },
  { id: "g0088", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0007.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #7", alt: "Yazı ve isim dövmesi tasarımı – örnek 7", status: "ready" },
  { id: "g0089", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0008.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #8", alt: "Yazı ve isim dövmesi tasarımı – örnek 8", status: "ready" },
  { id: "g0090", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0009.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #9", alt: "Yazı ve isim dövmesi tasarımı – örnek 9", status: "ready" },
  { id: "g0091", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0010.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #10", alt: "Yazı ve isim dövmesi tasarımı – örnek 10", status: "ready" },
  { id: "g0092", src: "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0011.webp", hub: "yazi-isim-dovmesi", title: "Yazı & İsim #11", alt: "Yazı ve isim dövmesi tasarımı – örnek 11", status: "ready" },
];

const piercingFallbackItems: GalleryVisibleItem[] = [
  { id: "p001", src: "/piercing-hub/kulak/cover.webp", hub: "piercing", title: "Piercing – Kulak", alt: "Kulak piercing örneği", status: "ready" },
  { id: "p002", src: "/piercing-hub/burun/cover.webp", hub: "piercing", title: "Piercing – Burun", alt: "Burun piercing örneği", status: "ready" },
  { id: "p003", src: "/piercing-hub/kas/cover.webp", hub: "piercing", title: "Piercing – Kaş", alt: "Kaş piercing örneği", status: "ready" },
  { id: "p004", src: "/piercing-hub/dudak/cover.webp", hub: "piercing", title: "Piercing – Dudak", alt: "Dudak piercing örneği", status: "ready" },
  { id: "p005", src: "/piercing-hub/dil/cover.webp", hub: "piercing", title: "Piercing – Dil", alt: "Dil piercing örneği", status: "ready" },
  { id: "p006", src: "/piercing-hub/gobek/cover.webp", hub: "piercing", title: "Piercing – Göbek", alt: "Göbek piercing örneği", status: "ready" },
  { id: "p007", src: "/piercing-hub/septum/cover.webp", hub: "piercing", title: "Piercing – Septum", alt: "Septum piercing örneği", status: "ready" },
  { id: "p008", src: "/piercing-hub/industrial/cover.webp", hub: "piercing", title: "Piercing – Industrial", alt: "Industrial piercing örneği", status: "ready" },
  { id: "p009", src: "/piercing-hub/kisiye-ozel/cover.webp", hub: "piercing", title: "Piercing – Kişiye Özel", alt: "Kişiye özel piercing örneği", status: "ready" },
];

const requireAltForVisible = true;

function isGalleryItemVisible(item: GalleryManifestItem): item is GalleryVisibleItem {
  if (item.status === "draft") return false;
  if (requireAltForVisible && (!item.alt || !item.alt.trim())) return false;
  if (normalizeGalleryHubValue(item.hub) !== item.hub) return false;
  return true;
}

export function getVisibleGalleryItems(manifest: GalleryManifestItem[] = galleryManifest): GalleryVisibleItem[] {
  return manifest.filter(isGalleryItemVisible);
}

export function getVisibleGalleryItemsByHub(
  hubValue: string | null | undefined,
  manifest: GalleryManifestItem[] = galleryManifest,
): GalleryVisibleItem[] {
  const normalizedHub = normalizeGalleryHubValue(hubValue);
  const visibleItems = getVisibleGalleryItems(manifest);
  if (!normalizedHub) return visibleItems;
  const filteredItems = visibleItems.filter((item) => item.hub === normalizedHub);
  if (normalizedHub === "piercing" && filteredItems.length === 0) {
    return piercingFallbackItems;
  }
  return filteredItems;
}

export function getGalleryPreviewItems(
  limit = 4,
  manifest: GalleryManifestItem[] = galleryManifest,
): GalleryVisibleItem[] {
  const previewSrcOrder = [
    "/gallery/minimal-fine-line-dovme/minimal-fine-line-dovme-0016.webp",
    "/gallery/dovme-kapatma/dovme-kapatma-0002.webp",
    "/gallery/yazi-isim-dovmesi/yazi-isim-dovmesi-0011.webp",
    "/gallery/realistik-dovme/realistik-dovme-0001.webp",
  ];
  const visibleItems = getVisibleGalleryItems(manifest);
  const orderedPreviewItems = previewSrcOrder
    .map((src) => visibleItems.find((item) => item.src === src))
    .filter((item): item is GalleryVisibleItem => Boolean(item));
  return orderedPreviewItems.slice(0, Math.max(0, limit));
}
