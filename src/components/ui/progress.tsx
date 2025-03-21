import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showValue?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showValue = false, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, value), max) / max * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress }; 