"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label ? <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--foreground-secondary)]"
          >
            {label}
          </label> : null}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-[var(--background-card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-all duration-200 resize-y",
            "border-[var(--border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error ? <p className="text-xs text-[var(--foreground-muted)]">{hint}</p> : null}
        {error ? <p className="text-xs text-[var(--color-error)]">{error}</p> : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
