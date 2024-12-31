"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { config: Record<string, { label: string; color: string }> }>(({ className, children, config, ...props }, ref) => (
  <div ref={ref} className={cn("relative", className)} {...props}>
    <style>
      {Object.entries(config).map(
        ([key, value]) => `
          :root {
            --color-${key}: ${value.color};
          }
        `
      )}
    </style>
    {children}
  </div>
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white p-2 rounded-md shadow border border-gray-200 text-sm",
      className
    )}
    {...props}
  />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltipContent }
