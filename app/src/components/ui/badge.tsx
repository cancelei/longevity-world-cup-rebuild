"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20",
        secondary:
          "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20",
        success:
          "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
        warning:
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        error:
          "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20",
        outline:
          "border border-[var(--border)] text-[var(--foreground-secondary)]",
        muted:
          "bg-[var(--background-elevated)] text-[var(--foreground-muted)] border border-[var(--border)]",
        gold:
          "badge-gold font-bold",
        silver:
          "badge-silver font-bold",
        bronze:
          "badge-bronze font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
