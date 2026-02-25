import type { LucideIcon } from "lucide-react";
import {
  Circle,
  CircleDot,
  Dot,
  Link2,
  Minus,
  User,
  icons,
} from "lucide-react";

const EarIcon = (icons.Ear as LucideIcon | undefined) ?? Circle;
const SeptumIcon = (icons.CircleDashed as LucideIcon | undefined) ?? Circle;
const CustomIcon = (icons.UserRound as LucideIcon | undefined) ?? User;

export const PIERCING_ICONS: Record<string, LucideIcon> = {
  "/piercing/kulak": EarIcon,
  "/piercing/burun": Dot,
  "/piercing/kas": Minus,
  "/piercing/dudak": Circle,
  "/piercing/gobek": CircleDot,
  "/piercing/septum": SeptumIcon,
  "/piercing/industrial": Link2,
  "/piercing/kisiye-ozel": CustomIcon,
};

function normalizePiercingSlug(slug: string): string {
  const trimmed = slug.trim();
  if (!trimmed) {
    return "";
  }

  const segments = trimmed.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (segments.length === 0) {
    return "";
  }

  const piercingIndex = segments.indexOf("piercing");
  if (piercingIndex >= 0) {
    const categorySegment = segments[piercingIndex + 1];
    return categorySegment ? `/piercing/${categorySegment.toLowerCase()}` : "/piercing";
  }

  if (segments.length === 1) {
    return `/piercing/${segments[0].toLowerCase()}`;
  }

  return `/${segments.map((segment) => segment.toLowerCase()).join("/")}`;
}

export function getPiercingIcon(slug: string): LucideIcon {
  const normalizedSlug = normalizePiercingSlug(slug);
  return PIERCING_ICONS[normalizedSlug] ?? CircleDot;
}
