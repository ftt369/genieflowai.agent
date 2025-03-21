import * as React from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogContextValue {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({});

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();
  
  const handleClick = () => {
    onOpenChange?.(true);
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }
  
  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function DialogContent({ children, className, ...props }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4",
          "max-h-[85vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        <div className="flex justify-end">
          <button 
            className="rounded-full p-1 hover:bg-accent/50 text-muted-foreground"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
}; 