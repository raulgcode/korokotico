import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border-2 border-input bg-card px-4 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "file:mr-3 file:inline-flex file:h-7 file:rounded-full file:border-0 file:bg-accent file:px-3 file:text-xs file:font-bold file:text-accent-foreground",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
