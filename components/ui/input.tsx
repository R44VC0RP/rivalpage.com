import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full rounded-[24px] corner-squircle border border-transparent bg-muted px-4 py-3 text-base text-foreground font-sans font-bold shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground placeholder:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive/70 aria-invalid:bg-destructive/10 aria-invalid:text-destructive aria-invalid:placeholder:text-destructive/70 aria-invalid:focus-visible:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
