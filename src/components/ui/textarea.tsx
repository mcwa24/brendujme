import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bilbord-field bilbord-field-bordered field-sizing-content min-h-40 w-full resize-y px-4 py-3.5 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_20%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
