"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./utils";

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  className?: string;
  defaultValue?: number[] | number;
  value?: number[] | number;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, defaultValue, value, min = 0, max = 100, step = 1, ...props }, ref) => {
  // Normalize values to always be arrays for consistent rendering
  const normalizedValue = React.useMemo(() => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(defaultValue)) return defaultValue;
    if (value !== undefined) return [value];
    if (defaultValue !== undefined) return [defaultValue];
    return [min];
  }, [value, defaultValue, min]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      defaultValue={
        Array.isArray(defaultValue)
          ? defaultValue
          : defaultValue !== undefined
            ? [defaultValue]
            : [min]
      }
      value={
        Array.isArray(value)
          ? value
          : value !== undefined
            ? [value]
            : undefined
      }
      min={min}
      max={max}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary rounded-full" />
      </SliderPrimitive.Track>
      {normalizedValue.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background",
            "ring-offset-background transition-colors focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "hover:bg-accent cursor-pointer shadow-sm"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
