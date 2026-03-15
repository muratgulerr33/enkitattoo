"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FOOTER_LEGAL_LINKS } from "@/lib/legal/legal-registry";
import {
  FOOTER_QUICK_LINKS,
  GOOGLE_MAPS_BUSINESS_URL,
  HOME_URL,
} from "@/lib/site/links";
import { SocialIconsRow } from "@/components/app/social-icons-row";
import { ExternalLink } from "@/components/ui/external-link";
import { SITE_INFO } from "@/lib/site-info";
import { cn } from "@/lib/utils";

const textActionClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground/85 transition-[transform,background-color,color] duration-150 hover:bg-muted/45 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SiteFooter() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-background/85 xl:mt-12">
      <div className="app-container no-overflow-x py-6 xl:py-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_auto_auto]">
          <section className="min-w-0 space-y-2">
            <Link
              href={HOME_URL}
              aria-label={t("footer.homeAria", { site: SITE_INFO.name })}
              className="inline-flex min-h-11 items-center rounded-lg pr-2 text-base font-semibold leading-tight tracking-tight text-foreground transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="truncate">{SITE_INFO.name}</span>
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground">{SITE_INFO.addressText}</p>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{t("footer.weekdayHours")}</p>
              <p>{t("footer.sundayHours")}</p>
            </div>

            <div className="mt-1 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
              <ExternalLink
                href={GOOGLE_MAPS_BUSINESS_URL}
                aria-label={t("footer.openOnGoogleMapsAria")}
                title={t("common.openInMap")}
                className={cn(textActionClass, "min-w-0 max-w-full")}
              >
                <span className="truncate">{t("common.openInMap")}</span>
              </ExternalLink>
              {FOOTER_QUICK_LINKS.map(({ labelKey, href }) => (
                <Link
                  key={labelKey}
                  href={href}
                  aria-label={t(labelKey)}
                  title={t(labelKey)}
                  className={cn(textActionClass, "min-w-0 max-w-full")}
                >
                  <span className="truncate">{t(labelKey)}</span>
                </Link>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-foreground">Bilgilendirme</p>
              <div
                aria-label="Bilgilendirme bağlantıları"
                className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"
              >
                {FOOTER_LEGAL_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={cn(textActionClass, "min-w-0 max-w-full justify-start")}
                  >
                    <span className="truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section aria-label={t("footer.socialLinksAria")} className="min-w-0">
            <p className="sr-only">{t("footer.social")}</p>
            <SocialIconsRow />
          </section>

          <section className="min-w-0 self-end text-sm text-muted-foreground xl:text-right">
            <p className="font-medium text-foreground/90">© {currentYear} Enki Tattoo Studio</p>
            <p>{t("footer.rightsReserved")}</p>
          </section>
        </div>
      </div>
    </footer>
  );
}
