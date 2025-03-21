import { useState } from 'react';
import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const showToast = ({ title, description, type = 'info', duration = 4000 }: ToastOptions) => {
    switch (type) {
      case 'success':
        return toast.success(description, { duration });
      case 'error':
        return toast.error(description, { duration });
      case 'info':
        return toast(description, { duration });
      case 'warning':
        return toast(description, {
          duration,
          icon: '⚠️',
          style: {
            background: '#FFF7E1',
            color: '#795B00',
          },
        });
      default:
        return toast(description, { duration });
    }
  };

  return { toast: showToast };
} 