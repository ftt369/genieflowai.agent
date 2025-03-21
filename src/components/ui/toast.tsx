import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => string;
  update: (id: string, toast: Partial<Toast>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000,
      variant: toast.variant ?? 'default',
    };

    setToasts((prev) => [...prev, newToast]);

    const duration = newToast.duration;
    if (duration && duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, []);

  const update = useCallback((id: string, toast: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, show, update, dismiss, clear }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const getIconForVariant = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5" />;
    case 'error':
    case 'destructive':
      return <AlertCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'info':
      return <Info className="h-5 w-5" />;
    default:
      return null;
  }
};

const getClassesForVariant = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'error':
    case 'destructive':
      return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    default:
      return 'bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
  }
};

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const { id, title, description, variant = 'default', action } = toast;
  const icon = getIconForVariant(variant);
  const classes = getClassesForVariant(variant);

  return (
    <div
      className={cn(
        'flex w-full max-w-sm rounded-lg border p-4 shadow-md animate-in slide-in-from-right-full duration-300',
        classes
      )}
    >
      {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{title}</h3>
          <button
            onClick={() => onDismiss(id)}
            className="ml-4 -mt-1 -mr-1 rounded-md p-1 inline-flex text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-h-screen overflow-y-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
};

// For backward compatibility
export const NotificationsContainer = ToastContainer; 