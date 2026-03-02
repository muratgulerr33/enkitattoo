import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { BreadcrumbListJsonLd } from "@/components/seo/breadcrumb-list-jsonld";
import { getRouteContent, hasNoIndex } from "@/lib/route-content";
import {
  PHONE_TEL_URL,
  WHATSAPP_URL,
} from "@/lib/site/links";
import { SITE_INFO } from "@/lib/site-info";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-jsonld";
import { SocialIconsRow } from "@/components/app/social-icons-row";
import { ExternalLink } from "@/components/ui/external-link";
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

const contactActionClass =
  "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-medium text-foreground transition-[transform,background-color,color,box-shadow] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default async function IletisimPage() {
  const t = await getTranslations();
  const shortDescription =
    t("pages.contact.shortDescription");
  const longDescription =
    iletisimContent?.description && iletisimContent.description !== shortDescription
      ? iletisimContent.description
      : null;

  return (
    <div className="app-section no-overflow-x pb-[calc(env(safe-area-inset-bottom)+96px)] sm:pb-0">
      <BreadcrumbListJsonLd path="/iletisim" />
      <LocalBusinessJsonLd />

      <header className="space-y-2">
        {iletisimContent?.microLine ? (
          <p className="t-small text-muted-foreground">{iletisimContent.microLine}</p>
        ) : null}
        <h1 className="typo-page-title">{t("pages.contact.heading")}</h1>
        <p className="t-muted">{shortDescription}</p>
        {longDescription ? <p className="t-muted">{longDescription}</p> : null}
        <SocialIconsRow className="mt-3" />
      </header>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <article className="min-w-0 rounded-2xl border border-border bg-surface-2 p-4 shadow-soft sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{SITE_INFO.name}</h2>

          <dl className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <dt className="font-medium text-foreground">{t("pages.contact.addressLabel")}</dt>
                <dd>{SITE_INFO.addressText}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <dt className="font-medium text-foreground">{t("pages.contact.hoursLabel")}</dt>
                <dd>{t("pages.contact.weekdayHours")}</dd>
                <dd>{t("pages.contact.sundayHours")}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-foreground/70" aria-hidden />
              <div className="min-w-0">
                <dt className="font-medium text-foreground">{t("pages.contact.phoneLabel")}</dt>
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

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={PHONE_TEL_URL}
              className={`${contactActionClass} bg-muted/65 hover:bg-muted sm:col-span-2`}
            >
              <Phone className="size-4" aria-hidden />
              <span className="min-w-0 truncate">{t("common.searchCall")}</span>
            </a>
            <ExternalLink
              href={WHATSAPP_URL}
              className={`${contactActionClass} bg-primary text-primary-foreground hover:bg-primary/90`}
            >
              <span className="min-w-0 truncate">{t("common.social.whatsapp")}</span>
            </ExternalLink>
            <ExternalLink
              href={SITE_INFO.googleMapsUrl}
              className={`${contactActionClass} border border-border bg-background hover:bg-muted/45 dark:hover:bg-white/10`}
            >
              <Navigation className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">{t("common.directions")}</span>
            </ExternalLink>
          </div>
        </article>

        <article className="mt-3 rounded-2xl border border-border bg-surface-2 p-3 shadow-soft sm:p-4 xl:mt-0">
          <div className="relative min-h-[260px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/20 aspect-[16/9]">
            <iframe
              src={SITE_INFO.googleMapsEmbedSrc}
              title={t("pages.contact.mapTitle", { site: SITE_INFO.name })}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <ExternalLink
            href={SITE_INFO.googleMapsUrl}
            className={`${contactActionClass} mt-3 w-full border border-border bg-background hover:bg-muted/45 dark:hover:bg-white/10`}
          >
            <span className="min-w-0 truncate">{t("common.openInMap")}</span>
          </ExternalLink>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-surface-2 p-4 shadow-soft">
        <p className="text-sm font-semibold text-foreground">{t("common.nav.knowledgeBase")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("sss.teaser.description")}
        </p>
        <Link
          href="/sss"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-[transform,background-color,color] duration-150 hover:bg-muted/45 active:scale-[0.99] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("common.nav.questionBank")}
        </Link>
      </section>

    </div>
  );
}
