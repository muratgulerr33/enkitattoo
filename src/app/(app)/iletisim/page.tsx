import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  IconGoogleMaps,
  IconInstagram,
  IconPhoneCall,
  IconTelegram,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/nandd";
import {
  addressLine,
  directionsUrl,
  hoursNote,
  mapsEmbedUrl,
  phoneDisplay,
  studioName,
} from "@/lib/mock/enki";
import {
  GOOGLE_MAPS_BUSINESS_URL,
  INSTAGRAM_URL,
  PHONE_TEL_URL,
  TELEGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import { MapPin } from "lucide-react";

const ILETISIM_PATH = "/iletisim";
const iletisimContent = getRouteContent(ILETISIM_PATH);

export function generateMetadata(): Metadata {
  if (!iletisimContent) {
    return {};
  }

  const metadata: Metadata = {};

  if (iletisimContent.seoTitle) {
    metadata.title = { absolute: iletisimContent.seoTitle };
  }
  if (iletisimContent.seoDescription) {
    metadata.description = iletisimContent.seoDescription;
  }
  if (iletisimContent.canonical) {
    metadata.alternates = { canonical: iletisimContent.canonical };
  }
  if (hasNoIndex(iletisimContent.indexing)) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

type SocialContactLink = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string; title?: string }>;
  external?: boolean;
};

const SOCIAL_CONTACT_LINKS: SocialContactLink[] = [
  { label: "Telefon", href: PHONE_TEL_URL, icon: IconPhoneCall },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    icon: IconWhatsApp,
    external: true,
  },
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: IconInstagram,
    external: true,
  },
  {
    label: "Telegram",
    href: TELEGRAM_URL,
    icon: IconTelegram,
    external: true,
  },
  {
    label: "YouTube",
    href: YOUTUBE_URL,
    icon: IconYouTube,
    external: true,
  },
  {
    label: "Google Maps",
    href: GOOGLE_MAPS_BUSINESS_URL,
    icon: IconGoogleMaps,
    external: true,
  },
];

export default function IletisimPage() {
  const shortDescription =
    iletisimContent?.shortDescription ||
    iletisimContent?.description ||
    "Bize ulaşın, randevu alın.";
  const longDescription =
    iletisimContent?.description &&
    iletisimContent.description !== shortDescription
      ? iletisimContent.description
      : null;

  return (
    <div className="app-section no-overflow-x xl:grid xl:grid-cols-[1fr_360px] xl:gap-8 xl:items-start">
      <div className="space-y-6">
        <header>
          {iletisimContent?.microLine ? (
            <p className="t-small text-muted-foreground">{iletisimContent.microLine}</p>
          ) : null}
          <h1 className="typo-page-title">{iletisimContent?.h1 || "İletişim"}</h1>
          <p className="t-muted mt-1">{shortDescription}</p>
          {longDescription ? <p className="t-muted mt-2">{longDescription}</p> : null}
        </header>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Hızlı Randevu
          </a>
        </Button>

        <section
          className="rounded-lg border border-border bg-surface-2 p-4"
          aria-label="Sosyal ve iletişim bağlantıları"
        >
          <p className="t-small mb-3 text-foreground">Sosyal / İletişim</p>
          <ul className="flex flex-wrap gap-2">
            {SOCIAL_CONTACT_LINKS.map(({ label, href, icon: Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Card className="border-border bg-surface-2">
          <CardHeader>
            <CardTitle className="t-h4">{studioName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 text-foreground">
              <a
                href={PHONE_TEL_URL}
                className="t-body flex items-center gap-2 hover:text-muted-foreground"
              >
                <IconPhoneCall size={20} className="text-muted-foreground" />
                {phoneDisplay}
              </a>
              <div className="t-body flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>{addressLine}</span>
              </div>
              <p className="t-caption text-muted-foreground">{hoursNote}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="default" size="sm" className="shrink-0">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <a href={GOOGLE_MAPS_BUSINESS_URL} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  Yol tarifi al
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border bg-surface-2 xl:sticky xl:top-[calc(env(safe-area-inset-top)+4.5rem)]">
        <CardContent className="p-0">
          <iframe
            src={mapsEmbedUrl}
            title="ENKİ Tattoo Studio harita"
            className="h-64 w-full border-0 md:h-80 xl:h-[400px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </CardContent>
      </Card>
    </div>
  );
}
