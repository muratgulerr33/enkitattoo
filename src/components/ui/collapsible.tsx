"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "@/lib/utils"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex min-h-11 w-full items-center gap-3 rounded-md py-3 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  children,
  forceMount,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Content>, "forceMount"> & {
  forceMount?: boolean
}) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      forceMount={forceMount ? true : undefined}
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
      {...props}
    >
      <div className={cn("pt-1 pb-4", className)}>{children}</div>
    </CollapsiblePrimitive.Content>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
