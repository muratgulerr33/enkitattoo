import {
  IconGoogleMaps,
  IconInstagram,
  IconPhoneCall,
  IconTelegram,
  IconWhatsApp,
  IconYouTube,
} from "@/components/icons/nandd";
import type { ComponentType } from "react";
import {
  GOOGLE_MAPS_BUSINESS_URL,
  INSTAGRAM_URL,
  PHONE_TEL_URL,
  TELEGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/lib/site/links";
import { cn } from "@/lib/utils";

type SocialLinkItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string; title?: string }>;
  external?: boolean;
};

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    label: "Telefon",
    href: PHONE_TEL_URL,
    icon: IconPhoneCall,
  },
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

function footerIconButtonClass() {
  return cn(
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  );
}

export function AppFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-background/70 xl:mt-12">
      <div className="app-container no-overflow-x py-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="t-h5 text-foreground">ENKI Tattoo Studio</p>
            <p className="t-caption mt-1 text-muted-foreground">
              Sosyal hesaplarımızdan bize ulaşabilirsiniz.
            </p>
          </div>

          <nav aria-label="Sosyal bağlantılar">
            <ul className="flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={footerIconButtonClass()}
                    aria-label={label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <Icon size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
