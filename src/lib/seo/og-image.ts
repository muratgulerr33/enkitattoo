import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site/base-url";

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, SITE_URL).toString();
}

export function applyCoverOgImage(
  metadata: Metadata,
  coverSrc: string,
  title: string,
): void {
  const absoluteCoverUrl = toAbsoluteUrl(coverSrc);

  metadata.openGraph = {
    ...metadata.openGraph,
    images: [
      {
        url: absoluteCoverUrl,
        alt: title,
      },
    ],
  };

  if (metadata.twitter) {
    metadata.twitter = {
      ...metadata.twitter,
      images: [absoluteCoverUrl],
    };
    return;
  }

  metadata.twitter = {
    card: "summary_large_image",
    images: [absoluteCoverUrl],
  };
}
