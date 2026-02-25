import Link from "next/link";
import type { ComponentType } from "react";
import {
  IconGoogleMaps,
  IconInstagram,
  IconPhoneCall,
  IconTelegram,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/nandd";
import {
  INSTAGRAM_URL,
  PHONE_TEL_URL,
  TELEGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";
import { SITE_INFO } from "@/lib/site-info";
import { cn } from "@/lib/utils";

type SocialLinkItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string; title?: string }>;
  external?: boolean;
};

const SOCIAL_LINKS: SocialLinkItem[] = [
  { label: "Telefon", href: PHONE_TEL_URL, icon: IconPhoneCall },
  { label: "WhatsApp", href: WHATSAPP_URL, icon: IconWhatsApp, external: true },
  { label: "Instagram", href: INSTAGRAM_URL, icon: IconInstagram, external: true },
  { label: "Telegram", href: TELEGRAM_URL, icon: IconTelegram, external: true },
  { label: "YouTube", href: YOUTUBE_URL, icon: IconYouTube, external: true },
  { label: "Google Maps", href: SITE_INFO.googleMapsUrl, icon: IconGoogleMaps, external: true },
];

const textActionClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground/85 transition-[transform,background-color,color] duration-150 hover:bg-muted/45 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:active:bg-white/15";
const iconActionClass = cn(
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/70 text-foreground/75 transition-[transform,background-color,color] duration-150",
  "hover:bg-muted/45 hover:text-foreground active:scale-[0.98] active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "dark:hover:bg-white/10 dark:active:bg-white/15"
);

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-background/85 xl:mt-12">
      <div className="app-container no-overflow-x py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_auto_auto]">
          <section className="min-w-0 space-y-3">
            <Link
              href="/"
              aria-label={`${SITE_INFO.name} ana sayfa`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-2 text-foreground transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/50 text-sm font-semibold">
                E
              </span>
              <span className="text-sm font-semibold tracking-tight">{SITE_INFO.name}</span>
            </Link>

            <p className="text-sm text-muted-foreground">{SITE_INFO.addressText}</p>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{SITE_INFO.openingHours.weekdayLabel}</p>
              <p>{SITE_INFO.openingHours.sundayLabel}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href={PHONE_TEL_URL} aria-label="Telefon ile ara" className={textActionClass}>
                <IconPhoneCall size={18} />
                {SITE_INFO.phoneDisplay}
              </a>
              <a
                href={SITE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps üzerinde aç"
                className={textActionClass}
              >
                Haritada aç
              </a>
            </div>
          </section>

          <section aria-label="Sosyal bağlantılar" className="min-w-0">
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Sosyal
            </p>
            <ul className="flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={iconActionClass}
                    aria-label={label}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <Icon size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="min-w-0 self-end text-sm text-muted-foreground xl:text-right">
            <p className="font-medium text-foreground/90">© {currentYear} Enki Tattoo Studio</p>
            <p>Tüm hakları saklıdır.</p>
          </section>
        </div>
      </div>
    </footer>
  );
}
