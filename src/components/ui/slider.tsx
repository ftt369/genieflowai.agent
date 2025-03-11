import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number[];
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, defaultValue = [50], ...props }, ref) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue[0]}
        className={cn(
          "w-full",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider }; 