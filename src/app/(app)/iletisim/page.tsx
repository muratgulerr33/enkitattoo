import type { Metadata } from "next";
import type { ComponentType } from "react";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import {
  IconGoogleMaps,
  IconInstagram,
  IconPhoneCall,
  IconTelegram,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/nandd";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import {
  INSTAGRAM_URL,
  PHONE_TEL_URL,
  TELEGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";
import { SITE_INFO } from "@/lib/site-info";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-jsonld";
import { Clock3, MapPin, Navigation, Phone } from "lucide-react";

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
  { label: "WhatsApp", href: WHATSAPP_URL, icon: IconWhatsApp, external: true },
  { label: "Instagram", href: INSTAGRAM_URL, icon: IconInstagram, external: true },
  { label: "Telegram", href: TELEGRAM_URL, icon: IconTelegram, external: true },
  { label: "YouTube", href: YOUTUBE_URL, icon: IconYouTube, external: true },
  {
    label: "Google Maps",
    href: SITE_INFO.googleMapsUrl,
    icon: IconGoogleMaps,
    external: true,
  },
];

const contactActionClass =
  "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-foreground transition-[transform,background-color,color,box-shadow] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const iconActionClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/80 text-foreground/75 transition-[transform,background-color,color] duration-150 hover:bg-muted/50 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:active:bg-white/15";

export default function IletisimPage() {
  const shortDescription =
    iletisimContent?.shortDescription ||
    iletisimContent?.description ||
    "Adres, çalışma saatleri ve hızlı iletişim için bize ulaşın.";
  const longDescription =
    iletisimContent?.description && iletisimContent.description !== shortDescription
      ? iletisimContent.description
      : null;

  return (
    <div className="app-section no-overflow-x">
      <BreadcrumbListJsonLd path="/iletisim" />
      <LocalBusinessJsonLd />

      <header className="space-y-2">
        {iletisimContent?.microLine ? (
          <p className="t-small text-muted-foreground">{iletisimContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{iletisimContent?.h1 || "İletişim"}</h1>
        <p className="t-muted">{shortDescription}</p>
        {longDescription ? <p className="t-muted">{longDescription}</p> : null}
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <article className="min-w-0 rounded-2xl border border-border bg-surface-2 p-4 shadow-soft sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{SITE_INFO.name}</h2>

          <dl className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <dt className="font-medium text-foreground">Adres</dt>
                <dd>{SITE_INFO.addressText}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <dt className="font-medium text-foreground">Çalışma saatleri</dt>
                <dd>{SITE_INFO.openingHours.weekdayLabel}</dd>
                <dd>{SITE_INFO.openingHours.sundayLabel}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div className="min-w-0">
                <dt className="font-medium text-foreground">Telefon</dt>
                <dd>
                  <a
                    href={PHONE_TEL_URL}
                    className="inline-flex min-h-11 items-center rounded-md py-1 text-foreground/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 truncate">{SITE_INFO.phoneDisplay}</span>
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a
              href={PHONE_TEL_URL}
              className={`${contactActionClass} col-span-2 bg-muted/65 hover:bg-muted`}
            >
              <Phone className="size-4" aria-hidden />
              <span className="min-w-0 truncate">Ara</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${contactActionClass} bg-primary text-primary-foreground hover:bg-primary/90`}
            >
              <span className="min-w-0 truncate">WhatsApp</span>
            </a>
            <a
              href={SITE_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${contactActionClass} border border-border bg-background hover:bg-muted/45 dark:hover:bg-white/10`}
            >
              <Navigation className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">Yol tarifi</span>
            </a>
          </div>
        </article>

        <article className="mt-3 rounded-2xl border border-border bg-surface-2 p-3 shadow-soft sm:p-4 xl:mt-0">
          <div className="relative min-h-[260px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/20 aspect-[16/9]">
            <iframe
              src={SITE_INFO.googleMapsEmbedSrc}
              title={`${SITE_INFO.name} harita konumu`}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={SITE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${contactActionClass} mt-3 w-full border border-border bg-background hover:bg-muted/45 dark:hover:bg-white/10`}
          >
            Haritada aç
          </a>
        </article>
      </section>

      <section
        className="rounded-2xl border border-border bg-surface-2 p-4 shadow-soft"
        aria-label="Sosyal ve iletişim bağlantıları"
      >
        <p className="mb-3 text-sm font-semibold text-foreground">Sosyal / İletişim</p>
        <ul className="flex flex-wrap gap-2">
          {SOCIAL_CONTACT_LINKS.map(({ label, href, icon: Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                className={iconActionClass}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon size={20} />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
