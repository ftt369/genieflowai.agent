import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative inline-flex h-5 w-10">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full transition peer-checked:bg-primary peer-checked:border-primary",
            "bg-muted border-2 border-muted-foreground/50",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        />
        <span
          className={cn(
            "absolute inset-0 flex h-full w-full items-center",
            "after:absolute after:h-4 after:w-4 after:rounded-full after:bg-background",
            "after:transition-all peer-checked:after:translate-x-5",
            "after:left-0.5 after:border after:border-muted-foreground/50"
          )}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }; 