"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={className}
      checked={checked}
      onCheckedChange={onCheckedChange}
      ref={ref}
      {...props}
    >
      <SwitchPrimitives.Thumb className="block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitives.Root>
  )
);

Switch.displayName = "Switch"

export { Switch }
