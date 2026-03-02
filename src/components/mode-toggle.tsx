"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ModeToggleProps = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  align?: "start" | "center" | "end";
  withLabel?: boolean;
};

const OPTIONS = [
  { value: "light", labelKey: "theme.light", Icon: Sun },
  { value: "dark", labelKey: "theme.dark", Icon: Moon },
  { value: "system", labelKey: "theme.system", Icon: Laptop },
] as const;

export function ModeToggle({
  className,
  variant = "outline",
  size = "icon",
  align = "end",
  withLabel = false,
}: ModeToggleProps) {
  const t = useTranslations();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const selectedTheme = mounted ? theme ?? "system" : "system";
  const ActiveIcon = !mounted ? Laptop : resolvedTheme === "dark" ? Moon : Sun;
  const activeLabel = !mounted
    ? t("theme.system")
    : theme === "system"
      ? t("theme.systemWithCurrent", {
          current: resolvedTheme === "dark" ? t("theme.dark") : t("theme.light"),
        })
      : theme === "dark"
        ? t("theme.dark")
        : t("theme.light");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(withLabel && "justify-between gap-2 px-3", className)}
        >
          <ActiveIcon className="size-4" />
          {withLabel ? (
            <span className="text-sm">{activeLabel}</span>
          ) : (
            <span className="sr-only">{t("theme.toggleTheme")}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40">
        {OPTIONS.map(({ value, labelKey, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <Icon className="size-4" />
            <span>{t(labelKey)}</span>
            <Check
              className={cn(
                "ml-auto size-4",
                selectedTheme === value ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
