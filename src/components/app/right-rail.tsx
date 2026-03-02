"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconPhoneCall, IconWhatsApp } from "@/components/icons/nandd";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mainHubs } from "@/lib/hub/hubs.v1";
import {
  SITE_INFO,
} from "@/lib/site-info";
import { WHATSAPP_URL } from "@/lib/site/links";
import { Clock, MapPin, Sparkles } from "lucide-react";

/**
 * Right rail for desktop (xl+). Quick actions + popular hubs.
 * On /piercing: also booking CTA + hygiene/aftercare snippet.
 * Only rendered in layout when viewport >= xl (1280px).
 */
export function RightRail() {
  const t = useTranslations();
  const pathname = usePathname();
  const isPiercing = pathname === "/piercing";

  return (
    <aside
      className="flex flex-col gap-6 pt-0"
      aria-label={t("rightRail.aria")}
    >
      {isPiercing && (
        <Card className="border-border bg-surface-2 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="t-h5 text-foreground">
              {t("rightRail.piercing.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild size="cta" className="w-full">
              <ExternalLink
                href={WHATSAPP_URL}
                className="inline-flex items-center gap-2"
              >
                <Sparkles className="size-5 shrink-0" aria-hidden />
                {t("rightRail.piercing.cta")}
              </ExternalLink>
            </Button>
            <div className="t-small rounded-lg border border-border bg-surface-1 p-3 text-muted-foreground">
              <p className="font-medium text-foreground">{t("rightRail.piercing.aftercareTitle")}</p>
              <p className="mt-1">
                {t("rightRail.piercing.aftercareBody")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card className="border-border bg-surface-2 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="t-h5 text-foreground">
            {t("rightRail.quickActions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="cta" className="w-full justify-start gap-3">
            <ExternalLink
              href={WHATSAPP_URL}
              className="inline-flex items-center"
            >
              <IconWhatsApp size={20} />
              {t("common.social.whatsapp")}
            </ExternalLink>
          </Button>
          <Button asChild variant="outline" size="cta" className="w-full justify-start gap-3">
            <Link href="/iletisim" className="inline-flex items-center">
              <IconPhoneCall size={20} />
              {t("common.nav.contact")}
            </Link>
          </Button>
          <div className="t-small flex items-center gap-3 text-muted-foreground">
            <Clock className="size-5 shrink-0" aria-hidden />
            <span>{SITE_INFO.openingHoursText}</span>
          </div>
          <div className="t-small flex items-start gap-3 text-muted-foreground">
            <MapPin className="size-5 shrink-0 mt-0.5" aria-hidden />
            <span>{SITE_INFO.addressText}</span>
          </div>
        </CardContent>
      </Card>

      {/* Popular hubs — 6 quick links */}
      <Card className="border-border bg-surface-2 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="t-h5 text-foreground">
            {t("rightRail.popular.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1">
            {mainHubs.slice(0, 6).map((hub) => (
              <li key={hub.id}>
                <Link
                  href={`/kesfet/${hub.slug}`}
                  className="t-small block rounded-lg px-2 py-2 font-medium text-foreground transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-lg"
                >
                  {t(hub.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <Link href="/kesfet">{t("rightRail.popular.exploreAll")}</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
