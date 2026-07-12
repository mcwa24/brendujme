import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "bilbord-field bilbord-field-bordered h-auto min-h-[48px] w-full min-w-0 px-4 py-3.5 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_20%,transparent)] md:text-base",
        className
      )}
      {...props}
    />
  )
}

export { Input }
