"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue, formatValue, value, ...props }, ref) => {
  const displayValue = value?.[0] ?? props.defaultValue?.[0] ?? 0;

  return (
    <div className="relative w-full">
      {showValue ? <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--background)] px-3 py-1 rounded-lg text-sm font-semibold">
          {formatValue ? formatValue(displayValue) : displayValue}
        </div> : null}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-[var(--background-elevated)]">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-[var(--color-primary)] bg-[var(--background-card)] shadow-lg transition-all hover:scale-110 hover:shadow-[var(--glow-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
