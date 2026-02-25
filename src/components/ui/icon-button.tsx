"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

type IconButtonProps = Omit<React.ComponentProps<"button">, "aria-label"> & {
  ariaLabel: string;
  isActive?: boolean;
  variant?: "ghost" | "solid";
  size?: "md" | "lg";
  asChild?: boolean;
};

const sizeClassMap: Record<NonNullable<IconButtonProps["size"]>, string> = {
  md: "h-11 w-11 min-h-11 min-w-11 [&_svg]:size-5",
  lg: "h-12 w-12 min-h-11 min-w-11 [&_svg]:size-[22px]",
};

const variantClassMap: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost:
    "bg-transparent text-foreground/80 hover:bg-muted/45 hover:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground active:bg-muted/70 dark:active:bg-white/15",
  solid:
    "bg-muted/60 text-foreground/85 shadow-sm hover:bg-muted/80 hover:text-foreground dark:bg-white/10 dark:text-foreground/85 dark:hover:bg-white/15 active:bg-muted dark:active:bg-white/20",
};

const baseClassName =
  "relative inline-flex shrink-0 items-center justify-center rounded-xl outline-none transition-[transform,background-color,color,box-shadow,opacity] duration-150 active:scale-[0.97] after:pointer-events-none after:absolute after:bottom-[3px] after:h-0.5 after:w-4 after:rounded-full after:bg-foreground after:transition-opacity after:duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      ariaLabel,
      isActive = false,
      variant = "ghost",
      size = "md",
      asChild = false,
      className,
      children,
      type,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : "button";

    return (
      <Comp
        ref={ref}
        aria-label={ariaLabel}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(
          baseClassName,
          sizeClassMap[size],
          variantClassMap[variant],
          isActive
            ? "bg-muted/60 text-foreground after:opacity-100 dark:bg-white/12 dark:text-foreground"
            : "after:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
