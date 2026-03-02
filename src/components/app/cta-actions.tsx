import type { ComponentType, MouseEventHandler } from "react";
import { Link } from "@/i18n/navigation";
import { IconPhoneCall, IconWhatsApp } from "@/components/icons/nandd";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import { PHONE_TEL_URL, WHATSAPP_URL } from "@/lib/site/links";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize =
  | "default"
  | "cta"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";
type IconComponent = ComponentType<{ className?: string; size?: number }>;

type BaseCtaProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type IconCtaProps = BaseCtaProps & {
  href: string;
  icon: IconComponent;
  mode?: "route" | "external" | "phone";
};

function CtaContent({
  icon: Icon,
  label,
  iconClassName,
}: {
  icon: IconComponent;
  label: string;
  iconClassName?: string;
}) {
  return (
    <>
      <Icon className={iconClassName ?? "size-4 shrink-0"} aria-hidden />
      <span className="leading-none">{label}</span>
    </>
  );
}

function CtaButton({
  href,
  icon,
  label,
  variant = "default",
  size = "cta",
  className = "w-full sm:w-auto",
  contentClassName = "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  iconClassName,
  onClick,
  mode = "external",
}: IconCtaProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      {mode === "external" ? (
        <ExternalLink href={href} onClick={onClick} className={contentClassName}>
          <CtaContent icon={icon} label={label} iconClassName={iconClassName} />
        </ExternalLink>
      ) : mode === "phone" ? (
        <a href={href} onClick={onClick} className={contentClassName}>
          <CtaContent icon={icon} label={label} iconClassName={iconClassName} />
        </a>
      ) : (
        <Link href={href} onClick={onClick} className={contentClassName}>
          <CtaContent icon={icon} label={label} iconClassName={iconClassName} />
        </Link>
      )}
    </Button>
  );
}

export function IconExternalCta(props: IconCtaProps) {
  return <CtaButton {...props} mode="external" />;
}

export function IconPhoneCta(props: IconCtaProps) {
  return <CtaButton variant="outline" {...props} mode="phone" />;
}

export function IconRouteCta(props: IconCtaProps) {
  return <CtaButton variant="outline" {...props} mode="route" />;
}

export function WhatsAppCta({
  href = WHATSAPP_URL,
  label,
  variant = "default",
  size = "cta",
  className = "w-full sm:w-auto",
  contentClassName,
  iconClassName,
  onClick,
}: BaseCtaProps & { href?: string }) {
  return (
    <IconExternalCta
      href={href}
      icon={IconWhatsApp}
      label={label}
      variant={variant}
      size={size}
      className={className}
      contentClassName={contentClassName}
      iconClassName={iconClassName}
      onClick={onClick}
    />
  );
}

export function PhoneCta({
  href = PHONE_TEL_URL,
  label,
  variant = "outline",
  size = "cta",
  className = "w-full sm:w-auto",
  contentClassName,
  iconClassName,
  onClick,
}: BaseCtaProps & { href?: string }) {
  return (
    <IconPhoneCta
      href={href}
      icon={IconPhoneCall}
      label={label}
      variant={variant}
      size={size}
      className={className}
      contentClassName={contentClassName}
      iconClassName={iconClassName}
      onClick={onClick}
    />
  );
}
