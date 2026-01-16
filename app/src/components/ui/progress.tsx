"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", showLabel, ...props }, ref) => {
  const variants = {
    default: "bg-[var(--color-primary)]",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    error: "bg-[var(--color-error)]",
  };

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-[var(--background-elevated)]",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel ? <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--foreground-secondary)] ml-2">
          {value}%
        </span> : null}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
