import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme/themeStore';
import { type ColorProfile } from '@/config/theme';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type?: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

function Notification({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
  className
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { profile: themeProfile } = useThemeStore();
  
  // Check if we're using the Office theme profile
  const isOfficeStyle = themeProfile === 'office' as ColorProfile;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    if (isOfficeStyle) {
      // Office-style colors
      switch (type) {
        case 'success':
          return {
            background: 'bg-[#DFF6DD]',
            border: 'border-[#107C10]',
            text: 'text-[#107C10]',
            icon: 'text-[#107C10]'
          };
        case 'error':
          return {
            background: 'bg-[#FDE7E9]',
            border: 'border-[#A80000]',
            text: 'text-[#A80000]',
            icon: 'text-[#A80000]'
          };
        case 'warning':
          return {
            background: 'bg-[#FFF4CE]',
            border: 'border-[#797673]',
            text: 'text-[#797673]',
            icon: 'text-[#797673]'
          };
        case 'info':
        default:
          return {
            background: 'bg-[#EFF6FC]',
            border: 'border-accent',
            text: 'text-accent',
            icon: 'text-accent'
          };
      }
    } else {
      // Default colors
      switch (type) {
        case 'success':
          return {
            background: 'bg-green-50 dark:bg-green-950/30',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: 'text-green-500'
          };
        case 'error':
          return {
            background: 'bg-red-50 dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: 'text-red-500'
          };
        case 'warning':
          return {
            background: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-800 dark:text-amber-200',
            icon: 'text-amber-500'
          };
        case 'info':
        default:
          return {
            background: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: 'text-blue-500'
          };
      }
    }
  };

  const colors = getColors();

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        "top-4 right-4 max-w-sm w-full",
        "shadow-lg rounded-lg border pointer-events-auto",
        colors.background,
        colors.border,
        isOfficeStyle ? "border-l-4" : "border",
        className
      )}
    >
      <div className={cn(
        "flex items-start gap-3 p-4",
        isOfficeStyle && "px-3 py-2.5"
      )}>
        <div className={cn(
          "shrink-0 mt-0.5",
          colors.icon
        )}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium",
            isOfficeStyle ? "text-sm" : "text-base",
            colors.text
          )}>
            {title}
          </h3>
          {message && (
            <p className={cn(
              "mt-1 text-sm",
              isOfficeStyle ? "text-muted-foreground" : "text-foreground/80"
            )}>
              {message}
            </p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className={cn(
            "shrink-0 h-6 w-6 rounded-full flex items-center justify-center",
            isOfficeStyle 
              ? "hover:bg-foreground/10 text-muted-foreground hover:text-foreground" 
              : "hover:bg-foreground/10 text-foreground/50 hover:text-foreground",
            "transition-colors"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

function useNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    props: NotificationProps;
  }>>([]);

  const show = (props: Omit<NotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, props: { ...props, onClose: () => dismiss(id) } }]);
    return id;
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationsContainer = () => (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none flex flex-col items-end">
      {notifications.map(({ id, props }) => (
        <Notification key={id} {...props} />
      ))}
    </div>
  );

  return { show, dismiss, NotificationsContainer };
}

// For compatibility with existing imports
const NotificationContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
    {children}
  </div>
);

// Export all the things!
export { Notification, useNotification, NotificationContainer };
export default Notification; 