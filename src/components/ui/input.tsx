import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefix && <div className="absolute left-3 flex items-center pointer-events-none">{prefix}</div>}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            prefix && "pl-9",
            suffix && "pr-9",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && <div className="absolute right-3 flex items-center pointer-events-none">{suffix}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input }; 