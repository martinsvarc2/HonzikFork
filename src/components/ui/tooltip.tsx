"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative inline-block">
      {children}
    </div>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipTrigger must be used within a TooltipProvider");
  
  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={() => context.setIsOpen(true)}
      onMouseLeave={() => context.setIsOpen(false)}
      {...props}
    />
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within a TooltipProvider");
  
  if (!context.isOpen) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2",
        "rounded-md border border-zinc-800 bg-zinc-950",
        "px-3 py-1.5 text-sm text-zinc-50 shadow-md",
        className
      )}
      {...props}
    />
  );
});

TooltipContent.displayName = "TooltipContent";

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
}
