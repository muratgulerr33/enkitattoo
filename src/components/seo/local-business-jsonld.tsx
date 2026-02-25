import {
  GOOGLE_MAPS_BUSINESS_URL,
  INSTAGRAM_URL,
  TELEGRAM_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";
import { SITE_URL } from "@/lib/site/base-url";
import { SITE_INFO } from "@/lib/site-info";

const LOCAL_BUSINESS_ID = `${SITE_URL}#tattoo-parlor`;
const WEBSITE_ID = `${SITE_URL}#website`;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TattooParlor",
      "@id": LOCAL_BUSINESS_ID,
      name: SITE_INFO.name,
      alternateName: SITE_INFO.shortName,
      url: SITE_URL,
      telephone: SITE_INFO.phoneE164,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_INFO.address.street,
        addressLocality: SITE_INFO.address.district,
        addressRegion: SITE_INFO.address.city,
        postalCode: SITE_INFO.address.postalCode,
        addressCountry: SITE_INFO.address.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE_INFO.geo.lat,
        longitude: SITE_INFO.geo.lng,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: SITE_INFO.openingHours.weekday,
          opens: SITE_INFO.openingHours.weekdayOpen,
          closes: SITE_INFO.openingHours.weekdayClose,
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: SITE_INFO.openingHours.sunday,
          opens: SITE_INFO.openingHours.sundayOpen,
          closes: SITE_INFO.openingHours.sundayClose,
        },
      ],
      sameAs: [INSTAGRAM_URL, YOUTUBE_URL, TELEGRAM_URL, GOOGLE_MAPS_BUSINESS_URL],
      hasMap: GOOGLE_MAPS_BUSINESS_URL,
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_INFO.name,
      publisher: {
        "@id": LOCAL_BUSINESS_ID,
      },
    },
  ],
} as const;

export function LocalBusinessJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
    />
  );
}
