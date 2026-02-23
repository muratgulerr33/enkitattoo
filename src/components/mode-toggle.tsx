"use client";

import { useSyncExternalStore } from "react";
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
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Laptop },
] as const;

export function ModeToggle({
  className,
  variant = "outline",
  size = "icon",
  align = "end",
  withLabel = false,
}: ModeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const selectedTheme = mounted ? theme ?? "system" : "system";
  const ActiveIcon = !mounted ? Laptop : resolvedTheme === "dark" ? Moon : Sun;
  const activeLabel = !mounted
    ? "System"
    : theme === "system"
      ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
      : theme === "dark"
        ? "Dark"
        : "Light";

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
            <span className="sr-only">Toggle theme</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40">
        {OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <Icon className="size-4" />
            <span>{label}</span>
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
